import { AlgoAddress, CollectRewardResult } from "../types";

export const handler = async (event: {
  address: AlgoAddress;
  minimumRewardToCollect: number;
}): Promise<CollectRewardResult> => {
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
    address,
    feeBalance: 1.005,
    balance: 1243,
  };
};
