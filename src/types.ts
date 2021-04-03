export type AlgoAddress = string;

export type StartCollectingRewardsCommand = {
  address: string;
  minimumRewardToCollect: number;
};

export type DetermineTimeToWaitResult = {
  waitTimeSeconds: number;
};

export type CollectRewardResult = {
  address: AlgoAddress;
  balance: number;
  collectedReward?: number;
  feeBalance: number;
};