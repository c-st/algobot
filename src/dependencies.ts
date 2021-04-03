import { AlgorandClient } from "./clients/AlgorandClient";
import { SecretsManager } from "aws-sdk";
import { Secrets } from "./types";

const secretsManager = new SecretsManager();

export const dependencies = async (secretArn: string) => {
  const secrets = await secretsManager
    .getSecretValue({ SecretId: secretArn })
    .promise();

  const { algodApiKey, algodApiServer } = JSON.parse(
    secrets.SecretString!
  ) as Secrets;

  if (!algodApiKey || !algodApiServer) {
    throw Error("Missing secret values");
  }

  const algorandClient = new AlgorandClient(algodApiKey, algodApiServer);

  return { algorandClient };
};
