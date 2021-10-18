/**
 * Fields in a request to update a single item.
 */
export interface UpdateRequest {
  name: string
  dueDate: string
  done: boolean
}