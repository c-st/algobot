import * as AlgoSdk from "algosdk";
import * as AWSXRay from "aws-xray-sdk-core";

AWSXRay.captureHTTPsGlobal(require("https"), true);

export enum ApiServer {
  PURESTAKE_BETANET = "https://betanet-algorand.api.purestake.io/ps2",
  PURESTAKE_TESTNET = "https://testnet-algorand.api.purestake.io/ps2",
  PURESTAKE_MAINNET = "https://mainnet-algorand.api.purestake.io/ps2",
}

interface AccountState {
  address: string;
  amount: number | bigint;
  amountWithoutPendingRewards: number;
  pendingRewards: number;
}

export class AlgorandClient {
  private algodClient: AlgoSdk.Algodv2;

  constructor(apiKey: string, serverUrl: string = ApiServer.PURESTAKE_TESTNET) {
    const token = {
      "X-API-Key": apiKey,
    };
    this.algodClient = new AlgoSdk.Algodv2(token as any, serverUrl, "" as any);
  }

  async getAccountState(address: string): Promise<AccountState> {
    const state = await this.algodClient.accountInformation(address).do();
    const {
      amount,
      "amount-without-pending-rewards": amountWithoutPendingRewards,
      "pending-rewards": pendingRewards,
    } = state;
    
    // setBalance(Number(result.amount) / 1000000);
    console.log(state);

    return {
      address,
      amount,
      amountWithoutPendingRewards,
      pendingRewards,
    };
  }
}
