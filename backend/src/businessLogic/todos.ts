// Done
import { Item } from "../models/Item"
import { Update } from "../models/Update"
import * as uuid from 'uuid'
import { parseUserId } from "../auth/utils"
import { Access } from "../dataLayer/functionsAccess"
import { getSignedUploadUrl } from "../dataLayer/fileStorage"
import { CreateNewRequest } from "../requests/CreateNewRequest"
import { UpdateRequest } from "../requests/UpdateRequest"

const bucketName = process.env.CAPSTONE_ATTACHEMENT_S3_BUCKET;
const newAccess = new Access()

export async function getItemsPerUser(jwtToken: string) : Promise<Item[]> {
  const userId = parseUserId(jwtToken)
  return newAccess.getItems(userId)
}

export async function createItem(
    CreateNewRequest: CreateNewRequest,
    jwtToken: string
  ): Promise<Item> {
  
    const itemId = uuid.v4()
    const userId = parseUserId(jwtToken)
  
    return await newAccess.createItem({
      todoId: itemId,
      userId: userId,
      createdAt: new Date().toISOString(),
      name: CreateNewRequest.name,
      dueDate: CreateNewRequest.dueDate,
      done: false,
      attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${itemId}`
    })
}

export async function updateItem(
  todoId: string,
  updatedTodo: UpdateRequest,
  jwtToken: string
): Promise<Update> {
  const userId = parseUserId(jwtToken)
  
  return await newAccess.updateItem(todoId, userId, updatedTodo)
}

export async function deleteItem(todoId: string, jwtToken: string) {
  const userId = parseUserId(jwtToken)

  return await newAccess.deleteItem(todoId, userId)
}

export function generateUploadUrl(todoId: string) : string {
  return getSignedUploadUrl(todoId)
}