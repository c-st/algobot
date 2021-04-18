import buildDependencies from "../../dependencies";
import { estimateMinutesUntilRewardCollection } from "./estimateMinutesUntilRewardCollection";
import { DetermineTimeToWaitResult, RewardCollectionParameters } from "./types";
import dayjs from "dayjs";

const MINIMUM_WAIT_TIME_MINUTES = 15;

export const handler = async (
  event: RewardCollectionParameters
): Promise<DetermineTimeToWaitResult> => {
  const { address, minimumRewardsToCollect } = event;
  if (!address || !minimumRewardsToCollect) {
    throw Error("Missing parameters in event");
  }
  const { algorandClient } = await buildDependencies();
  const accountState = await algorandClient.getAccountState(address);
  if (!accountState) {
    throw Error(`Account state for address ${address} could not be fetched`);
  }
  console.log(
    `Estimating reward collection time for ${address} (at least ${minimumRewardsToCollect} ALGO)`,
    accountState
  );

  // Already ready to claim?
  if (accountState.pendingRewards >= minimumRewardsToCollect) {
    return {
      nextRewardCollection: getIsoDateInFuture(MINIMUM_WAIT_TIME_MINUTES),
      address,
      minimumRewardsToCollect,
    };
  }

  // Calculate remaining time based on current balance:
  const additionalAlgoNeeded =
    minimumRewardsToCollect - accountState.pendingRewards;

  const minutesUntilRewardCollection = estimateMinutesUntilRewardCollection(
    accountState.amountWithoutPendingRewards,
    additionalAlgoNeeded
  );

  console.log(`Estimated wait time ${minutesUntilRewardCollection}`, {
    accountState,
    additionalAlgoNeeded,
  });

  return {
    nextRewardCollection: getIsoDateInFuture(
      minutesUntilRewardCollection + MINIMUM_WAIT_TIME_MINUTES
    ),
    address,
    minimumRewardsToCollect,
  };
};

export const getIsoDateInFuture = (minutesFromNow: number): string => {
  return dayjs().add(minutesFromNow, "minutes").toISOString();
};
