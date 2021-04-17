import { DynamoDBStreamEvent } from "aws-lambda";
import { handler } from "./handleSettingsChanged";
import * as dependencies from "../../dependencies";
import { StepFunctionsClient } from "../../clients/stepFunctionsClient";
import { AlgoAddressStore } from "../../clients/dynamodb/algoAddressStore";
import { DynamoDB } from "aws-sdk";

let stepFunctionsClientMock: jest.Mocked<StepFunctionsClient>;
let addressStoreMock: jest.Mocked<AlgoAddressStore>;

const buildSettingsPayload = (
  rewardCollectionEnabled: boolean = false,
  minimumRewardsToCollect?: number,
  rewardCollectionExecutionId?: string,
  address: string = "ABCD-123"
) =>
  DynamoDB.Converter.marshall({
    pk: address,
    rewardCollectionEnabled,
    minimumRewardsToCollect: minimumRewardsToCollect,
    rewardCollectionExecutionId,
  });

describe("handleSettingsChanged", () => {
  beforeEach(() => {
    stepFunctionsClientMock = {
      startExecution: jest.fn(),
      stopExecution: jest.fn(),
    };
    addressStoreMock = {
      getAddressSettings: jest.fn(),
      upsertAddressSettings: jest.fn(),
    };
    (dependencies as any).default = jest.fn().mockResolvedValue({
      addressStore: addressStoreMock,
      stepFunctionsClient: stepFunctionsClientMock,
    });
  });
  it("starts rewards collection if it wasn't running before (-> start)", async () => {
    stepFunctionsClientMock.startExecution.mockResolvedValue("execution-id");
    await handler({
      Records: [
        {
          eventName: "INSERT",
          dynamodb: { NewImage: buildSettingsPayload(true, 5) },
        },
      ],
    } as DynamoDBStreamEvent);

    expect(stepFunctionsClientMock.startExecution).toHaveBeenCalledWith(
      "rewardcollection-arn",
      {
        address: "ABCD-123",
        rewardCollectionEnabled: true,
        minimumRewardsToCollect: 5,
      }
    );
    expect(stepFunctionsClientMock.stopExecution).not.toHaveBeenCalled();
    expect(addressStoreMock.upsertAddressSettings).toHaveBeenCalledWith({
      address: "ABCD-123",
      rewardCollectionEnabled: true,
      minimumRewardsToCollect: 5,
      rewardCollectionExecutionId: "execution-id",
    });
  });

  it("stops reward collection (start -> stop)", async () => {
    await handler({
      Records: [
        {
          eventName: "MODIFY",
          dynamodb: {
            OldImage: buildSettingsPayload(true, 5, "execution-arn"),
            NewImage: buildSettingsPayload(false, 5),
          },
        },
      ],
    } as DynamoDBStreamEvent);

    expect(stepFunctionsClientMock.stopExecution).toHaveBeenCalled();
    expect(stepFunctionsClientMock.startExecution).not.toHaveBeenCalled();
    expect(addressStoreMock.upsertAddressSettings).toHaveBeenCalledWith({
      address: "ABCD-123",
      rewardCollectionEnabled: false,
      minimumRewardsToCollect: 5,
      rewardCollectionExecutionId: undefined,
    });
  });

  it("starts reward collection (stop -> start)", async () => {
    stepFunctionsClientMock.startExecution.mockResolvedValue("execution-id");

    await handler({
      Records: [
        {
          eventName: "MODIFY",
          dynamodb: {
            OldImage: buildSettingsPayload(false, 6),
            NewImage: buildSettingsPayload(true, 6),
          },
        },
      ],
    } as DynamoDBStreamEvent);

    expect(stepFunctionsClientMock.stopExecution).not.toHaveBeenCalled();
    expect(stepFunctionsClientMock.startExecution).toHaveBeenCalledWith(
      "rewardcollection-arn",
      {
        address: "ABCD-123",
        minimumRewardsToCollect: 6,
      }
    );
    expect(addressStoreMock.upsertAddressSettings).toHaveBeenCalledWith({
      address: "ABCD-123",
      rewardCollectionEnabled: true,
      minimumRewardsToCollect: 6,
      rewardCollectionExecutionId: "execution-id",
    });
  });

  it("doesn't change execution if it was neither stopped nor started", async () => {
    await handler({
      Records: [
        {
          eventName: "MODIFY",
          dynamodb: {
            OldImage: buildSettingsPayload(true, 6, "execution-id"),
            NewImage: buildSettingsPayload(true, 6, "execution-id2"),
          },
        },
      ],
    } as DynamoDBStreamEvent);

    expect(stepFunctionsClientMock.startExecution).not.toHaveBeenCalled();
    expect(stepFunctionsClientMock.stopExecution).not.toHaveBeenCalled();
    expect(addressStoreMock.upsertAddressSettings).not.toHaveBeenCalled();
  });

  it("adjusts collection amount by stopping and starting", async () => {
    stepFunctionsClientMock.startExecution.mockResolvedValue("execution-id2");

    await handler({
      Records: [
        {
          eventName: "MODIFY",
          dynamodb: {
            OldImage: buildSettingsPayload(true, 6, "execution-id"),
            NewImage: buildSettingsPayload(true, 4, "execution-id"),
          },
        },
      ],
    } as DynamoDBStreamEvent);

    expect(stepFunctionsClientMock.stopExecution).toHaveBeenCalledWith(
      "execution-id"
    );
    expect(stepFunctionsClientMock.startExecution).toHaveBeenCalledWith(
      "rewardcollection-arn",
      {
        address: "ABCD-123",
        minimumRewardsToCollect: 4,
      }
    );
    expect(addressStoreMock.upsertAddressSettings).toHaveBeenCalledWith({
      address: "ABCD-123",
      rewardCollectionEnabled: true,
      minimumRewardsToCollect: 4,
      rewardCollectionExecutionId: "execution-id2",
    });
  });

  it("does not adjust collection amount if collection is not running", async () => {
    await handler({
      Records: [
        {
          eventName: "MODIFY",
          dynamodb: {
            OldImage: buildSettingsPayload(false, 6, "execution-id"),
            NewImage: buildSettingsPayload(false, 4, "execution-id"),
          },
        },
      ],
    } as DynamoDBStreamEvent);

    expect(stepFunctionsClientMock.startExecution).not.toHaveBeenCalled();
    expect(stepFunctionsClientMock.stopExecution).not.toHaveBeenCalled();
    expect(addressStoreMock.upsertAddressSettings).not.toHaveBeenCalled();
  });

  it("stop reward collection if entry is removed", async () => {
    await handler({
      Records: [
        {
          eventName: "REMOVE",
          dynamodb: {
            OldImage: buildSettingsPayload(false, 6, "execution-id"),
          },
        },
      ],
    } as DynamoDBStreamEvent);

    expect(stepFunctionsClientMock.startExecution).not.toHaveBeenCalled();
    expect(stepFunctionsClientMock.stopExecution).toHaveBeenCalledWith(
      "execution-id"
    );
    expect(addressStoreMock.upsertAddressSettings).not.toHaveBeenCalled();
  });
});
