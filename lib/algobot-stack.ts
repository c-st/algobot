import * as path from "path";
import * as CDK from "@aws-cdk/core";
import * as ApiGateway from "@aws-cdk/aws-apigateway";
import * as LambdaNodeJs from "@aws-cdk/aws-lambda-nodejs";
import * as Lambda from "@aws-cdk/aws-lambda";
import * as SF from "@aws-cdk/aws-stepfunctions";
import * as SFTasks from "@aws-cdk/aws-stepfunctions-tasks";

const DEFAULT_LAMBDA_SETTINGS = {
  timeout: CDK.Duration.seconds(5),
  memorySize: 128,
  tracing: Lambda.Tracing.ACTIVE,
  runtime: Lambda.Runtime.NODEJS_14_X,
};

export class AlgobotStack extends CDK.Stack {
  urlOutput: CDK.CfnOutput;

  constructor(scope: CDK.Construct, id: string, props?: CDK.StackProps) {
    super(scope, id, props);

    const helloWorldHandler = new LambdaNodeJs.NodejsFunction(
      this,
      "HelloWorldHandler",
      {
        functionName: "HelloWorld",
        entry: path.join(__dirname, "../src/helloWorldHandler.ts"),
        ...DEFAULT_LAMBDA_SETTINGS,
      }
    );

    const api = new ApiGateway.LambdaRestApi(this, "Gateway", {
      description: "Endpoint for a simple Lambda-powered web service",
      handler: helloWorldHandler,
    });

    /**
     * - determine time to wait
     * - wait
     * - do things
     * - to: "determine time to wait" or to: "end"
     */
    const determineWaitTimeJob = new SFTasks.LambdaInvoke(
      this,
      "DetermineWaitTimeJob",
      {
        lambdaFunction: helloWorldHandler,
        outputPath: "$.Payload", // Lambda result
      }
    );

    const waitForExecution = new SF.Wait(this, "Wait X Seconds", {
      time: SF.WaitTime.duration(CDK.Duration.seconds(30)),
      // time: // SF.WaitTime.secondsPath("$.waitSeconds"),
    });

    const doSomeThingJob = new SFTasks.LambdaInvoke(this, "DomSomethingJob", {
      lambdaFunction: helloWorldHandler,
      outputPath: "$.Payload", // Lambda result
    });

    const definition = determineWaitTimeJob
      .next(waitForExecution)
      .next(doSomeThingJob);

    new SF.StateMachine(this, "StateMachine", {
      definition,
      // timeout: CDK.Duration.minutes(5),
    });

    this.urlOutput = new CDK.CfnOutput(this, "url", {
      value: api.url,
    });
  }
}
