#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { BuildStack } from "../lib/build-stack";

const app = new cdk.App();
new BuildStack(app);
app.synth();

// new AlgobotStack(app, 'AlgobotStack');