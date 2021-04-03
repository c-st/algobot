import * as path from "path";
import * as CDK from "@aws-cdk/core";
import * as Lambda from "@aws-cdk/aws-lambda";
import { buildCollectRewardsStateMachine } from "./collectRewardsStateMachine";

export const DEFAULT_LAMBDA_SETTINGS = {
  timeout: CDK.Duration.seconds(3),
  memorySize: 128,
  tracing: Lambda.Tracing.ACTIVE,
  runtime: Lambda.Runtime.NODEJS_14_X,
};

export class AlgobotStack extends CDK.Stack {
  urlOutput: CDK.CfnOutput;

  constructor(scope: CDK.Construct, id: string, props?: CDK.StackProps) {
    super(scope, id, props);

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
