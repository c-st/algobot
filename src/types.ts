export interface Secrets {
  algodApiKey: string;
  algodApiServer: string;
}

export type AlgoAddress = string;

export type RewardCollectionParameters = {
  address: AlgoAddress;
  minimumRewardToCollect: number;
};

export type DetermineTimeToWaitResult = RewardCollectionParameters & {
  waitTimeSeconds: number;
};

export type CollectRewardResult = RewardCollectionParameters & {
  balance: number;
  collectedReward?: number;
  feeBalance: number;
  remainingFeeBalanceForAddress: number;
};
