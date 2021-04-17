import buildDependencies from "../../dependencies";
import { CollectRewardResult, RewardCollectionParameters } from "./types";

export const handler = async (
  event: RewardCollectionParameters
): Promise<CollectRewardResult> => {
  const { address, minimumRewardsToCollect } = event;
  console.log(
    `Claiming rewards for ${address} (minimum ${minimumRewardsToCollect})`,
    event
  );

  const { algorandClient } = await buildDependencies();
  const remainingFeeBalance = 1.0; // TODO: fetch for address
  const accountState = await algorandClient.getAccountState(address);
  if (!accountState) {
    throw Error(`Account state for address ${address} could not be fetched`);
  }

  // Pending rewards have been claimed in the meanwhile
  if (accountState.pendingRewards < minimumRewardsToCollect) {
    console.info("Account is not yet ready to claim rewards", {
      accountState,
      event,
    });

    return {
      remainingFeeBalance,
      address,
      minimumRewardsToCollect,
    };
  }

  // retrieve + update fee balance (dynamodb)

  const txId = await algorandClient.sendTransaction(address);

  return {
    collectedReward: accountState.pendingRewards,
    transactionId: txId,
    remainingFeeBalance,
    address,
    minimumRewardsToCollect,
  };
};
