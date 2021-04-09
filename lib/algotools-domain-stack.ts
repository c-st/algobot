import * as CDK from "@aws-cdk/core";
import * as ACM from "@aws-cdk/aws-certificatemanager";
import * as Route53 from "@aws-cdk/aws-route53";

export class AlgotoolsDomainStack extends CDK.Stack {
  static STACK_NAME = "AlgotoolsDomainStack";

  readonly acmCertificateArnOutput: CDK.CfnOutput;
  readonly hostedZoneIdOutput: CDK.CfnOutput;
  readonly hostedZoneNameOutput: CDK.CfnOutput;

  constructor(scope: CDK.Construct, props?: CDK.StackProps) {
    super(scope, AlgotoolsDomainStack.STACK_NAME, props);

    /**
     * Domain is a shared dependency between stages.
     * we need to create a CF Outputs and import the dependencies with their ARNs.
     *
     * See also https://github.com/aws/aws-cdk/issues/11360
     */

    // For certificate validation to work the hosted zone should have the
    // same nameservers as listed here:
    // https://console.aws.amazon.com/route53/home#DomainDetail:algotools.io
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
        validation: ACM.CertificateValidation.fromDns(hostedZone),
      }
    );

    this.hostedZoneIdOutput = new CDK.CfnOutput(this, "HostedZoneIdOutput", {
      exportName: "hostedZoneId",
      value: hostedZone.hostedZoneId,
    });

    this.hostedZoneNameOutput = new CDK.CfnOutput(
      this,
      "HostedZoneNameOutput",
      {
        exportName: "hostedZoneName",
        value: hostedZone.zoneName,
      }
    );

    this.acmCertificateArnOutput = new CDK.CfnOutput(
      this,
      "AcmCertificateOutput",
      {
        exportName: "acmCertificateArn",
        value: acmCertificate.certificateArn,
      }
    );
  }
}
