import * as CDK from "@aws-cdk/core";
import * as Amplify from "@aws-cdk/aws-amplify";
import { RedirectStatus } from "@aws-cdk/aws-amplify";

interface AlgotoolsWebappStackProps extends CDK.StackProps {}

export class AlgotoolsWebappStack extends CDK.Stack {
  static STACK_NAME = "AlgotoolsWebappStack";

  constructor(scope: CDK.Construct, props: AlgotoolsWebappStackProps) {
    super(scope, AlgotoolsWebappStack.STACK_NAME, props);

    // Amplify App
    const amplifyApp = new Amplify.App(this, "AlgotoolsApp", {
      sourceCodeProvider: new Amplify.GitHubSourceCodeProvider({
        owner: "c-st",
        repository: "algobot",
        oauthToken: CDK.SecretValue.secretsManager("github_token"),
      }),
      customRules: [
        {
          source: "/api/<*>",
          target: "https://api.algotools.io/<*>",
          status: RedirectStatus.REWRITE,
        },
        {
          source:
            "</^((?!.(css|gif|ico|jpg|js|json|png|txt|svg|woff|ttf|map)$).)*$/>",
          target: "/",
          status: Amplify.RedirectStatus.REWRITE,
        },
      ],
      environmentVariables: {},
    });

    // Git branch
    const mainBranch = amplifyApp.addBranch("main");

    // Domains
    const domain = amplifyApp.addDomain("algotools.io");
    domain.mapRoot(mainBranch);
    domain.mapSubDomain(mainBranch, "www");
  }
}
