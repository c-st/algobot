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
  waitTimeSeconds: number;
};

export type CollectRewardResult = RewardCollectionParameters & {
  collectedReward?: number;
  remainingFeeBalance?: number;
};
