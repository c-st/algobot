import { AlgorandClient } from "./clients/AlgorandClient";
import { SecretsManager } from "aws-sdk";
import { Secrets } from "./types";

const secretsManager = new SecretsManager();

const buildDependencies = async (
  secretArn: string
): Promise<{ algorandClient: AlgorandClient }> => {
  if (!secretArn) {
    throw Error("Environment variable secretArn is not set");
  }
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

export default buildDependencies;
