import type { Networks } from "@stellar/stellar-sdk";

/**
 * SwapKitParams is the object you can provide when creating a new instance of the `SwapKit` class
 */
export type SwapKitParams = {
  /**
   * @default "https://rpc.lightsail.network"
   */
  rpcUrl?: string | undefined;
  /**
   * @default false
   */
  allowHttp?: boolean | undefined;
  /**
   * @default Networks.PUBLIC
   */
  passphrase?: Networks | undefined;
  /**
   * @default SwapContract.MAINNET
   */
  swapContract?: SwapContract | undefined;
  /**
   * @default "https://swap-api.xbull.io"
   */
  apiUrl?: string | undefined;
};

/**
 * The parameters used when quoting a swap
 */
export type QuoteParams = {
  /**
   * The contract id of the asset to swap
   */
  fromAsset: string;
  /**
   * The contract id of the asset to receive
   */
  toAsset: string;
  /**
   * The amount of `fromAsset` to swap.
   * This amount should be done in the `fromAsset` decimals, so for example if sending 1 XLM then you should use `10000000`
   */
  amount: string | bigint;
  /**
   * Developers can specify a fee from the end amount (after platform fee)
   */
  referralFees?: {
    /**
     * The address where the fee will be sent to.
     * In case of using a "G" account as the referral, you must be sure that it has the required trustlines or otherwise the transaction will fail.
     */
    referral: string;
    /**
     * The percentage to take on top of the platform fee
     * Example: 0.35% should be written as 35000 (100% = 1_0000000)
     */
    feePercentage: string | bigint;
  }[] | undefined;
};

export type QuoteResult = {
  /**
   * This is the ID of the route for this quote, you can specify this one when making a swap
   */
  route: string;
  /**
   * The amount that will be discounted from the sender
   */
  fromAmount: bigint;
  /**
   * The calculated amount for the swap (before all fees)
   */
  toAmount: bigint;
  /**
   * The asset to swap
   */
  fromAsset: string;
  /**
   * The asset to receive
   */
  toAsset: string;
  /**
   * All fees that will be taken on top of the calculated final amount.
   * Fees are taken in the final asset so for example if exchanging `XLM` for `USDC`, the fee will be taken from the USDC amount
   */
  fee: {
    /**
     * This is the mandatory fee, it's taken by the xBull Swap protocol on the final amount
     */
    platformFee: bigint;
    /**
     * The fee taken and sent to referrals after the platform fee has been taken.
     * @default 0n
     */
    referralsFee: bigint;
  };
};

export type StrictSendParams =
  & ({ route: string } | { fromAsset: string; toAsset: string })
  & {
    source: string;
    from?: string | undefined;
    to?: string | undefined;
    amount: string | bigint;
    minToReceive: string | bigint;
    referralFees?: {
      referral: string;
      feePercentage: string | bigint;
    }[] | undefined;
  };

export type StrictSendResult = {
  transactionXDR: string;
  fromAmount: bigint;
  toAmount: bigint;
};

export type Asset = {
  _id: string;
  code: string;
  issuer?: string | undefined;
  contract: string;
  name: string;
  org: string;
  domain: string;
  icon: string;
  decimals: number;
};
export type AssetsListResult = Asset[];

export type StrictSendRecord = {
  from: string;
  to: string;
  from_asset: string;
  to_asset: string;
  from_amount: bigint;
  to_amount: bigint;
  platform_fee: bigint;
  external_fees: bigint;
  tx_hash: string;
  timestamp: bigint;
};

export enum SwapContract {
  MAINNET = "CCKXBE5GKJOCE7IKL64HLYKW3IJSUPVOLC4CS77GQT5QQHDZLDYV3DFT",
}
