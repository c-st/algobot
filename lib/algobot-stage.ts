import * as CDK from "@aws-cdk/core";
import * as ACM from "@aws-cdk/aws-certificatemanager";
import { AlgobotStack } from "./algobot-stack";

interface AlgobotStageProps extends CDK.StackProps {
  acmCertificateArn: string;
  apiDomainName: string;
}

export class AlgobotStage extends CDK.Stage {
  readonly urlOutput: CDK.CfnOutput;

  constructor(scope: CDK.Construct, id: string, props: AlgobotStageProps) {
    super(scope, id, props);

    const { apiDomainName, acmCertificateArn } = props;

    const app = new AlgobotStack(this, "Algobot", {
      tags: {
        Application: "Algobot",
        Environment: id,
      },
      stackName: `Algobot${id}`,
      apiDomainName,
      acmCertificateArn,
    });

    this.urlOutput = app.urlOutput;
  }
}
