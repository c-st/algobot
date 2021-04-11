import buildDependencies from "../../dependencies";
import { estimateMinutesUntilRewardCollection } from "./estimateMinutesUntilRewardCollection";
import { DetermineTimeToWaitResult, RewardCollectionParameters } from "./types";
import dayjs from "dayjs";

const MINIMUM_WAIT_TIME_MINUTES = 5;

export const handler = async (
  event: RewardCollectionParameters
): Promise<DetermineTimeToWaitResult> => {
  const { address, minimumRewardToCollect } = event;
  console.log(
    `Estimating reward collection time for ${address} (at least ${minimumRewardToCollect} ALGO)`,
    event
  );
  const { algorandClient } = await buildDependencies();

  const accountState = await algorandClient.getAccountState(address);
  if (!accountState) {
    throw Error(`Account state for address ${address} could not be fetched`);
  }

  // Already ready to claim?
  if (accountState.pendingRewards >= minimumRewardToCollect) {
    return {
      nextRewardCollection: getIsoDateInFuture(MINIMUM_WAIT_TIME_MINUTES),
      address,
      minimumRewardToCollect,
    };
  }

  // Calculate remaining time based on current balance:
  const additionalAlgoNeeded =
    minimumRewardToCollect - accountState.pendingRewards;

  const minutesUntilRewardCollection = estimateMinutesUntilRewardCollection(
    accountState.amountWithoutPendingRewards,
    additionalAlgoNeeded
  );

  return {
    nextRewardCollection: getIsoDateInFuture(
      minutesUntilRewardCollection + MINIMUM_WAIT_TIME_MINUTES
    ),
    address,
    minimumRewardToCollect,
  };
};

export const getIsoDateInFuture = (minutesFromNow: number): string => {
  return dayjs().add(minutesFromNow, "minutes").toISOString();
};
