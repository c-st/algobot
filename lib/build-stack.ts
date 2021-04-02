import * as CDK from "@aws-cdk/core";
import * as CodePipeline from "@aws-cdk/aws-codepipeline";
import * as CodePipelineActions from "@aws-cdk/aws-codepipeline-actions";
import * as Pipelines from "@aws-cdk/pipelines";
import { AlgobotStage } from "./algobot-stage";

export class BuildStack extends CDK.Stack {
  static STACK_NAME = "AlgobotBuildStack";

  constructor(scope: CDK.Construct, props?: CDK.StackProps) {
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
    });

    const pipeline = new Pipelines.CdkPipeline(this, "Pipeline", {
      cloudAssemblyArtifact,
      sourceAction,
      synthAction,
    });

    // Test stage
    const testApp = new AlgobotStage(this, "Test");
    const testStage = pipeline.addApplicationStage(testApp);
    const appApiUrl = pipeline.stackOutput(testApp.urlOutput);

    testStage.addActions(
      new Pipelines.ShellScriptAction({
        actionName: "UnitTests",
        runOrder: testStage.nextSequentialRunOrder(),
        additionalArtifacts: [sourceArtifact],
        commands: ["yarn install --frozen-lockfile", "yarn test"],
        useOutputs: {
          API_URL: appApiUrl,
        },
      })
    );

    // Production stage
    // const prodApp = new AlgobotStage(this, "Prod");
    // pipeline.addApplicationStage(prodApp);
  }
}
