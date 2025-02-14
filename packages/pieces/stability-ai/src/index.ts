
import { PieceAuth, Property, createPiece } from "@activepieces/pieces-framework";
import { textToImage } from "./lib/actions/text-to-image";

export const stabilityAiAuth = PieceAuth.CustomAuth({
  
  props: {
    api_key: Property.ShortText({
      displayName: 'StabilityAI API Key',
      required: true,
      description: 'The api key of Stability AI',
    }),
  },
  required: true,
})

export const stabilityAi = createPiece({
  displayName: "Stability AI",
      minimumSupportedRelease: '0.5.0',
    logoUrl: "https://cdn.activepieces.com/pieces/stability-ai.png",
  authors: ["Willianwg"],
  auth: stabilityAiAuth,
  actions: [textToImage],
  triggers: [],
});
