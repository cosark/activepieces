import {
    ActionType,
    ActivepiecesError,
    CodeAction,
    StepRunResponse,
    ErrorCode,
    ExecuteActionOperation,
    flowHelper,
    FlowVersion,
    FlowVersionId,
    PieceAction,
    ProjectId,
    Action,
    BranchAction,
    EmptyTrigger,
    TriggerType,
    apId,
    ExecuteFlowOperation,
    ExecutionType,
    EngineResponseStatus,
    ExecutionState,
    BranchStepOutput,
    ExecutionOutputStatus,
    UserId,
    FlowOperationType,
} from '@activepieces/shared'
import { engineHelper } from '../../helper/engine-helper'
import { flowVersionService } from '../flow-version/flow-version.service'
import { fileService } from '../../file/file.service'
import { isNil } from '@activepieces/shared'
import { getServerUrl } from '../../helper/public-ip-utils'
import { sandboxManager } from '../../workers/sandbox'
import { flowService } from '../flow/flow.service'

export const stepRunService = {
    async create({ projectId, flowVersionId, stepName, userId }: CreateParams): Promise<StepRunResponse> {
        const flowVersion = await flowVersionService.getOneOrThrow(flowVersionId)
        const step = flowHelper.getStep(flowVersion, stepName)

        if (isNil(step)) {
            throw new ActivepiecesError({
                code: ErrorCode.STEP_NOT_FOUND,
                params: {
                    stepName,
                },
            })
        }

        switch (step.type) {
            case ActionType.PIECE: {
                return executePiece({ step, flowVersion, projectId, userId })
            }
            case ActionType.CODE: {
                return executeCode({ step, flowVersion, projectId, userId })
            }
            case ActionType.BRANCH: {
                return executeBranch({ step, flowVersion, projectId, userId })
            }
            default: {
                return {
                    success: false,
                    output: 'step not testable',
                    standardError: '',
                    standardOutput: '',
                }
            }
        }
    },
}

async function executePiece({ step, projectId, flowVersion, userId }: ExecuteParams<PieceAction>): Promise<StepRunResponse> {
    const { pieceName, pieceVersion, actionName, input } = step.settings

    if (isNil(actionName)) {
        throw new ActivepiecesError({
            code: ErrorCode.VALIDATION,
            params: {
                message: 'actionName is undefined',
            },
        })
    }

    const operation: ExecuteActionOperation = {
        serverUrl: await getServerUrl(),
        pieceName,
        pieceVersion,
        actionName,
        input,
        flowVersion,
        projectId,
    }

    const { result, standardError, standardOutput } = await engineHelper.executeAction(operation)
    if (result.success) {
        step.settings.inputUiInfo.currentSelectedData = result.output
        await flowService.update({
            userId,
            flowId: flowVersion.flowId,
            projectId,
            request: {
                type: FlowOperationType.UPDATE_ACTION,
                request: step,
            },
        })
    }
    return {
        success: result.success,
        output: result.output,
        standardError,
        standardOutput,
    }
}

async function executeCode({ step, flowVersion, projectId }: ExecuteParams<CodeAction>): Promise<StepRunResponse> {
    const file = await fileService.getOneOrThrow({
        projectId,
        fileId: step.settings.artifactSourceId!,
    })

    const { result, standardError, standardOutput } = await engineHelper.executeCode({
        file,
        step,
        input: step.settings.input,
        flowVersion,
        projectId,
    })
    return {
        success: result.success,
        output: result.output,
        standardError,
        standardOutput,
    }
}

const executeBranch = async ({ step, flowVersion, projectId }: ExecuteParams<BranchAction>): Promise<StepRunResponse> => {
    const branchStep = flowHelper.getStep(flowVersion, step.name)

    if (isNil(branchStep) || branchStep.type !== ActionType.BRANCH) {
        throw new ActivepiecesError({
            code: ErrorCode.STEP_NOT_FOUND,
            params: {
                stepName: step.name,
            },
        })
    }

    delete branchStep.nextAction
    delete branchStep.onFailureAction
    delete branchStep.onSuccessAction

    const testTrigger: EmptyTrigger = {
        name: 'test_branch_step',
        valid: true,
        displayName: 'test branch step',
        nextAction: branchStep,
        type: TriggerType.EMPTY,
        settings: {},
    }

    flowVersion.trigger = testTrigger

    const testInput: ExecuteFlowOperation = {
        executionType: ExecutionType.BEGIN,
        flowRunId: apId(),
        flowVersion,
        projectId,
        serverUrl: await getServerUrl(),
        triggerPayload: {},
    }

    const testSandbox = await sandboxManager.obtainSandbox(apId())
    await testSandbox.recreate()

    const { status, result, standardError, standardOutput } = await engineHelper.executeFlow(testSandbox, testInput)

    if (status !== EngineResponseStatus.OK || result.status !== ExecutionOutputStatus.SUCCEEDED) {
        return {
            success: false,
            output: null,
            standardError,
            standardOutput,
        }
    }

    const branchStepOutput = new ExecutionState(result.executionState).getStepOutput<BranchStepOutput>({
        stepName: branchStep.name,
        ancestors: [],
    })

    if (isNil(branchStepOutput)) {
        return {
            success: false,
            output: null,
            standardError,
            standardOutput,
        }
    }

    return {
        success: true,
        output: branchStepOutput.output,
        standardError,
        standardOutput,
    }
}

type CreateParams = {
    userId: UserId
    projectId: ProjectId
    flowVersionId: FlowVersionId
    stepName: string
}

type ExecuteParams<T extends Action> = {
    step: T
    userId: UserId
    flowVersion: FlowVersion
    projectId: ProjectId
}
