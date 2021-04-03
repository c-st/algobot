export interface Secrets {
  algodApiKey: string;
  algodApiServer: string;
}

export type AlgoAddress = string;

export type StartCollectingRewardsCommand = {
  address: string;
  minimumRewardToCollect: number;
};

export type DetermineTimeToWaitResult = StartCollectingRewardsCommand & {
  waitTimeSeconds: number;
};

export type CollectRewardResult = StartCollectingRewardsCommand & {
  address: AlgoAddress;
  balance: number;
  collectedReward?: number;
  feeBalance: number;
};
