#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { BuildStack } from "../lib/build-stack";
import { AlgotoolsDomainStack } from "../lib/algotools-domain-stack";
import { AlgotoolsWebappStack } from "../lib/algotools-webapp-stack";

const app = new cdk.App(); // add props here

const domainStack = new AlgotoolsDomainStack(app);

const buildStack = new BuildStack(app, {
  hostedZoneIdOutput: domainStack.hostedZoneIdOutput,
  hostedZoneNameOutput: domainStack.hostedZoneNameOutput,
  acmCertificateArnOutput: domainStack.acmCertificateArnOutput,
  testProps: {
    apiDomainName: "api-test.algotools.io",
    secretArn:
      "arn:aws:secretsmanager:eu-central-1:075374763076:secret:AlgobotTest-Secrets-JNOnOP",
  },
  productionProps: {
    apiDomainName: "api.algotools.io",
    secretArn:
      "arn:aws:secretsmanager:eu-central-1:075374763076:secret:AlgobotProd-Secrets-7s0zt7",
  },
});

const webAppStack = new AlgotoolsWebappStack(app, {});

webAppStack.addDependency(domainStack);
buildStack.addDependency(domainStack);
