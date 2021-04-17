import { handler } from "./determineTimeToWait";
import * as dependencies from "../../dependencies";

const mockAlgorandClient = {
  getAccountState: jest.fn(),
};

describe("determineTimeToWait", () => {
  beforeEach(() => {
    (dependencies as any).default = jest.fn().mockResolvedValue({
      algorandClient: mockAlgorandClient,
    });
  });

  it("returns immediately if rewards are already collectable", async () => {
    const parameters = {
      address: "1234ABC",
      minimumRewardsToCollect: 2,
    };

    mockAlgorandClient.getAccountState.mockResolvedValue({
      address: "1234ABC",
      amount: 200,
      amountWithoutPendingRewards: 198,
      pendingRewards: 2,
    });

    const response = await handler(parameters);

    expect(response).toStrictEqual({
      nextRewardCollection: expect.anything(),
      address: "1234ABC",
      minimumRewardsToCollect: 2,
    });
  });

  it("returns time calculated based on reward distribution", async () => {
    const parameters = {
      address: "1234ABC",
      minimumRewardsToCollect: 1,
    };

    mockAlgorandClient.getAccountState.mockResolvedValue({
      address: "1234ABC",
      amount: 420,
      amountWithoutPendingRewards: 420,
      pendingRewards: 0,
    });

    const response = await handler(parameters);

    expect(response).toStrictEqual({
      nextRewardCollection: expect.anything(),
      address: "1234ABC",
      minimumRewardsToCollect: 1,
    });
  });

  it("returns time calculated based on reward distribution 2", async () => {
    const parameters = {
      address: "1234ABC",
      minimumRewardsToCollect: 5,
    };

    mockAlgorandClient.getAccountState.mockResolvedValue({
      address: "1234ABC",
      amount: 420,
      amountWithoutPendingRewards: 420,
      pendingRewards: 0,
    });

    const response = await handler(parameters);
    response; //?
    expect(response).toStrictEqual({
      nextRewardCollection: expect.anything(),
      address: "1234ABC",
      minimumRewardsToCollect: 5,
    });
  });
});
