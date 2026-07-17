import {
  array,
  bigint,
  boolean,
  custom,
  type CustomIssue,
  type CustomSchema,
  enum_,
  intersect,
  minValue,
  number,
  object,
  optional,
  pipe,
  string,
  toBigint,
  toString,
  transform,
  union,
} from "@valibot/valibot";
import { SwapContract } from "./types.ts";
import { Networks, StrKey } from "@stellar/stellar-sdk";
import { encodeBase64Url } from "@std/encoding";

export const IsStellarAccount = (): CustomSchema<string, (issue: CustomIssue) => string> =>
  custom((input: unknown): boolean => {
    if (typeof input !== "string") return false;
    return StrKey.isValidEd25519PublicKey(input);
  }, (issue: CustomIssue): string => `${issue.received} is not a valid 'G' Stellar Address`);

export const IsStellarContract = (): CustomSchema<string, (issue: CustomIssue) => string> =>
  custom((input: unknown): boolean => {
    if (typeof input !== "string") return false;
    return StrKey.isValidContract(input);
  }, (issue: CustomIssue): string => `${issue.received} is not a valid 'C' Stellar Address`);

export const IsStellarAddress = (): CustomSchema<string, string> =>
  custom((input: unknown): boolean => {
    if (typeof input !== "string") return false;
    return StrKey.isValidContract(input) || StrKey.isValidEd25519PublicKey(input);
  }, "Value is not a valid 'C' Stellar Address");

export const SwapKitParamsSchema = optional(
  object({
    rpcUrl: optional(string(), "https://rpc.lightsail.network"),
    allowHttp: optional(boolean(), false),
    passphrase: optional(enum_(Networks), Networks.PUBLIC),
    swapContract: optional(enum_(SwapContract), SwapContract.MAINNET),
    apiUrl: optional(string(), "https://swap-api.xbull.io"),
  }),
  {},
);

export const SwapReferralSchema = object({
  referral: IsStellarAddress(),
  feePercentage: pipe(union([pipe(string(), toBigint()), bigint()]), minValue(1n)),
});

export const ReferralFeesSchema = pipe(
  array(SwapReferralSchema),
  transform((v): string => {
    return encodeBase64Url(new TextEncoder().encode(JSON.stringify(v, (_, v) => typeof v === "bigint" ? v.toString() : v)));
  }),
);

export const QuoteParamsSchema = object({
  fromAsset: IsStellarContract(),
  toAsset: IsStellarContract(),
  amount: pipe(union([pipe(string(), toBigint()), bigint()]), minValue(1n)),
  referralFees: optional(ReferralFeesSchema, []),
});

export const QuoteResultSchema = object({
  route: string(),
  fromAmount: union([pipe(string(), toBigint()), bigint()]),
  toAmount: union([pipe(string(), toBigint()), bigint()]),
  fromAsset: string(),
  toAsset: string(),
  fee: object({
    platformFee: union([pipe(string(), toBigint()), bigint()]),
    referralsFee: union([pipe(string(), toBigint()), bigint()]),
  }),
});

export const StrictSendParamsSchema = intersect([
  union([
    object({ route: string() }),
    object({
      fromAsset: IsStellarContract(),
      toAsset: IsStellarContract(),
    }),
  ]),
  object({
    source: IsStellarAccount(),
    from: optional(IsStellarAddress()),
    to: optional(IsStellarAddress()),
    amount: pipe(union([pipe(string(), toBigint()), bigint()]), minValue(1n)),
    minToReceive: pipe(union([pipe(string(), toBigint()), bigint()]), minValue(1n)),
    referralFees: optional(ReferralFeesSchema, []),
  }),
]);

export const StrictSendPayloadSchema = object({
  route: string(),
  from: IsStellarAddress(),
  to: IsStellarAddress(),
  amount: union([pipe(bigint(), toString()), string()]),
  minToReceive: union([pipe(bigint(), toString()), string()]),
  referralFees: optional(ReferralFeesSchema, []),
});

export const StrictSendResponseSchema = object({
  contractArgsXDR: string(),
  fromAmount: string(),
  toAmount: string(),
});

export const StrictSendResultSchema = object({
  transactionXDR: string(),
  fromAmount: pipe(string(), toBigint()),
  toAmount: pipe(string(), toBigint()),
});

export const AssetSchema = object({
  _id: IsStellarContract(),
  code: string(),
  issuer: optional(string()),
  contract: IsStellarContract(),
  name: string(),
  org: string(),
  domain: string(),
  icon: string(),
  decimals: number(),
});

export const StrictSendRecordSchema = object({
  from: IsStellarAddress(),
  to: IsStellarAddress(),
  from_asset: IsStellarContract(),
  to_asset: IsStellarContract(),
  from_amount: pipe(string(), toBigint(), bigint()),
  to_amount: pipe(string(), toBigint(), bigint()),
  platform_fee: pipe(string(), toBigint(), bigint()),
  external_fees: pipe(string(), toBigint(), bigint()),
  tx_hash: string(),
  timestamp: pipe(string(), toBigint(), bigint()),
});
