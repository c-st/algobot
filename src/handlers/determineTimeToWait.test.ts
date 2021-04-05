import { handler } from "./determineTimeToWait";
import * as dependencies from "../dependencies";

const mockAlgorandClient = {
  getAccountState: jest.fn(),
};

describe("determineTimeToWait", () => {
  beforeEach(() => {
    (dependencies as any).default = jest.fn().mockResolvedValue({
      algorandClient: mockAlgorandClient,
    });
  });

  it("returns 0 if rewards are already collectable", async () => {
    const parameters = {
      address: "1234ABC",
      minimumRewardToCollect: 2,
    };

    mockAlgorandClient.getAccountState.mockResolvedValue({
      address: "1234ABC",
      amount: 200,
      amountWithoutPendingRewards: 198,
      pendingRewards: 2,
    });

    expect(await handler(parameters)).toStrictEqual({
      waitTimeSeconds: 0,
      address: "1234ABC",
      minimumRewardToCollect: 2,
    });
  });

  it("returns time calculated based on reward distribution", async () => {
    const parameters = {
      address: "1234ABC",
      minimumRewardToCollect: 1,
    };

    mockAlgorandClient.getAccountState.mockResolvedValue({
      address: "1234ABC",
      amount: 420,
      amountWithoutPendingRewards: 420,
      pendingRewards: 0,
    });

    expect(await handler(parameters)).toStrictEqual({ 
      waitTimeSeconds: 21533 * 60,
      address: "1234ABC",
      minimumRewardToCollect: 1,
    });
  });
});
