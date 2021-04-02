import * as CDK from "@aws-cdk/core";
import { AlgobotStack } from "./algobot-stack";

export class AlgobotStage extends CDK.Stage {
  readonly urlOutput: CDK.CfnOutput;

  constructor(scope: CDK.Construct, id: string, props?: CDK.StackProps) {
    super(scope, id, props);

    const app = new AlgobotStack(this, "AlgobotApp", {
      tags: {
        Application: "Algobot",
        Environment: id,
      },
    });

    this.urlOutput = app.urlOutput;
  }
}
