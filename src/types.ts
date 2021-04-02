export type DetermineTimeToWaitResult = {
  waitTimeSeconds: number;
}

export type CollectRewardResult = {
  collectedReward?: number;
  feeBalance: number;
  balance: number;
};