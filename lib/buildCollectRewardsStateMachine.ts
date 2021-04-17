import * as path from "path";
import * as SF from "@aws-cdk/aws-stepfunctions";
import * as SFTasks from "@aws-cdk/aws-stepfunctions-tasks";
import * as LambdaNodeJs from "@aws-cdk/aws-lambda-nodejs";
import { AlgobotStack, DEFAULT_LAMBDA_SETTINGS } from "./algobot-stack";

export const buildCollectRewardsStateMachine = (
  stack: AlgobotStack
): SF.StateMachine => {
  // Fetch account information (retrieve account information, estimate wait time)
  const determineTimeToWaitHandler = new LambdaNodeJs.NodejsFunction(
    stack,
    "DetermineTimeToWait",
    {
      entry: path.join(
        __dirname,
        "../src/usecases/reward-collection/determineTimeToWait.ts"
      ),
      environment: {
        SECRET_ARN: stack.secret.secretArn,
        ALGOADDRESSES_TABLENAME: stack.algoAddressesTable.tableName,
      },
      ...DEFAULT_LAMBDA_SETTINGS,
    }
  );
  stack.secret.grantRead(determineTimeToWaitHandler);

  const collectRewardHandler = new LambdaNodeJs.NodejsFunction(
    stack,
    "CollectReward",
    {
      entry: path.join(
        __dirname,
        "../src/usecases/reward-collection/collectReward.ts"
      ),
      environment: {
        SECRET_ARN: stack.secret.secretArn,
        ALGOADDRESSES_TABLENAME: stack.algoAddressesTable.tableName,
      },
      ...DEFAULT_LAMBDA_SETTINGS,
    }
  );
  stack.secret.grantRead(collectRewardHandler);

  const determineTimeToWait = new SFTasks.LambdaInvoke(
    stack,
    "Fetch account information",
    {
      lambdaFunction: determineTimeToWaitHandler,
      outputPath: "$.Payload",
      retryOnServiceExceptions: false,
    }
  );

  const waitForRewardCollection = new SF.Wait(
    stack,
    "Wait for reward collection",
    {
      time: SF.WaitTime.timestampPath("$.nextRewardCollection"),
    }
  );

  const collectReward = new SFTasks.LambdaInvoke(stack, "Collect rewards", {
    lambdaFunction: collectRewardHandler,
    outputPath: "$.Payload",
    retryOnServiceExceptions: false,
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
      new SF.Choice(stack, "Check fee balance")
        .when(
          SF.Condition.numberGreaterThanEquals("$.remainingFeeBalance", 0.001),
          determineTimeToWait
        )
        .otherwise(insufficientBalanceFail)
    );

  const stateMachine = new SF.StateMachine(
    stack,
    "CollectRewardsStateMachine",
    {
      stateMachineName: `${stack.stackName}-CollectRewards`,
      stateMachineType: SF.StateMachineType.STANDARD,
      tracingEnabled: true,
      definition,
    }
  );

  return stateMachine;
};
