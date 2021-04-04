import { dependencies } from "../dependencies";
import {
  DetermineTimeToWaitResult,
  RewardCollectionParameters,
} from "../types";

export const handler = async (
  event: RewardCollectionParameters
): Promise<DetermineTimeToWaitResult> => {
  const { address, minimumRewardToCollect } = event;
  console.log(
    `Estimating reward collection time for ${address} (at least ${minimumRewardToCollect} ALGO)`,
    event
  );
  const { algorandClient } = await dependencies(process.env.SECRET_ARN!);

  const accountState = await algorandClient.getAccountState(address);
  console.log("determineTimeToWait", { event, accountState });

  /**
   * - fetch claimable rewards for address
   * - fetch balance for address
   * - calculate rewards/time based on balance
   * - return time to match minimumRewardToCollect
   */

  return {
    waitTimeSeconds: 15,
    ...event,
  };
};
