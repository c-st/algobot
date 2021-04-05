import { AlgorandClient } from "./clients/AlgorandClient";
import { SecretsManager } from "aws-sdk";
import { Secrets } from "./types";
import { GetSecretValueResponse } from "aws-sdk/clients/secretsmanager";

const secretsManager = new SecretsManager();
let secretResponse: GetSecretValueResponse;

const buildDependencies = async (
  secretArn: string
): Promise<{ algorandClient: AlgorandClient }> => {
  if (!secretArn) {
    throw Error("Environment variable secretArn is not set");
  }
  secretResponse =
    secretResponse === undefined
      ? await secretsManager.getSecretValue({ SecretId: secretArn }).promise()
      : secretResponse;

  const { algodApiKey, algodApiServer } = JSON.parse(
    secretResponse.SecretString!
  ) as Secrets;

  if (!algodApiKey || !algodApiServer) {
    throw Error("Missing secret values");
  }

  const algorandClient = new AlgorandClient(algodApiKey, algodApiServer);

  return { algorandClient };
};

export default buildDependencies;
