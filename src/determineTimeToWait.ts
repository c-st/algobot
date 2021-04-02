import * as Lambda from "aws-lambda";
import { DetermineTimeToWaitResult } from "./types";

export const handler = async (
  event: Lambda.APIGatewayProxyEvent
): Promise<DetermineTimeToWaitResult> => {
  console.log(event);
  return {
    waitTimeSeconds: 15,
  };
};
