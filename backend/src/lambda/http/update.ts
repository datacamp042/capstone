import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateRequest } from '../../requests/UpdateRequest'
import { updateItem } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('updateItem')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  if(!todoId) {

    logger.info(`could not generate upload url because todoId is missing in the request`);

    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({message: "Missing path parameter todoId"})
    };
  }

  const updatedTodo: UpdateRequest = JSON.parse(event.body)

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const updatedItem = await updateItem(todoId, updatedTodo, jwtToken)

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
