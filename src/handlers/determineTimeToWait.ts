import buildDependencies from "../dependencies";
import { estimateMinutesUntilRewardCollection } from "../estimateMinutesUntilRewardCollection";
import {
  DetermineTimeToWaitResult,
  RewardCollectionParameters,
} from "../types";

const MINIMUM_WAIT_TIME = 5 * 60;

export const handler = async (
  event: RewardCollectionParameters
): Promise<DetermineTimeToWaitResult> => {
  const { address, minimumRewardToCollect } = event;
  console.log(
    `Estimating reward collection time for ${address} (at least ${minimumRewardToCollect} ALGO)`,
    event
  );
  const { algorandClient } = await buildDependencies(process.env.SECRET_ARN!);

  const accountState = await algorandClient.getAccountState(address);

  // Already ready to claim?
  if (accountState.pendingRewards >= minimumRewardToCollect) {
    return {
      waitTimeSeconds: MINIMUM_WAIT_TIME,
      address,
      minimumRewardToCollect,
    };
  }

  // Calculate remaining time based on current balance
  const additionalAlgoNeeded =
    minimumRewardToCollect - accountState.pendingRewards;

  const minutesUntilRewardCollection = estimateMinutesUntilRewardCollection(
    accountState.amountWithoutPendingRewards,
    additionalAlgoNeeded
  );

  return {
    waitTimeSeconds: minutesUntilRewardCollection * 60,
    address,
    minimumRewardToCollect,
  };
};
