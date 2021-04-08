import * as path from "path";
import * as CDK from "@aws-cdk/core";
import * as ACM from "@aws-cdk/aws-certificatemanager";
import * as Lambda from "@aws-cdk/aws-lambda";
import * as ApiGateway from "@aws-cdk/aws-apigateway";
import * as SecretsManager from "@aws-cdk/aws-secretsmanager";
import * as LambdaNodeJs from "@aws-cdk/aws-lambda-nodejs";
import { buildCollectRewardsStateMachine } from "./buildCollectRewardsStateMachine";
import { NodejsFunctionProps } from "@aws-cdk/aws-lambda-nodejs";
import { EndpointType, SecurityPolicy } from "@aws-cdk/aws-apigateway";

export const DEFAULT_LAMBDA_SETTINGS: Partial<NodejsFunctionProps> = {
  timeout: CDK.Duration.seconds(2),
  memorySize: 512,
  tracing: Lambda.Tracing.ACTIVE,
  runtime: Lambda.Runtime.NODEJS_14_X,
};

interface AlgobotStackProps extends CDK.StackProps {
  acmCertificateArn: string;
  apiDomainName: string;
}

export class AlgobotStack extends CDK.Stack {
  readonly secret: SecretsManager.Secret;
  readonly urlOutput: CDK.CfnOutput;

  constructor(scope: CDK.Construct, id: string, props: AlgobotStackProps) {
    super(scope, id, props);

    this.secret = new SecretsManager.Secret(this, "Secret", {
      secretName: `${props.stackName}-Secrets`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({}),
        generateStringKey: "secret",
      },
      removalPolicy: CDK.RemovalPolicy.RETAIN,
    });

    buildCollectRewardsStateMachine(this);

    // Import certificate created in domain-stack
    const certificate = ACM.Certificate.fromCertificateArn(
      this,
      "Certificate",
      props.acmCertificateArn
    );

    const api = new ApiGateway.RestApi(this, "RestApi", {
      restApiName: `${props.stackName}-Api`,
      domainName: {
        domainName: props.apiDomainName, // "api.algotools.io",
        certificate,
        endpointType: EndpointType.EDGE,
        securityPolicy: SecurityPolicy.TLS_1_2,
      },
    });

    const apiRequestHandler = new LambdaNodeJs.NodejsFunction(
      this,
      "ApiRequestHandler",
      {
        entry: path.join(__dirname, "../src/lambdas/apiRequestHandler.ts"),
        ...DEFAULT_LAMBDA_SETTINGS,
      }
    );

    const rewardCollectionEndpoint = api.root.addResource("reward-collection");

    rewardCollectionEndpoint.addMethod(
      "GET",
      new ApiGateway.LambdaIntegration(apiRequestHandler)
    );

    rewardCollectionEndpoint.addMethod(
      "PUT",
      new ApiGateway.LambdaIntegration(apiRequestHandler)
    );

    this.urlOutput = new CDK.CfnOutput(this, "url", {
      value: api.url,
    });
  }
}
