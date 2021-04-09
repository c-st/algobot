#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { BuildStack } from "../lib/build-stack";
import { AlgotoolsDomainStack } from "../lib/algotools-domain-stack";

const app = new cdk.App();

const domainStack = new AlgotoolsDomainStack(app);
const buildStack = new BuildStack(app, {
  hostedZoneIdOutput: domainStack.hostedZoneIdOutput,
  hostedZoneNameOutput: domainStack.hostedZoneNameOutput,
  acmCertificateArnOutput: domainStack.acmCertificateArnOutput,
});

buildStack.addDependency(domainStack);
