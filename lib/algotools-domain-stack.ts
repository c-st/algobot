import * as CDK from "@aws-cdk/core";
import * as ACM from "@aws-cdk/aws-certificatemanager";
import * as Route53 from "@aws-cdk/aws-route53";
import { RecordTarget, RecordType } from "@aws-cdk/aws-route53";
import { CertificateValidation } from "@aws-cdk/aws-certificatemanager";

export class AlgotoolsDomainStack extends CDK.Stack {
  static STACK_NAME = "AlgotoolsDomainStack";
  readonly acmCertificateArnOutput: CDK.CfnOutput;

  constructor(scope: CDK.Construct, props?: CDK.StackProps) {
    super(scope, AlgotoolsDomainStack.STACK_NAME, props);

    /**
     * Domain is a shared dependency between stages.
     * This is a bit tricky: we need to create a CF Output
     * and import the certificate with its ARN.
     *
     * See also https://github.com/aws/aws-cdk/issues/11360
     */

    // This hosted zone should have the same nameservers as listed here: https://console.aws.amazon.com/route53/home#DomainDetail:algotools.io
    const hostedZone = new Route53.PublicHostedZone(this, "PublicHostedZone", {
      zoneName: "algotools.io",
    });

    const acmCertificate = new ACM.DnsValidatedCertificate(
      this,
      "CrossRegionCertificate",
      {
        domainName: "algotools.io",
        subjectAlternativeNames: [
          "www.algotools.io",
          "test.algotools.io",
          "api.algotools.io",
          "api-test.algotools.io",
        ],
        hostedZone: hostedZone,
        region: "us-east-1",
        validation: CertificateValidation.fromDns(hostedZone),
      }
    );

    this.acmCertificateArnOutput = new CDK.CfnOutput(this, "acmCertificate", {
      exportName: "acmCertificateArn",
      value: acmCertificate.certificateArn,
    });
  }
}
