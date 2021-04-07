import * as Lambda from "aws-lambda";

export const handler = async (
  event: Lambda.APIGatewayProxyEvent
): Promise<Lambda.APIGatewayProxyResult> => {
  const { address } = event.queryStringParameters || {};

  if (!address) {
    return lambdaResult(400, {
      errorMessage: "Missing query parameter in request: address",
    });
  }

  switch (event.httpMethod) {
    case "GET":
      break;

    case "PUT":
      break;
  }

  console.log("request", event);

  /**
   * manage reward collection settings:
   *    GET /reward-collection?address=ABCD1
   *    PUT /reward-collection?address=ABCD1 body: { enabled: boolean; minimumRewardsToCollect: number; }
   */

  return lambdaResult(200, {});
};

const lambdaResult = (
  statusCode: number,
  body: Record<any, any>
): Lambda.APIGatewayProxyResult => ({
  statusCode,
  body: JSON.stringify(body),
  isBase64Encoded: false,
});
