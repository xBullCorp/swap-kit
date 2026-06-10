import type {
  AssetSchema,
  QuoteParamsSchema,
  QuoteResultSchema,
  StrictSendParamsSchema,
  StrictSendResultSchema,
  SwapKitParamsSchema,
} from "./schemas.ts";
import type { InferInput, InferOutput } from "@valibot/valibot";

export type SwapKitParams = InferInput<typeof SwapKitParamsSchema>;
export type QuoteParams = InferInput<typeof QuoteParamsSchema>;
export type QuoteResult = InferOutput<typeof QuoteResultSchema>;
export type StrictSendParams = InferInput<typeof StrictSendParamsSchema>;
export type StrictSendResult = InferOutput<typeof StrictSendResultSchema>;
export type AssetsListResult = InferOutput<typeof AssetSchema>[];

export enum SwapContract {
  MAINNET = "CCKXBE5GKJOCE7IKL64HLYKW3IJSUPVOLC4CS77GQT5QQHDZLDYV3DFT",
}
