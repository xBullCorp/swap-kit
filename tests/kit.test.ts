import { describe, test } from "@std/testing/bdd";
import { assert, assertEquals } from "@std/assert";
import { SwapKit } from "../src/kit.ts";
import { Networks, Transaction } from "@stellar/stellar-sdk";

describe("Test Kit's logic", () => {
  const swapKit: SwapKit = new SwapKit({ apiUrl: "http://0.0.0.0:3454" });

  test("Test Quote", async (): Promise<void> => {
    const quote = await swapKit.quote({
      fromAsset: "CBLV4ATSIWU67CFSQU2NVRKINQIKUZ2ODSZBUJTJ43VJVRSBTZYOPNUR",
      toAsset: "CD25MNVTZDL4Y3XBCPCJXGXATV5WUHHOWMYFF4YBEGU5FCPGMYTVG5JY",
      amount: "100000000000",
    });

    assert(typeof quote.route === "string");
    assert(typeof quote.fee.platformFee === "bigint");
    assertEquals(quote.fee.referralsFee, 0n);
    assertEquals(quote.fromAsset, "CBLV4ATSIWU67CFSQU2NVRKINQIKUZ2ODSZBUJTJ43VJVRSBTZYOPNUR");
    assertEquals(quote.toAsset, "CD25MNVTZDL4Y3XBCPCJXGXATV5WUHHOWMYFF4YBEGU5FCPGMYTVG5JY");
    assertEquals(quote.fromAmount, 100000000000n);
    assert(typeof quote.toAmount === "bigint");
  });

  describe("Test Strict Send", () => {
    test("Test simple call", async () => {
      const swap = await swapKit.strictSend({
        source: "GDUY7J7A33TQWOSOQGDO776GGLM3UQERL4J3SPT56F6YS4ID7MLDERI4",
        fromAsset: "CBLV4ATSIWU67CFSQU2NVRKINQIKUZ2ODSZBUJTJ43VJVRSBTZYOPNUR",
        toAsset: "CD25MNVTZDL4Y3XBCPCJXGXATV5WUHHOWMYFF4YBEGU5FCPGMYTVG5JY",
        amount: "100000000000",
        minToReceive: "1",
      });

      assert(typeof swap.transactionXDR === "string");
      new Transaction(swap.transactionXDR, Networks.PUBLIC); // confirms it returns a correct Transaction XDR
      assert(typeof swap.fromAmount === "bigint");
      assert(typeof swap.toAmount === "bigint");
    });
  });
});
