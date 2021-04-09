import { Entity, Table } from "dynamodb-toolbox";
import { DocumentClient } from "../../dependencies";
import { AlgoAddressSettings } from "../../usecases/reward-collection/types";
import { EntityStorage } from ".";

const { ALGOADDRESSES_TABLENAME } = process.env;

if (!ALGOADDRESSES_TABLENAME) {
  throw Error("Environment variable is not set: ALGOADDRESSES_TABLENAME");
}

const AlgoAddressTable = new Table({
  name: ALGOADDRESSES_TABLENAME,
  partitionKey: "pk",
  DocumentClient,
});

const AlgoAddressSettingsEntity: EntityStorage<AlgoAddressSettings> = new Entity<AlgoAddressSettings>(
  {
    name: "AlgoAddressSettings",
    attributes: {
      address: { partitionKey: true },
      rewardCollectionEnabled: {
        type: "boolean",
        default: false,
        required: false,
      },
      minimumRewardsToCollect: { type: "number", required: false },
      rewardCollectionExecutionId: { type: "string", required: false },
    },
    table: AlgoAddressTable,
  }
);

export const getAddressSettings = async (
  address: string
): Promise<AlgoAddressSettings | undefined> => {
  const settings = await AlgoAddressSettingsEntity.get({
    address,
  });
  if (!settings.Item) {
    return undefined;
  }
  const { rewardCollectionEnabled, minimumRewardsToCollect } = settings.Item;
  return {
    address,
    rewardCollectionEnabled,
    minimumRewardsToCollect,
  };
};

export const upsertAddressSettings = async (settings: AlgoAddressSettings) => {
  await AlgoAddressSettingsEntity.update({
    ...settings,
  });
};
