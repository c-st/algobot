import * as CDK from "@aws-cdk/core";

export class AlgobotStack extends CDK.Stack {
  urlOutput: CDK.CfnOutput;

  constructor(scope: CDK.Construct, id: string, props?: CDK.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    this.urlOutput = new CDK.CfnOutput(this, "url", {
      value: "TODO replace with api.url",
    });
  }
}
