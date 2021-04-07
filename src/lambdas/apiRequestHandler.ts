import * as Lambda from "aws-lambda";

export const handler = async (
  event: Lambda.APIGatewayProxyEvent
): Promise<Lambda.APIGatewayProxyResult> => {
  const response: Lambda.APIGatewayProxyResult = {
    statusCode: 200,
    body: "Hello world",
    isBase64Encoded: false,
  };

  return response;
};
