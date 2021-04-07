export interface Secrets {
  algodApiKey: string;
  algodApiServer: string;
  mnemonic: string;
}

// State Machine

export type AlgoAddress = string;

export type RewardCollectionParameters = {
  address: AlgoAddress;
  minimumRewardToCollect: number;
};

export type DetermineTimeToWaitResult = RewardCollectionParameters & {
  nextRewardCollection: string;
};

export type CollectRewardResult = RewardCollectionParameters & {
  collectedReward?: number;
  transactionId?: string;
  remainingFeeBalance: number;
};

// API

export type RewardCollectionRequest = {
  enabled: boolean;
  minimumRewardsToCollect: number;
};
