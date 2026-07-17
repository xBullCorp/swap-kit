import { type Account, type Networks, Operation, type Transaction, TransactionBuilder } from "@stellar/stellar-sdk";
import type {
  AssetsListResult,
  QuoteParams,
  QuoteResult,
  StrictSendParams,
  StrictSendRecord,
  StrictSendResult,
  SwapKitParams,
} from "./types.ts";
import { type InferInput, parse, parseAsync } from "@valibot/valibot";
import {
  AssetSchema,
  QuoteParamsSchema,
  QuoteResultSchema,
  StrictSendPayloadSchema,
  StrictSendRecordSchema,
  StrictSendResponseSchema,
  StrictSendResultSchema,
  SwapKitParamsSchema,
} from "./schemas.ts";
import wretch from "wretch";
import QueryStringAddon from "wretch/addons/queryString";
import { Server } from "@stellar/stellar-sdk/rpc";
import { rpc, xdr } from "@stellar/stellar-sdk";

export class SwapKit {
  #rpcUrl: string;
  #allowHttp: boolean;
  #passphrase: Networks;
  #apiUrl: string;

  constructor(params?: SwapKitParams) {
    const {
      rpcUrl,
      allowHttp,
      passphrase,
      apiUrl,
    } = parse(SwapKitParamsSchema, params);
    this.#rpcUrl = rpcUrl;
    this.#allowHttp = allowHttp;
    this.#passphrase = passphrase;
    this.#apiUrl = apiUrl;
  }

  get #api() {
    return wretch(this.#apiUrl).addon(QueryStringAddon);
  }

  get #server(): Server {
    return new Server(this.#rpcUrl, { allowHttp: this.#allowHttp });
  }

  /**
   * This method lets you get a quick quote of the best route for a specific swap.
   * The returned value will include details related to the platform and referral fees that will be taken from the `toAmount` value.
   */
  async quote(params: QuoteParams): Promise<QuoteResult> {
    const query = parse(QuoteParamsSchema, params);
    const response: QuoteResult = await this.#api.url("/swaps/quote").query(query).get().json();
    return parse(QuoteResultSchema, response);
  }

  /**
   * This method will quote a Swap and generate a simulated transaction for it, if you have quoted the swap before then
   * you can provide the route id and this method will generate the transaction with it.
   *
   * The transaction XDR returned is an already simulated transaction so you only need to sign it before sending it
   */
  async strictSend(
    params: StrictSendParams,
    opts?: { fee?: string; minAccountSequence?: string; timeout?: number },
  ): Promise<StrictSendResult> {
    let route: string;
    if ("route" in params) {
      route = params.route;
    } else {
      const quote = await this.quote(params);
      route = quote.route;
    }

    if (!params.from) {
      params.from = params.source;
    }

    if (!params.to) {
      params.to = params.from;
    }

    const payload = parse(StrictSendPayloadSchema, { ...params, route });
    const response = await this.#api.url("/swaps/strict-send").query(payload).get().json()
      .then((r) => parse(StrictSendResponseSchema, r));

    const source: Account = await this.#server.getAccount(params.source);

    const contractArgs: xdr.InvokeContractArgs = xdr.InvokeContractArgs.fromXDR(response.contractArgsXDR, "base64");

    const tx: Transaction = new TransactionBuilder(source, {
      fee: opts?.fee || "1000000",
      minAccountSequence: opts?.minAccountSequence || "0",
      networkPassphrase: this.#passphrase,
    })
      .addOperation(
        Operation.invokeHostFunction({
          func: xdr.HostFunction.hostFunctionTypeInvokeContract(contractArgs),
        }),
      )
      .setTimeout(opts?.timeout || 0)
      .build();

    const sim = await this.#server.simulateTransaction(tx);

    if (rpc.Api.isSimulationError(sim)) {
      console.error(sim.error);
      throw new Error("Simulation failed.");
    }

    const assembled: Transaction = rpc.assembleTransaction(tx, sim).build();

    return parse(StrictSendResultSchema, {
      transactionXDR: assembled.toXDR(),
      fromAmount: response.fromAmount,
      toAmount: response.toAmount,
    });
  }

  /**
   * Get a list of the supported assets in our platform
   */
  async assetsList(): Promise<AssetsListResult> {
    const response: InferInput<typeof AssetSchema>[] = await this.#api.url("/assets/list").get().json();
    return response.map((asset) => parse(AssetSchema, asset));
  }

  async getAddressOperations(address: string, page: number = 0): Promise<StrictSendRecord[]> {
    const response: InferInput<typeof AssetSchema>[] = await this.#api.url(`/records/account/${address}/`)
      .query({ page })
      .get()
      .json();

    return await Promise.all(response.map((r) => parseAsync(StrictSendRecordSchema, r)));
  }
}
