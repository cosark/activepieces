import { Action, ActionType, BranchOperator, FlowOperationRequest, FlowOperationType, FlowVersion, FlowVersionState, PieceTrigger, StepLocationRelativeToParent, Trigger, TriggerType, flowHelper } from "../../src";

const flowVersionWithBranching: FlowVersion = {
    'id': 'pj0KQ7Aypoa9OQGHzmKDl',
    'created': '2023-05-24T00:16:41.353Z',
    'updated': '2023-05-24T00:16:41.353Z',
    'flowId': 'lod6JEdKyPlvrnErdnrGa',
    'displayName': 'Standup Reminder',
    'trigger': {
        'name': 'trigger',
        'type': TriggerType.PIECE,
        'valid': true,
        'settings': {
            'input': {
                'cronExpression': '25 10 * * 0,1,2,3,4',
            },
            'pieceName': 'schedule',
            'inputUiInfo': {

            },
            'triggerName': 'cron_expression',
            'pieceVersion': '0.0.2',
        },
        'nextAction': {
            'name': 'step_1',
            'type': 'BRANCH',
            'valid': true,
            'settings': {
                'conditions': [
                    [
                        {
                            'operator': 'TEXT_CONTAINS',
                            'firstValue': '1',
                            'secondValue': '1',
                        },
                    ],
                ],
            },
            'nextAction': {
                'name': 'step_4',
                'type': 'PIECE',
                'valid': true,
                'settings': {
                    'input': {
                        'key': '1',
                    },
                    'pieceName': 'store',
                    'actionName': 'get',
                    'inputUiInfo': {
                        'customizedInputs': {

                        },
                    },
                    'pieceVersion': '0.2.6',
                },
                'displayName': 'Get',
            },
            'displayName': 'Branch',
            'onFailureAction': {
                'name': 'step_3',
                'type': 'CODE',
                'valid': true,
                'settings': {
                    'input': {

                    },
                    'artifactSourceId': 'pJskIPz1ZL3RYiyUX1HPm',
                },
                'displayName': 'Code',
            },
            'onSuccessAction': {
                'name': 'step_2',
                'type': 'PIECE',
                'valid': true,
                'settings': {
                    'input': {
                        'content': 'MESSAGE',
                        'webhook_url': 'WEBHOOK_URL',
                    },
                    'pieceName': 'discord',
                    'actionName': 'send_message_webhook',
                    'inputUiInfo': {
                        'customizedInputs': {

                        },
                    },
                    'pieceVersion': '0.2.1',
                },
                'displayName': 'Send Message Webhook',
            },
        },
        'displayName': 'Cron Expression',
    },
    'valid': true,
    'state': FlowVersionState.DRAFT,
}
function createCodeAction(name: string): Action {
    return {
        'name': name,
        'displayName': 'Code',
        'type': ActionType.CODE,
        'valid': true,
        'settings': {
            'input': {
            }
        }
    };;
}
const emptyScheduleFlowVersion: FlowVersion = {
    'id': 'pj0KQ7Aypoa9OQGHzmKDl',
    'created': '2023-05-24T00:16:41.353Z',
    'updated': '2023-05-24T00:16:41.353Z',
    'flowId': 'lod6JEdKyPlvrnErdnrGa',
    'displayName': 'Standup Reminder',
    'trigger': {
        'name': 'trigger',
        'type': TriggerType.PIECE,
        'valid': true,
        'settings': {
            'input': {
                'cronExpression': '25 10 * * 0,1,2,3,4',
            },
            'pieceName': 'schedule',
            'inputUiInfo': {

            },
            'triggerName': 'cron_expression',
            'pieceVersion': '0.0.2',
        },
        'displayName': 'Cron Expression',
    },
    'valid': true,
    'state': FlowVersionState.DRAFT,
}

