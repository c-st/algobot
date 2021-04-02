import * as Lambda from "aws-lambda";
import { CollectRewardResult } from "./types";

export const handler = async (
  event: Lambda.APIGatewayProxyEvent
): Promise<CollectRewardResult> => {
  console.log(event);
  return {
    feeBalance: 1.005,
    balance: 1243,
  };
};
