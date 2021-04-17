import * as Lambda from "aws-lambda";
import {
  AlgoAddressStore,
} from "../../clients/dynamodb/algoAddressStore";

import buildDependencies from "../../dependencies";
import {
  UpdateRewardCollectionSettingsCommand,
} from "./types";

export const handler = async (
  event: Lambda.APIGatewayProxyEvent
): Promise<Lambda.APIGatewayProxyResult> => {
  const { addressStore, algorandClient } = await buildDependencies();

  switch (event.httpMethod) {
    case "GET": {
      const { address } = event.queryStringParameters || {};
      if (!address) {
        return lambdaResult(400, {
          errorMessage: "Missing query parameter in request: address",
        });
      }
      const [addressSettings, accountState] = await Promise.all([
        addressStore.getAddressSettings(address),
        algorandClient.getAccountState(address), // todo: handle error (invalid address)
      ]);
      if (!accountState) {
        return lambdaResult(400, {
          errorMessage: "Invalid ALGO address provided",
        });
      } else if (!addressSettings) {
        return lambdaResult(200, {
          address,
          rewardCollectionEnabled: false,
          pendingRewards: accountState.pendingRewards,
        });
      }
      return lambdaResult(200, {
        ...addressSettings,
        pendingRewards: accountState.pendingRewards,
      });
    }

    case "PUT": {
      if (!event.body) {
        return lambdaResult(400, {
          errorMessage: "Missing request body",
        });
      }
      const requestBody = JSON.parse(event.body);
      const { enable, address, minimumRewardsToCollect } = requestBody;
      if (enable === undefined || !address || !minimumRewardsToCollect) {
        return lambdaResult(400, {
          errorMessage: "Missing request body parameters",
        });
      }
      const [_, accountState] = await Promise.all([
        await handleUpdateRewardCollectionSettingsCommand(addressStore, {
          enable,
          address,
          minimumRewardsToCollect,
        }),
        algorandClient.getAccountState(address),
      ]);
      const result = {
        address,
        rewardCollectionEnabled: enable,
        minimumRewardsToCollect,
        pendingRewards: accountState?.pendingRewards ?? -1,
      };
      return lambdaResult(200, result);
    }
  }

  return lambdaResult(400, { errorMessage: "Invalid request method" });
};

const handleUpdateRewardCollectionSettingsCommand = async (
  addressStore: AlgoAddressStore,
  command: UpdateRewardCollectionSettingsCommand
) => {
  await addressStore.upsertAddressSettings({
    rewardCollectionEnabled: command.enable,
    address: command.address,
    minimumRewardsToCollect: command.minimumRewardsToCollect,
  });
};

const lambdaResult = (
  statusCode: number,
  body: Record<any, any>
): Lambda.APIGatewayProxyResult => ({
  statusCode,
  body: JSON.stringify(body),
  isBase64Encoded: false,
});
