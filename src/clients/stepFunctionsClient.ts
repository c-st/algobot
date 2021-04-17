export interface StepFunctionsClient {
  startExecution(stateMachineArn: string, input: object): Promise<string>;
  stopExecution(executionArn: string): Promise<void>;
}

export class AwsStepFunctionsClient implements StepFunctionsClient {
  constructor(private client: AWS.StepFunctions) {}

  async startExecution(
    stateMachineArn: string,
    input: object
  ): Promise<string> {
    const instance = await this.client
      .startExecution({
        stateMachineArn,
        input: JSON.stringify(input),
      })
      .promise();

    return instance.executionArn;
  }

  async stopExecution(executionArn: string): Promise<void> {
    await this.client
      .stopExecution({
        executionArn,
      })
      .promise();
  }
}
