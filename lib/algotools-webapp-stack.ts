import * as CDK from "@aws-cdk/core";
import * as Amplify from "@aws-cdk/aws-amplify";

export class AlgotoolsWebappStack extends CDK.Stack {
  static STACK_NAME = "AlgotoolsWebappStack";

  constructor(scope: CDK.Construct, props?: CDK.StackProps) {
    super(scope, AlgotoolsWebappStack.STACK_NAME, props);

    const amplifyApp = new Amplify.App(this, "AlgotoolsApp", {
      sourceCodeProvider: new Amplify.GitHubSourceCodeProvider({
        owner: "c-st",
        repository: "algobot",
        oauthToken: CDK.SecretValue.secretsManager("github_token"),
      }),
      customRules: [
        {
          source:
            "</^((?!.(css|gif|ico|jpg|js|json|png|txt|svg|woff|ttf|map)$).)*$/>",
          target: "/",
          status: Amplify.RedirectStatus.REWRITE,
        },
      ],
      environmentVariables: {},
    });

    amplifyApp.addBranch("main");
    // add domains
  }
}
