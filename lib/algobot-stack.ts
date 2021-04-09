import * as path from "path";
import * as CDK from "@aws-cdk/core";
import * as Route53 from "@aws-cdk/aws-route53";
import * as Route53Targets from "@aws-cdk/aws-route53-targets";
import * as ACM from "@aws-cdk/aws-certificatemanager";
import * as Lambda from "@aws-cdk/aws-lambda";
import * as DynamoDB from "@aws-cdk/aws-dynamodb";
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
  secretArn: string;
  hostedZoneId: string;
  hostedZoneName: string;
  apiDomainName: string;
}

export class AlgobotStack extends CDK.Stack {
  readonly secret: SecretsManager.ISecret;
  readonly urlOutput: CDK.CfnOutput;

  constructor(scope: CDK.Construct, id: string, props: AlgobotStackProps) {
    super(scope, id, props);

    this.secret = SecretsManager.Secret.fromSecretAttributes(
      this,
      "ImportedSecret",
      {
        secretCompleteArn: props.secretArn,
      }
    );

    const stateMachine = buildCollectRewardsStateMachine(this);

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

    const zone = Route53.PublicHostedZone.fromHostedZoneAttributes(
      this,
      "HostedZone",
      {
        hostedZoneId: props.hostedZoneId,
        zoneName: props.hostedZoneName,
      }
    );

    // api.algotools.io -> api
    const subdomainName = props.apiDomainName.split(".")[0];

    new Route53.ARecord(this, "ApiARecord", {
      zone,
      recordName: subdomainName,
      target: Route53.RecordTarget.fromAlias(
        new Route53Targets.ApiGateway(api)
      ),
    });

    // Reward Collection

    // DynamoDb
    const algoAddressesTable = new DynamoDB.Table(this, "AlgoAddresses", {
      tableName: `${props.stackName}-AlgoAddresses`,
      partitionKey: {
        name: "pk",
        type: DynamoDB.AttributeType.STRING,
      },
      billingMode: DynamoDB.BillingMode.PAY_PER_REQUEST,
      encryption: DynamoDB.TableEncryption.AWS_MANAGED,
      removalPolicy: CDK.RemovalPolicy.DESTROY,
    });

    const apiRequestHandler = new LambdaNodeJs.NodejsFunction(
      this,
      "ApiRequestHandler",
      {
        entry: path.join(__dirname, "../src/usecases/reward-collection/apiRequestHandler.ts"),
        environment: { ALGOADDRESSES_TABLENAME: algoAddressesTable.tableName },
        ...DEFAULT_LAMBDA_SETTINGS,
      }
    );
    algoAddressesTable.grantReadWriteData(apiRequestHandler);
    stateMachine.grantStartExecution(apiRequestHandler);
    stateMachine.grantRead(apiRequestHandler);

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
