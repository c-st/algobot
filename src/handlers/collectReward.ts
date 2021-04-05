import buildDependencies from "../dependencies";
import { CollectRewardResult, RewardCollectionParameters } from "../types";

export const handler = async (
  event: RewardCollectionParameters
): Promise<CollectRewardResult> => {
  const { address, minimumRewardToCollect } = event;
  console.log(
    `Claiming rewards for ${address} (minimum ${minimumRewardToCollect})`,
    event
  );

  const { algorandClient } = await buildDependencies(process.env.SECRET_ARN!);
  const remainingFeeBalance = 0.98; // TODO: fetch for address
  const accountState = await algorandClient.getAccountState(address);

  // Pending rewards have been claimed in the meanwhile
  if (accountState.pendingRewards < minimumRewardToCollect) {
    console.info("Account is not yet ready to claim rewards", {
      accountState,
      event,
    });

    return {
      remainingFeeBalance,
      ...event,
    };
  }

  // retrieve + update fee balance (dynamodb)

  const txId = await algorandClient.sendTransaction(address);

  return {
    collectedReward: accountState.pendingRewards,
    transactionId: txId,
    remainingFeeBalance,
    ...event,
  };
};
