import { CollectRewardResult, RewardCollectionParameters } from "../types";

export const handler = async (
  event: RewardCollectionParameters
): Promise<CollectRewardResult> => {
  const { address, minimumRewardToCollect } = event;
  console.log(
    `Fetching rewards for ${address} (minimum ${minimumRewardToCollect})`,
    event
  );

  /**
   * - fetch claimable rewards for address
   * - send transaction (if claimableRewards > minimumRewardToCollect)
   */

  return {
    feeBalance: 1.005,
    balance: 1243,
    remainingFeeBalanceForAddress: 1.003,
    ...event,
  };
};