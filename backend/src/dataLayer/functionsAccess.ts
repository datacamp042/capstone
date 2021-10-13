import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'

//const XAWS = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('todoAccess')

export class Access {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly currentTable = process.env.CAPSTONE_TABLE) {
  }

  async getItems(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient.query({
        TableName: this.currentTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      }).promise()

      const items = result.Items
     return items as TodoItem[]
  }

  async createItem(newItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.currentTable,
      Item: newItem
    }).promise()

    return newItem
  }

  async updateItem(todoId: string, userId: string, updatedItem: TodoUpdate): Promise<TodoUpdate> {
    await this.docClient.update({
      TableName: this.currentTable,
      Key: {
        "todoId": todoId,
        "userId": userId
      },
      UpdateExpression: "set #n=:n, dueDate=:dd, done=:d",
      ExpressionAttributeValues: {
        ":n": updatedItem.name,
        ":dd": updatedItem.dueDate,
        ":d": updatedItem.done
      },
      ExpressionAttributeNames: {
        "#n": "name"
      }
    }).promise()

    return updatedItem
  }

  async deleteItem(todoId: string, userId: string) {
    await this.docClient.delete({
      TableName: this.currentTable,
      Key: {
        "todoId": todoId,
        "userId": userId
      }
    }).promise()
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {

    logger.info('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
