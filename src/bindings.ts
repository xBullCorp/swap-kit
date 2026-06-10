import {
  type AssembledTransaction,
  Client as ContractClient,
  type ClientOptions as ContractClientOptions,
  type MethodOptions,
  type Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type { u128, u32 } from "@stellar/stellar-sdk/contract";

export const ContractError = {
  200: { message: "UnsupportedProtocol" },
  201: { message: "NotEnoughOutput" },
  202: { message: "ErrorSortingAssets" },
  203: { message: "SwapFailed" },
  204: { message: "MissingMappedValue" },
};

export type StorageKeys = { tag: "Admin"; values: void } | { tag: "Fee"; values: void } | { tag: "Map"; values: readonly [u32] };

export interface PathPaymentClient {
  /**
   * Construct and simulate a set_fee transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_fee: ({ new_fee }: { new_fee: u128 }, options?: MethodOptions) => Promise<AssembledTransaction<Result<readonly [u128, u128]>>>;

  /**
   * Construct and simulate a upgrade transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  upgrade: ({ hash }: { hash: Buffer }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a set_maps transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_maps: ({ items }: { items: Array<readonly [u32, string]> }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a withdraw transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  withdraw: ({ asset, to }: { asset: string; to: string }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a strict_send transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  strict_send: (
    { from, to, amount, min_to_get, path, refs }: {
      from: string;
      to: string;
      amount: u128;
      min_to_get: u128;
      path: Array<readonly [u32, u32, u32, u32]>;
      refs: Array<readonly [string, u128]>;
    },
    options?: MethodOptions,
  ) => Promise<AssembledTransaction<Result<readonly [u128, u128]>>>;

  /**
   * Construct and simulate a internal_swap transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  internal_swap: (
    { amount, min_to_get, path }: { amount: u128; min_to_get: u128; path: Array<readonly [u32, u32, u32, u32]> },
    options?: MethodOptions,
  ) => Promise<AssembledTransaction<Result<readonly [u128, u128]>>>;
}
export class PathPaymentClient extends ContractClient {
  // deno-lint-ignore require-await
  static override async deploy<T = PathPaymentClient>(
    /** Constructor/Initialization Args for the contract's `__constructor` method */
    { new_admin, new_fee }: { new_admin: string; new_fee: u128 },
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options:
      & MethodOptions
      & Omit<ContractClientOptions, "contractId">
      & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      },
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy({ new_admin, new_fee }, options);
  }
  constructor(public override readonly options: ContractClientOptions) {
    super(
      new ContractSpec([
        "AAAABAAAAAAAAAAAAAAADUNvbnRyYWN0RXJyb3IAAAAAAAAFAAAAAAAAABNVbnN1cHBvcnRlZFByb3RvY29sAAAAAMgAAAAAAAAAD05vdEVub3VnaE91dHB1dAAAAADJAAAAAAAAABJFcnJvclNvcnRpbmdBc3NldHMAAAAAAMoAAAAAAAAAClN3YXBGYWlsZWQAAAAAAMsAAAAAAAAAEk1pc3NpbmdNYXBwZWRWYWx1ZQAAAAAAzA==",
        "AAAABQAAAAAAAAAAAAAACFdpdGhkcmF3AAAAAQAAAAh3aXRoZHJhdwAAAAMAAAAAAAAABmFtb3VudAAAAAAACgAAAAAAAAAAAAAABWFzc2V0AAAAAAAAEwAAAAAAAAAAAAAAAnRvAAAAAAATAAAAAAAAAAI=",
        "AAAABQAAAAAAAAAAAAAAClN0cmljdFNlbmQAAAAAAAEAAAALc3RyaWN0X3NlbmQAAAAACQAAAAAAAAAEZnJvbQAAABMAAAABAAAAAAAAAAJ0bwAAAAAAEwAAAAEAAAAAAAAACmZyb21fYXNzZXQAAAAAABMAAAAAAAAAAAAAAAh0b19hc3NldAAAABMAAAAAAAAAAAAAAAtmcm9tX2Ftb3VudAAAAAAKAAAAAAAAAAAAAAAJdG9fYW1vdW50AAAAAAAACgAAAAAAAAAAAAAABHBhdGgAAAPqAAAD7QAAAAQAAAAEAAAABAAAAAQAAAAEAAAAAAAAAAAAAAAMcGxhdGZvcm1fZmVlAAAACgAAAAAAAAAAAAAADWV4dGVybmFsX2ZlZXMAAAAAAAAKAAAAAAAAAAI=",
        "AAAABQAAAAAAAAAAAAAADEludGVybmFsU3dhcAAAAAEAAAANaW50ZXJuYWxfc3dhcAAAAAAAAAUAAAAAAAAACmZyb21fYXNzZXQAAAAAABMAAAAAAAAAAAAAAAh0b19hc3NldAAAABMAAAAAAAAAAAAAAAtmcm9tX2Ftb3VudAAAAAAKAAAAAAAAAAAAAAAJdG9fYW1vdW50AAAAAAAACgAAAAAAAAAAAAAABHBhdGgAAAPqAAAD7QAAAAQAAAAEAAAABAAAAAQAAAAEAAAAAAAAAAI=",
        "AAAABQAAAAAAAAAAAAAAElBsYXRmb3JtRmVlVXBkYXRlZAAAAAAAAQAAABRwbGF0Zm9ybV9mZWVfdXBkYXRlZAAAAAIAAAAAAAAAA29sZAAAAAAKAAAAAAAAAAAAAAADbmV3AAAAAAoAAAAAAAAAAg==",
        "AAAAAgAAAAAAAAAAAAAAC1N0b3JhZ2VLZXlzAAAAAAMAAAAAAAAAAAAAAAVBZG1pbgAAAAAAAAAAAAAAAAAAA0ZlZQAAAAABAAAAAAAAAANNYXAAAAAAAQAAAAQ=",
        "AAAAAAAAAAAAAAAHc2V0X2ZlZQAAAAABAAAAAAAAAAduZXdfZmVlAAAAAAoAAAABAAAD6QAAA+0AAAACAAAACgAAAAoAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAAAAAAAAAAAHdXBncmFkZQAAAAABAAAAAAAAAARoYXNoAAAD7gAAACAAAAABAAAD6QAAAAIAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAAAAAAAAAAAIc2V0X21hcHMAAAABAAAAAAAAAAVpdGVtcwAAAAAAA+oAAAPtAAAAAgAAAAQAAAATAAAAAQAAA+kAAAACAAAH0AAAAA1Db250cmFjdEVycm9yAAAA",
        "AAAAAAAAAAAAAAAId2l0aGRyYXcAAAACAAAAAAAAAAVhc3NldAAAAAAAABMAAAAAAAAAAnRvAAAAAAATAAAAAQAAA+kAAAACAAAH0AAAAA1Db250cmFjdEVycm9yAAAA",
        "AAAAAAAAAAAAAAALc3RyaWN0X3NlbmQAAAAABgAAAAAAAAAEZnJvbQAAABMAAAAAAAAAAnRvAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAoAAAAAAAAACm1pbl90b19nZXQAAAAAAAoAAAAAAAAABHBhdGgAAAPqAAAD7QAAAAQAAAAEAAAABAAAAAQAAAAEAAAAAAAAAARyZWZzAAAD6gAAA+0AAAACAAAAEwAAAAoAAAABAAAD6QAAA+0AAAACAAAACgAAAAoAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAAAAAAAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAIAAAAAAAAACW5ld19hZG1pbgAAAAAAABMAAAAAAAAAB25ld19mZWUAAAAACgAAAAA=",
        "AAAAAAAAAAAAAAANaW50ZXJuYWxfc3dhcAAAAAAAAAMAAAAAAAAABmFtb3VudAAAAAAACgAAAAAAAAAKbWluX3RvX2dldAAAAAAACgAAAAAAAAAEcGF0aAAAA+oAAAPtAAAABAAAAAQAAAAEAAAABAAAAAQAAAABAAAD6QAAA+0AAAACAAAACgAAAAoAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
      ]),
      options,
    );
  }
  public readonly fromJSON = {
    set_fee: this.txFromJSON<Result<readonly [u128, u128]>>,
    upgrade: this.txFromJSON<Result<void>>,
    set_maps: this.txFromJSON<Result<void>>,
    withdraw: this.txFromJSON<Result<void>>,
    strict_send: this.txFromJSON<Result<readonly [u128, u128]>>,
    internal_swap: this.txFromJSON<Result<readonly [u128, u128]>>,
  };
}
