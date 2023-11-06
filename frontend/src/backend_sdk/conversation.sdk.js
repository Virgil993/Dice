/**
* This is an auto generated code. This code should not be modified since the file can be overwritten
* if new genezio commands are executed.
*/

import { Remote } from "./remote.js"

export class Conversation {
  static remote = new Remote("https://qdma4qfeuaou77pwcfyu7ynhji0qbrsw.lambda-url.eu-north-1.on.aws/Conversation")

  static async create(token, users) {
    return Conversation.remote.call("Conversation.create", token, users)
  }

  static async getByBothUserId(user1Id, user2Id) {
    return Conversation.remote.call("Conversation.getByBothUserId", user1Id, user2Id)
  }

  static async getByUserId(token) {
    return Conversation.remote.call("Conversation.getByUserId", token)
  }

  static async addMessage(message) {
    return Conversation.remote.call("Conversation.addMessage", message)
  }

  static async delete(token, id) {
    return Conversation.remote.call("Conversation.delete", token, id)
  }

  static async deleteAll(token) {
    return Conversation.remote.call("Conversation.deleteAll", token)
  }

}
