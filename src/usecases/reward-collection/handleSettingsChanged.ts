import * as Lambda from "aws-lambda";

export const handler = async (
  event: Lambda.DynamoDBStreamEvent
): Promise<void> => {
  console.log("handling stream event", event.Records);
  /**
   * Adapt to change from old->new payload:
   * {
   *    address,
   *    rewardCollectionEnabled
   *    minimumRewardsToCollect
   *    rewardCollectionExecutionId
   * }
   */
};
