import * as AlgoSdk from "algosdk";
import { Transaction } from "algosdk";
import * as AWSXRay from "aws-xray-sdk-core";
import { AlgoAddress } from "../types";

AWSXRay.captureHTTPsGlobal(require("https"), true);

export enum ApiServer {
  PURESTAKE_BETANET = "https://betanet-algorand.api.purestake.io/ps2",
  PURESTAKE_TESTNET = "https://testnet-algorand.api.purestake.io/ps2",
  PURESTAKE_MAINNET = "https://mainnet-algorand.api.purestake.io/ps2",
}

interface AccountState {
  address: AlgoAddress; // public key
  amount: number; // balance + unclaimed pending rewards
  amountWithoutPendingRewards: number; // balance without unclaimed pending rewards
  pendingRewards: number; // unclaimed pending rewards
}

export class AlgorandClient {
  private algodClient: AlgoSdk.Algodv2;

  constructor(
    apiKey: string,
    private accountMnemonic: string,
    serverUrl: string = ApiServer.PURESTAKE_TESTNET
  ) {
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

    const params = await this.algodClient.getTransactionParams().do();
    console.log(params);

    return {
      address,
      amount: AlgoSdk.microalgosToAlgos(amount),
      amountWithoutPendingRewards: AlgoSdk.microalgosToAlgos(
        amountWithoutPendingRewards
      ),
      pendingRewards: AlgoSdk.microalgosToAlgos(pendingRewards),
    };
  }

  async sendTransaction(
    toAddress: AlgoAddress,
    amount: number = 0
  ): Promise<string> {
    const parameters = await this.algodClient.getTransactionParams().do();
    const account = AlgoSdk.mnemonicToSecretKey(this.accountMnemonic);

    const transaction: any = {
      from: account.addr,
      to: toAddress,
      fee: 1,
      amount,
      firstRound: parameters.firstRound,
      lastRound: parameters.lastRound,
      genesisID: parameters.genesisID,
      genesisHash: parameters.genesisHash,
      note: new Uint8Array(0),
    };

    const signedTxn = AlgoSdk.signTransaction(transaction, account.sk);
    const result = await this.algodClient
      .sendRawTransaction(signedTxn.blob)
      .do();

    return result.txId;
  }

  // sending a tx: https://github.com/PureStake/api-examples/blob/master/javascript-examples/v2/algod_submit_tx.js
}
