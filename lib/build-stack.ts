import * as CDK from "@aws-cdk/core";
import * as CodePipeline from "@aws-cdk/aws-codepipeline";
import * as CodePipelineActions from "@aws-cdk/aws-codepipeline-actions";
import * as Pipelines from "@aws-cdk/pipelines";
import { AlgobotStage } from "./algobot-stage";

interface StageProps {
  apiDomainName: string;
  secretArn: string;
}

interface BuildStackProps extends CDK.StackProps {
  acmCertificateArnOutput: CDK.CfnOutput;
  hostedZoneIdOutput: CDK.CfnOutput;
  hostedZoneNameOutput: CDK.CfnOutput;
  // Stage-specific props:
  testProps: StageProps;
  productionProps: StageProps;
}

export class BuildStack extends CDK.Stack {
  static STACK_NAME = "AlgobotBuildStack";

  constructor(scope: CDK.Construct, props: BuildStackProps) {
    super(scope, BuildStack.STACK_NAME, props);

    const sourceArtifact = new CodePipeline.Artifact();
    const cloudAssemblyArtifact = new CodePipeline.Artifact();

    const sourceAction = new CodePipelineActions.GitHubSourceAction({
      actionName: "GitHub",
      output: sourceArtifact,
      oauthToken: CDK.SecretValue.secretsManager("github_token"),
      owner: "c-st",
      repo: "algobot",
      branch: "main",
    });

    const synthAction = Pipelines.SimpleSynthAction.standardYarnSynth({
      sourceArtifact,
      cloudAssemblyArtifact,
      buildCommand: "yarn install --frozen-lockfile && yarn test",
    });

    const pipeline = new Pipelines.CdkPipeline(this, "Pipeline", {
      pipelineName: "AlgobotPipeline",
      cloudAssemblyArtifact,
      sourceAction,
      synthAction,
    });

    // Test stage
    const acmCertificateArn = props.acmCertificateArnOutput.importValue;
    const hostedZoneId = props.hostedZoneIdOutput.importValue;
    const hostedZoneName = props.hostedZoneNameOutput.importValue;

    const testApp = new AlgobotStage(this, "Test", {
      acmCertificateArn,
      hostedZoneId,
      hostedZoneName,
      apiDomainName: props.testProps.apiDomainName,
      secretArn: props.testProps.secretArn,
    });
    pipeline.addApplicationStage(testApp);

    // Production stage
    const prodApp = new AlgobotStage(this, "Prod", {
      acmCertificateArn,
      hostedZoneId,
      hostedZoneName,
      apiDomainName: props.productionProps.apiDomainName,
      secretArn: props.productionProps.secretArn,
    });
    pipeline.addApplicationStage(prodApp);
  }
}
