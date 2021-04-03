import * as path from "path";
import * as CDK from "@aws-cdk/core";
import * as Lambda from "@aws-cdk/aws-lambda";
import * as SecretsManager from "@aws-cdk/aws-secretsmanager";
import { buildCollectRewardsStateMachine } from "./collectRewardsStateMachine";
import { NodejsFunctionProps } from "@aws-cdk/aws-lambda-nodejs";

export const DEFAULT_LAMBDA_SETTINGS: Partial<NodejsFunctionProps> = {
  timeout: CDK.Duration.seconds(3),
  memorySize: 128,
  tracing: Lambda.Tracing.ACTIVE,
  runtime: Lambda.Runtime.NODEJS_14_X,
};
export class AlgobotStack extends CDK.Stack {
  readonly secret: SecretsManager.Secret;
  readonly urlOutput: CDK.CfnOutput;

  constructor(scope: CDK.Construct, id: string, props?: CDK.StackProps) {
    super(scope, id, props);

    this.secret = new SecretsManager.Secret(this, "Secret", {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({}),
        generateStringKey: "secret",
      },
      removalPolicy: CDK.RemovalPolicy.RETAIN,
    });

    // const api = new ApiGateway.LambdaRestApi(this, "Gateway", {
    //   description: "Endpoint for a simple Lambda-powered web service",
    //   handler: helloWorldHandler,
    // });

    buildCollectRewardsStateMachine(this);

    this.urlOutput = new CDK.CfnOutput(this, "url", {
      value: "tbd", // api.url,
    });
  }
}