describe('Flow Helper', () => {

    it('should lock a flow', () => {
        const operation: FlowOperationRequest = {
            type: FlowOperationType.LOCK_FLOW,
            request: {
                flowId: flowVersionWithBranching.flowId,
            },
        };
        const result = flowHelper.apply(flowVersionWithBranching, operation);
        expect(result.state).toEqual(FlowVersionState.LOCKED);
    });

    it('should delete branch', () => {
        const operation: FlowOperationRequest = {
            type: FlowOperationType.DELETE_ACTION,
            request: {
                name: flowVersionWithBranching.trigger.nextAction.name,
            },
        };
        const result = flowHelper.apply(flowVersionWithBranching, operation);
        const expectedFlowVersion: FlowVersion = {
            "id": "pj0KQ7Aypoa9OQGHzmKDl",
            "created": "2023-05-24T00:16:41.353Z",
            "updated": "2023-05-24T00:16:41.353Z",
            "flowId": "lod6JEdKyPlvrnErdnrGa",
            "displayName": "Standup Reminder",
            "trigger": {
                "name": "trigger",
                'type': TriggerType.PIECE,
                "valid": true,
                "settings": {
                    "input": {
                        "cronExpression": "25 10 * * 0,1,2,3,4"
                    },
                    "pieceName": "schedule",
                    "inputUiInfo": {},
                    "triggerName": "cron_expression",
                    "pieceVersion": "0.0.2"
                },
                "displayName": "Cron Expression",
                'nextAction': {
                    'name': 'step_4',
                    'type': 'PIECE',
                    'valid': true,
                    'settings': {
                        'input': {
                            'key': '1',
                        },
                        'pieceName': 'store',
                        'actionName': 'get',
                        'inputUiInfo': {
                            'customizedInputs': {

                            },
                        },
                        'pieceVersion': '0.2.6',
                    },
                    'displayName': 'Get',
                }
            },
            "valid": true,
            'state': FlowVersionState.DRAFT,
        }
        expect(result).toEqual(expectedFlowVersion);
    });

    it('should update branch', () => {
        const updateRequest: FlowOperationRequest = {
            type: FlowOperationType.UPDATE_ACTION,
            request: {
                name: 'step_1',
                type: ActionType.BRANCH,
                displayName: 'Branch',
                valid: true,
                settings: {
                    conditions: [
                        [
                            {
                                operator: BranchOperator.TEXT_CONTAINS,
                                firstValue: '1',
                                secondValue: '1',
                            }
                        ]
                    ]
                }
            }
        }
        const updateFlowVersion = flowHelper.apply(flowVersionWithBranching, updateRequest);
        const expectedFlowTrigger: Trigger = {
            "name": "trigger",
            'type': TriggerType.PIECE,
            "valid": true,
            "settings": {
                "input": {
                    "cronExpression": "25 10 * * 0,1,2,3,4"
                },
                "pieceName": "schedule",
                "inputUiInfo": {},
                "triggerName": "cron_expression",
                "pieceVersion": "0.0.2"
            },
            "nextAction": {
                "displayName": "Branch",
                "name": "step_1",
                "valid": true,
                "nextAction": {
                    "name": "step_4",
                    "type": "PIECE",
                    "valid": true,
                    "settings": {
                        "input": {
                            "key": "1"
                        },
                        "pieceName": "store",
                        "actionName": "get",
                        "inputUiInfo": {
                            "customizedInputs": {}
                        },
                        "pieceVersion": "0.2.6"
                    },
                    "displayName": "Get"
                },
                "onFailureAction": {
                    "name": "step_3",
                    "type": "CODE",
                    "valid": true,
                    "settings": {
                        "input": {},
                        "artifactSourceId": "pJskIPz1ZL3RYiyUX1HPm"
                    },
                    "displayName": "Code"
                },
                "onSuccessAction": {
                    "name": "step_2",
                    "type": "PIECE",
                    "valid": true,
                    "settings": {
                        "input": {
                            "content": "MESSAGE",
                            "webhook_url": "WEBHOOK_URL"
                        },
                        "pieceName": "discord",
                        "actionName": "send_message_webhook",
                        "inputUiInfo": {
                            "customizedInputs": {}
                        },
                        "pieceVersion": "0.2.1"
                    },
                    "displayName": "Send Message Webhook"
                },
                "type": "BRANCH",
                "settings": {
                    "conditions": [
                        [
                            {
                                "operator": "TEXT_CONTAINS",
                                "firstValue": "1",
                                "secondValue": "1"
                            }
                        ]
                    ]
                }
            },
            "displayName": "Cron Expression"
        };
        expect(updateFlowVersion.trigger).toEqual(expectedFlowTrigger);
    });

    it('should add branch step with actions', () => {
        const addBranchRequest: FlowOperationRequest = {
            type: FlowOperationType.ADD_ACTION,
            request: {
                parentStep: "trigger",
                action: {
                    name: 'step_1',
                    type: ActionType.BRANCH,
                    displayName: 'Branch',
                    valid: true,
                    settings: {
                        conditions: [
                            [
                                {
                                    operator: BranchOperator.TEXT_CONTAINS,
                                    firstValue: '1',
                                    secondValue: '1',
                                }
                            ]
                        ]
                    }
                }
            }
        }
        const addCodeActionOnTrue: FlowOperationRequest = {
            type: FlowOperationType.ADD_ACTION,
            request: {
                parentStep: "step_1",
                stepLocationRelativeToParent: StepLocationRelativeToParent.INSIDE_TRUE_BRANCH,
                action: createCodeAction('step_2')
            }
        }
        const addCodeActionOnFalse: FlowOperationRequest = {
            type: FlowOperationType.ADD_ACTION,
            request: {
                parentStep: "step_1",
                stepLocationRelativeToParent: StepLocationRelativeToParent.INSIDE_FALSE_BRANCH,
                action: createCodeAction('step_3')
            }
        }
        const addCodeActionOnAfter: FlowOperationRequest = {
            type: FlowOperationType.ADD_ACTION,
            request: {
                parentStep: "step_1",
                stepLocationRelativeToParent: StepLocationRelativeToParent.AFTER,
                action: createCodeAction('step_4')
            }
        }
        let resultFlow = emptyScheduleFlowVersion;
        resultFlow = flowHelper.apply(resultFlow, addBranchRequest);
        resultFlow = flowHelper.apply(resultFlow, addCodeActionOnTrue);
        resultFlow = flowHelper.apply(resultFlow, addCodeActionOnFalse);
        resultFlow = flowHelper.apply(resultFlow, addCodeActionOnAfter);
        const expectedTrigger: Trigger = {
            "name": "trigger",
            "type": TriggerType.PIECE,
            "valid": true,
            "settings": {
                "input": {
                    "cronExpression": "25 10 * * 0,1,2,3,4"
                },
                "pieceName": "schedule",
                "inputUiInfo": {},
                "triggerName": "cron_expression",
                "pieceVersion": "0.0.2"
            },
            "displayName": "Cron Expression",
            "nextAction": {
                "displayName": "Branch",
                "name": "step_1",
                "valid": true,
                "type": "BRANCH",
                "settings": {
                    "conditions": [
                        [
                            {
                                "operator": "TEXT_CONTAINS",
                                "firstValue": "1",
                                "secondValue": "1"
                            }
                        ]
                    ]
                },
                "onSuccessAction": {
                    "displayName": "Code",
                    "name": "step_2",
                    "valid": true,
                    "type": "CODE",
                    "settings": {
                        "input": {}
                    }
                },
                "onFailureAction": {
                    "displayName": "Code",
                    "name": "step_3",
                    "valid": true,
                    "type": "CODE",
                    "settings": {
                        "input": {}
                    }
                },
                "nextAction": {
                    "displayName": "Code",
                    "name": "step_4",
                    "valid": true,
                    "type": "CODE",
                    "settings": {
                        "input": {}
                    }
                }
            }
        }
        expect(resultFlow.trigger).toEqual(expectedTrigger);
    });

    it('should add loop step with actions', () => {
        const addBranchRequest: FlowOperationRequest = {
            type: FlowOperationType.ADD_ACTION,
            request: {
                parentStep: "trigger",
                action: {
                    name: 'step_1',
                    type: ActionType.LOOP_ON_ITEMS,
                    displayName: 'Loop',
                    valid: true,
                    settings: {
                        items: "items",
                    }
                }
            }
        }
        const addCodeActionInside: FlowOperationRequest = {
            type: FlowOperationType.ADD_ACTION,
            request: {
                parentStep: "step_1",
                stepLocationRelativeToParent: StepLocationRelativeToParent.INSIDE_LOOP,
                action: createCodeAction('step_3')
            }
        }
        const addCodeActionOnAfter: FlowOperationRequest = {
            type: FlowOperationType.ADD_ACTION,
            request: {
                parentStep: "step_1",
                stepLocationRelativeToParent: StepLocationRelativeToParent.AFTER,
                action: createCodeAction('step_4')
            }
        }
        let resultFlow = emptyScheduleFlowVersion;
        resultFlow = flowHelper.apply(resultFlow, addBranchRequest);
        resultFlow = flowHelper.apply(resultFlow, addCodeActionInside);
        resultFlow = flowHelper.apply(resultFlow, addCodeActionOnAfter);

        const expectedTrigger: Trigger = {
            "name": "trigger",
            "type": TriggerType.PIECE,
            "valid": true,
            "settings": {
                "input": {
                    "cronExpression": "25 10 * * 0,1,2,3,4"
                },
                "pieceName": "schedule",
                "inputUiInfo": {},
                "triggerName": "cron_expression",
                "pieceVersion": "0.0.2"
            },
            "displayName": "Cron Expression",
            "nextAction": {
                "displayName": "Loop",
                "name": "step_1",
                "valid": true,
                "type": "LOOP_ON_ITEMS",
                "settings": {
                    "items": "items"
                },
                "firstLoopAction": {
                    "displayName": "Code",
                    "name": "step_3",
                    "valid": true,
                    "type": "CODE",
                    "settings": {
                        "input": {}
                    }
                },
                "nextAction": {
                    "displayName": "Code",
                    "name": "step_4",
                    "valid": true,
                    "type": "CODE",
                    "settings": {
                        "input": {}
                    }
                }
            }
        };
        expect(resultFlow.trigger).toEqual(expectedTrigger);
    });
});
