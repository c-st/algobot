import * as CDK from "@aws-cdk/core";
import * as ACM from "@aws-cdk/aws-certificatemanager";
import * as CodePipeline from "@aws-cdk/aws-codepipeline";
import * as CodePipelineActions from "@aws-cdk/aws-codepipeline-actions";
import * as Pipelines from "@aws-cdk/pipelines";
import { AlgobotStage } from "./algobot-stage";
import { Fn } from "@aws-cdk/core";

interface BuildStackProps extends CDK.StackProps {
  acmCertificateArnOutput: CDK.CfnOutput;
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
    // ACM.DnsValidatedCertificate

    // const acmCertificate = Fn.importValue(
    //   props.acmCertificateArnOutput.importValue
    // );
    const acmCertificateArn = props.acmCertificateArnOutput.importValue;

    const testApp = new AlgobotStage(this, "Test", {
      acmCertificateArn,
      apiDomainName: "api-test.algotools.io",
    });
    pipeline.addApplicationStage(testApp);
    // const appApiUrl = pipeline.stackOutput(testApp.urlOutput);

    // testStage.addActions(
    //   new ManualApprovalAction({
    //     actionName: "ManualApproval",
    //     runOrder: testStage.nextSequentialRunOrder(),
    //   })
    // );

    // Production stage
    const prodApp = new AlgobotStage(this, "Prod", {
      acmCertificateArn,
      apiDomainName: "api.algotools.io",
    });
    pipeline.addApplicationStage(prodApp);
  }
}
