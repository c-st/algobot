export interface Secrets {
  algodApiKey: string;
  algodApiServer: string;
  mnemonic: string;
}

export type AlgoAddress = string;

export type RewardCollectionParameters = {
  address: AlgoAddress;
  minimumRewardToCollect: number;
};

export type DetermineTimeToWaitResult = RewardCollectionParameters & {
  attemptRewardCollectionAt: string; // ISO-Date
};

export type CollectRewardResult = RewardCollectionParameters & {
  collectedReward?: number;
  transactionId?: string;
  remainingFeeBalance: number;
};
