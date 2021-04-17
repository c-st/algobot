import { AlgorandClient } from "./clients/AlgorandClient";
import {
  AwsStepFunctionsClient,
  StepFunctionsClient,
} from "./clients/stepFunctionsClient";
import { SecretsManager } from "aws-sdk";
import { Secret } from "./types";
import { GetSecretValueResponse } from "aws-sdk/clients/secretsmanager";
import AWSXRay from "aws-xray-sdk-core";
import {
  AddressStore,
  AlgoAddressStore,
} from "./clients/dynamodb/algoAddressStore";

const AWS = AWSXRay.captureAWS(require("aws-sdk"));
const documentClient = new AWS.DynamoDB.DocumentClient() as AWS.DynamoDB.DocumentClient;
const stepFunctionsClient = new AWS.StepFunctions() as AWS.StepFunctions;

// Dependencies which require secret values:
const secretsManager = new SecretsManager();
let secretResponse: GetSecretValueResponse;

type Dependencies = {
  addressStore: AlgoAddressStore;
  algorandClient: AlgorandClient;
  stepFunctionsClient: StepFunctionsClient;
};

const buildDependencies = async (
  secretArn: string = process.env.SECRET_ARN!
): Promise<Dependencies> => {
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

  const addressStore = new AddressStore(documentClient);

  return {
    addressStore,
    algorandClient,
    stepFunctionsClient: new AwsStepFunctionsClient(stepFunctionsClient),
  };
};

export default buildDependencies;
