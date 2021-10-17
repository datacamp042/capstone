import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateRequest } from '../../requests/UpdateRequest'
import { updateItem } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('updateItem')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const itemId = event.pathParameters.itemId

  if(!itemId) {

    logger.info(`could not generate upload url because itemId is missing in the request`);

    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({message: "Missing path parameter itemId"})
    };
  }

  const updateditem: UpdateRequest = JSON.parse(event.body)

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const updatedItem = await updateItem(itemId, updateditem, jwtToken)

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      updatedItem
    })
  }
}
