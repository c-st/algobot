import * as dependencies from "../../dependencies";
import { handler } from "./handleApiRequests";

const mockAlgorandClient = {
  getAccountState: jest.fn(),
};

const mockAddressStore = {
  getAddressSettings: jest.fn(),
  upsertAddressSettings: jest.fn(),
};

describe("handleApiRequests", () => {
  beforeEach(() => {
    (dependencies as any).default = jest.fn().mockResolvedValue({
      addressStore: mockAddressStore,
      algorandClient: mockAlgorandClient,
    });
  });

  it("returns settings and current reward balance", async () => {
    const parameters = ({
      httpMethod: "GET",
      queryStringParameters: {
        address: "ABCD123",
      },
    } as unknown) as any;

    mockAlgorandClient.getAccountState.mockResolvedValue({
      pendingRewards: 1.23,
    });

    mockAddressStore.getAddressSettings.mockResolvedValue({
      address: "ABCD123",
      rewardCollectionEnabled: false,
      minimumRewardsToCollect: 2,
    });

    const response = await handler(parameters);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toStrictEqual({
      address: "ABCD123",
      rewardCollectionEnabled: false,
      minimumRewardsToCollect: 2,
      pendingRewards: 1.23,
    });
  });

  it("only returns reward balance with unknown addresses", async () => {
    const parameters = ({
      httpMethod: "GET",
      queryStringParameters: {
        address: "FOOBAR123",
      },
    } as unknown) as any;

    mockAlgorandClient.getAccountState.mockResolvedValue({
      pendingRewards: 2.5,
    });
    mockAddressStore.getAddressSettings.mockResolvedValue(undefined);

    const response = await handler(parameters);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toStrictEqual({
      address: "FOOBAR123",
      rewardCollectionEnabled: false,
      pendingRewards: 2.5,
    });
  });

  it("returns 400 with missing query parameter", async () => {
    const parameters = ({
      httpMethod: "GET",
    } as unknown) as any;

    const response = await handler(parameters);
    expect(response.statusCode).toBe(400);
  });

  it("returns 400 with invalid addresses", async () => {
    const parameters = ({
      httpMethod: "GET",
      queryStringParameters: {
        address: "INVALID",
      },
    } as unknown) as any;

    mockAlgorandClient.getAccountState.mockResolvedValue(undefined);

    const response = await handler(parameters);
    expect(response.statusCode).toBe(400);
  });
});
