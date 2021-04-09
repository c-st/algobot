import { AlgorandClient } from "./clients/AlgorandClient";
import { SecretsManager } from "aws-sdk";
import { Secret } from "./types";
import { GetSecretValueResponse } from "aws-sdk/clients/secretsmanager";
import AWSXRay from "aws-xray-sdk-core";
// const AWSXRay = require("aws-xray-sdk-core");

const AWS = AWSXRay.captureAWS(require("aws-sdk"));
export const DynamoDbClient = new AWS.DynamoDB() as AWS.DynamoDB;
export const DocumentClient = new AWS.DynamoDB.DocumentClient() as AWS.DynamoDB.DocumentClient;

// Dependencies which require secret values:
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

  const { algodApiKey, algodApiServer, mnemonic } = JSON.parse(
    secretResponse.SecretString!
  ) as Secret;

  if (!algodApiKey || !algodApiServer) {
    throw Error("Missing secret values");
  }

  const algorandClient = new AlgorandClient(
    algodApiKey,
    mnemonic,
    algodApiServer
  );

  return { algorandClient };
};

export default buildDependencies;
