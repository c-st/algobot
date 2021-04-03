import * as path from "path";
import * as SF from "@aws-cdk/aws-stepfunctions";
import * as SFTasks from "@aws-cdk/aws-stepfunctions-tasks";
import * as LambdaNodeJs from "@aws-cdk/aws-lambda-nodejs";
import { AlgobotStack, DEFAULT_LAMBDA_SETTINGS } from "./algobot-stack";

export const buildCollectRewardsStateMachine = (stack: AlgobotStack) => {
  const determineTimeToWaitHandler = new LambdaNodeJs.NodejsFunction(
    stack,
    "DetermineTimeToWait",
    {
      entry: path.join(__dirname, "../src/handlers/determineTimeToWait.ts"),
      environment: {
        SECRET_ARN: stack.secret.secretArn,
      },
      ...DEFAULT_LAMBDA_SETTINGS,
    }
  );
  stack.secret.grantRead(determineTimeToWaitHandler);

  const collectRewardHandler = new LambdaNodeJs.NodejsFunction(
    stack,
    "CollectReward",
    {
      entry: path.join(__dirname, "../src/handlers/collectReward.ts"),
      environment: {
        SECRET_ARN: stack.secret.secretArn,
      },
      ...DEFAULT_LAMBDA_SETTINGS,
    }
  );
  stack.secret.grantRead(collectRewardHandler);

  const determineTimeToWait = new SFTasks.LambdaInvoke(
    stack,
    "Determine time to wait",
    {
      lambdaFunction: determineTimeToWaitHandler,
      outputPath: "$.Payload",
    }
  );

  const waitForRewardCollection = new SF.Wait(
    stack,
    "Wait for reward collection",
    {
      time: SF.WaitTime.secondsPath("$.waitTimeSeconds"),
    }
  );

  const collectReward = new SFTasks.LambdaInvoke(stack, "Collect rewards", {
    lambdaFunction: collectRewardHandler,
    outputPath: "$.Payload",
  });

  const insufficientBalanceFail = new SF.Fail(
    stack,
    "Insufficient fee balance",
    {
      error: "INSUFFICIENT_FEE_BALANCE",
    }
  );

  const definition = determineTimeToWait
    .next(waitForRewardCollection)
    .next(collectReward)
    .next(
      new SF.Choice(stack, "Sufficient fee balance?")
        .when(
          SF.Condition.numberGreaterThanEquals("$.feeBalance", 0.001), // should be fee balance of addresses' stake of fee account.
          determineTimeToWait
        )
        .otherwise(insufficientBalanceFail)
    );

  new SF.StateMachine(stack, "CollectRewards", {
    stateMachineName: "CollectRewards",
    stateMachineType: SF.StateMachineType.STANDARD,
    definition,
  });
};
