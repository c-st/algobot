#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { BuildStack } from "../lib/build-stack";
import { AlgotoolsDomainStack } from "../lib/algotools-domain-stack";
import { AlgotoolsWebappStack } from "../lib/algotools-webapp-stack";

const app = new cdk.App();

const domainStack = new AlgotoolsDomainStack(app);
const webAppStack = new AlgotoolsWebappStack(app);
const buildStack = new BuildStack(app, {
  hostedZoneIdOutput: domainStack.hostedZoneIdOutput,
  hostedZoneNameOutput: domainStack.hostedZoneNameOutput,
  acmCertificateArnOutput: domainStack.acmCertificateArnOutput,
});
webAppStack.addDependency(domainStack);
buildStack.addDependency(domainStack);
