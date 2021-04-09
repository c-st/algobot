import * as CDK from "@aws-cdk/core";
import { AlgobotStack } from "./algobot-stack";

interface AlgobotStageProps extends CDK.StackProps {
  secretArn: string;
  hostedZoneId: string;
  hostedZoneName: string;
  acmCertificateArn: string;
  apiDomainName: string;
}

export class AlgobotStage extends CDK.Stage {
  readonly urlOutput: CDK.CfnOutput;

  constructor(scope: CDK.Construct, id: string, props: AlgobotStageProps) {
    super(scope, id, props);

    const {
      apiDomainName,
      acmCertificateArn,
      secretArn,
      hostedZoneId,
      hostedZoneName,
    } = props;

    const app = new AlgobotStack(this, "Algobot", {
      tags: {
        Application: "Algobot",
        Environment: id,
      },
      stackName: `Algobot${id}`,
      secretArn,
      hostedZoneId,
      hostedZoneName,
      apiDomainName,
      acmCertificateArn,
    });

    this.urlOutput = app.urlOutput;
  }
}
