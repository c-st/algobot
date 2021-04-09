export interface Secret {
  algodApiKey: string;
  algodApiServer: string;
  mnemonic: string;
}

export interface AlgoAddressSettings {
  address: AlgoAddress;
  rewardCollectionEnabled: boolean;
  minimumRewardsToCollect?: number;
  rewardCollectionExecutionId?: string;
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

export type RewardCollectionSettings = {
  isEnabled: boolean;
  address: AlgoAddress;
  minimumRewardsToCollect: number;
};

export type UpdateRewardCollectionSettingsCommand = {
  enable: boolean;
  address: AlgoAddress;
  minimumRewardsToCollect: number;
};
