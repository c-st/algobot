import {
  DetermineTimeToWaitResult,
  StartCollectingRewardsCommand,
} from "./types";

export const handler = async (
  event: StartCollectingRewardsCommand
): Promise<DetermineTimeToWaitResult> => {
  const { address, minimumRewardToCollect } = event;
  console.log(
    `Estimating reward collecting time for ${address} (at least ${minimumRewardToCollect} ALGO)`,
    event
  );

  /**
   * - fetch claimable rewards for address
   * - fetch balance for address
   * - calculate rewards/time based on balance
   * - return time to match minimumRewardToCollect
   */

  console.log(event);
  return {
    waitTimeSeconds: 15,
  };
};
