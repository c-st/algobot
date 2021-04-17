import { handler } from "./collectReward";
import * as dependencies from "../../dependencies";

const mockAlgorandClient = {
  getAccountState: jest.fn(),
  sendTransaction: jest.fn(),
};

describe("collectRewards", () => {
  beforeEach(() => {
    (dependencies as any).default = jest.fn().mockResolvedValue({
      algorandClient: mockAlgorandClient,
    });
  });

  it("does not claim if minimum reward has not been reached", async () => {
    const parameters = {
      address: "1234ABC",
      minimumRewardsToCollect: 2,
    };

    mockAlgorandClient.getAccountState.mockResolvedValue({
      address: "1234ABC",
      amount: 200,
      amountWithoutPendingRewards: 198.8,
      pendingRewards: 1.2,
    });

    expect(await handler(parameters)).toStrictEqual({
      remainingFeeBalance: 1.0,
      address: "1234ABC",
      minimumRewardsToCollect: 2,
    });
  });

  it("claims rewards if minimal amount to claim is reached", async () => {
    const parameters = {
      address: "1234ABC",
      minimumRewardsToCollect: 2,
    };

    mockAlgorandClient.getAccountState.mockResolvedValue({
      address: "1234ABC",
      amount: 205,
      amountWithoutPendingRewards: 200,
      pendingRewards: 5,
    });
    mockAlgorandClient.sendTransaction.mockResolvedValue("TXID");

    const result = await handler(parameters);

    expect(mockAlgorandClient.sendTransaction).toHaveBeenCalledWith("1234ABC");
    expect(result).toStrictEqual({
      collectedReward: 5,
      transactionId: "TXID",
      remainingFeeBalance: 1.0,
      address: "1234ABC",
      minimumRewardsToCollect: 2,
    });
  });
});
