import { AlgoAddress } from "../../clients/AlgorandClient";

export interface AlgoAddressSettings {
  address: AlgoAddress;
  rewardCollectionEnabled: boolean;
  minimumRewardsToCollect?: number;
  rewardCollectionExecutionId?: string;
}

// State Machine
export type RewardCollectionParameters = {
  address: AlgoAddress;
  minimumRewardsToCollect: number;
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
  minimumRewardsToCollect?: number;
  pendingRewards: number;
};

export type UpdateRewardCollectionSettingsCommand = {
  enable: boolean;
  address: AlgoAddress;
  minimumRewardsToCollect: number;
};
