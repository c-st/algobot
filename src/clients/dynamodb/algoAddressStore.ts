import { Entity, Table } from "dynamodb-toolbox";
import { AlgoAddressSettings } from "../../usecases/reward-collection/types";
import { EntityStorage } from ".";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

export interface AlgoAddressStore {
  getAddressSettings(address: string): Promise<AlgoAddressSettings | undefined>;
  upsertAddressSettings(settings: AlgoAddressSettings): Promise<void>;
}

export class AddressStore implements AlgoAddressStore {
  private entity: EntityStorage<AlgoAddressSettings>;

  constructor(documentClient: DocumentClient) {
    const { ALGOADDRESSES_TABLENAME } = process.env;
    if (!ALGOADDRESSES_TABLENAME) {
      throw Error("Environment variable is not set: ALGOADDRESSES_TABLENAME");
    }

    const algoAddressTable = new Table({
      name: ALGOADDRESSES_TABLENAME!,
      partitionKey: "pk",
      DocumentClient: documentClient,
    });

    this.entity = new Entity<AlgoAddressSettings>({
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
      table: algoAddressTable,
    });
  }

  async getAddressSettings(
    address: string
  ): Promise<AlgoAddressSettings | undefined> {
    const settings = await this.entity.get({
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
  }

  async upsertAddressSettings(settings: AlgoAddressSettings) {
    await this.entity.update({
      ...settings,
    });
  }
}
