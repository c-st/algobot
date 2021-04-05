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
  const accountState = await algorandClient.getAccountState(address);

  if (accountState.pendingRewards < minimumRewardToCollect) {
    console.info("Account is not yet ready to claim rewards", {
      accountState,
      event,
    });

    return {
      collectedReward: undefined,
      ...event,
    };
  }

  // retrieve + update fee balance (dynamodb)

  const txId = await algorandClient.sendTransaction(address);
  console.log("sent a tx", { txId });

  return {
    collectedReward: accountState.pendingRewards,
    remainingFeeBalance: 1.003,
    ...event,
  };
};
