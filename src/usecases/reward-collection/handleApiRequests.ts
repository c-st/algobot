import * as Lambda from "aws-lambda";
import {
  getAddressSettings,
  upsertAddressSettings,
} from "../../clients/dynamodb/algoAddressStore";
import buildDependencies from "../../dependencies";
import { UpdateRewardCollectionSettingsCommand } from "./types";

export const handler = async (
  event: Lambda.APIGatewayProxyEvent
): Promise<Lambda.APIGatewayProxyResult> => {
  const { address } = event.queryStringParameters || {};
  if (!address) {
    return lambdaResult(400, {
      errorMessage: "Missing query parameter in request: address",
    });
  }

  const { algorandClient } = await buildDependencies();

  switch (event.httpMethod) {
    case "GET": {
      const [addressSettings, accountState] = await Promise.all([
        getAddressSettings(address),
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
      // TODO: define and use JSONSchema for request
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
      } else {
        await handleUpdateRewardCollectionSettingsCommand({
          enable,
          address,
          minimumRewardsToCollect,
        });
        return lambdaResult(200, {});
      }
    }
  }

  return lambdaResult(400, { errorMessage: "Invalid request method" });
};

const handleUpdateRewardCollectionSettingsCommand = async (
  command: UpdateRewardCollectionSettingsCommand
) => {
  await upsertAddressSettings({
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
