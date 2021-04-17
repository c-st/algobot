import * as Lambda from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { AttributeMap } from "aws-sdk/clients/dynamodb";
import { AlgoAddressStore } from "../../clients/dynamodb/algoAddressStore";
import buildDependencies from "../../dependencies";
import { AlgoAddressSettings } from "./types";

function convertSettingsPayload(
  attributeMap: AttributeMap
): AlgoAddressSettings {
  const settings = DynamoDB.Converter.unmarshall(attributeMap);
  const {
    pk: address,
    rewardCollectionEnabled,
    minimumRewardsToCollect,
    rewardCollectionExecutionId,
  } = settings;
  return {
    address,
    rewardCollectionEnabled,
    minimumRewardsToCollect,
    rewardCollectionExecutionId,
  };
}

export const handler = async (
  event: Lambda.DynamoDBStreamEvent
): Promise<void> => {
  const STATEMACHINE_ARN = process.env.REWARD_COLLECTION_STATEMACHINE_ARN!;
  const { addressStore, stepFunctionsClient } = await buildDependencies();

  console.log("Handling event", JSON.stringify(event));

  await Promise.all(
    event.Records.map(async (record) => {
      switch (record.eventName) {
        case "INSERT": {
          const newSettings = convertSettingsPayload(
            record.dynamodb!.NewImage!
          );
          const {
            address,
            rewardCollectionEnabled,
            minimumRewardsToCollect,
          } = newSettings;
          const rewardCollectionExecutionId = await stepFunctionsClient.startExecution(
            STATEMACHINE_ARN,
            {
              address,
              rewardCollectionEnabled,
              minimumRewardsToCollect,
            }
          );
          await addressStore.upsertAddressSettings({
            address,
            rewardCollectionEnabled,
            minimumRewardsToCollect,
            rewardCollectionExecutionId,
          });
          return;
        }

        case "MODIFY": {
          const newSettings = convertSettingsPayload(
            record.dynamodb!.NewImage!
          );
          const oldSettings = convertSettingsPayload(
            record.dynamodb!.OldImage!
          );
          const {
            address,
            rewardCollectionEnabled,
            minimumRewardsToCollect,
          } = newSettings;
          if (
            oldSettings.rewardCollectionEnabled !==
            newSettings.rewardCollectionEnabled
          ) {
            if (!newSettings.rewardCollectionEnabled) {
              await stepFunctionsClient.stopExecution(
                oldSettings.rewardCollectionExecutionId!
              );

              await addressStore.upsertAddressSettings({
                address,
                rewardCollectionEnabled,
                minimumRewardsToCollect,
                rewardCollectionExecutionId: undefined,
              });
            } else {
              const rewardCollectionExecutionId = await stepFunctionsClient.startExecution(
                STATEMACHINE_ARN,
                {
                  address,
                  minimumRewardsToCollect,
                }
              );
              await addressStore.upsertAddressSettings({
                address,
                rewardCollectionEnabled,
                minimumRewardsToCollect,
                rewardCollectionExecutionId,
              });
            }
          } else if (
            newSettings.rewardCollectionEnabled &&
            oldSettings.minimumRewardsToCollect !==
              newSettings.minimumRewardsToCollect
          ) {
            await stepFunctionsClient.stopExecution(
              oldSettings.rewardCollectionExecutionId!
            );
            const rewardCollectionExecutionId = await stepFunctionsClient.startExecution(
              STATEMACHINE_ARN,
              {
                address,
                minimumRewardsToCollect,
              }
            );
            await addressStore.upsertAddressSettings({
              address,
              rewardCollectionEnabled,
              minimumRewardsToCollect,
              rewardCollectionExecutionId,
            });
          }
          return;
        }

        case "REMOVE": {
          const previousSettings = convertSettingsPayload(
            record.dynamodb!.OldImage!
          );
          await stepFunctionsClient.stopExecution(
            previousSettings.rewardCollectionExecutionId!
          );
          return;
        }
      }
    })
  );
};
