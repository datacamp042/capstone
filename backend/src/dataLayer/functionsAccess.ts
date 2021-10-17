import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { Item } from '../models/Item'
import { Update } from '../models/Update'
import { createLogger } from '../utils/logger'

//const XAWS = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('Access')

export class Access {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly currentTable = process.env.CAPSTONE_TABLE) {
  }

  async getItems(userId: string): Promise<Item[]> {
    const result = await this.docClient.query({
        TableName: this.currentTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      }).promise()

      const items = result.Items
     return items as Item[]
  }

  async createItem(newItem: Item): Promise<Item> {
    await this.docClient.put({
      TableName: this.currentTable,
      Item: newItem
    }).promise()

    return newItem
  }

  async updateItem(itemId: string, userId: string, updatedItem: Update): Promise<Update> {
    await this.docClient.update({
      TableName: this.currentTable,
      Key: {
        "itemId": itemId,
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

  async deleteItem(itemId: string, userId: string) {
    await this.docClient.delete({
      TableName: this.currentTable,
      Key: {
        "itemId": itemId,
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
