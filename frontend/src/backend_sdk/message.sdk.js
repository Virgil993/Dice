/**
* This is an auto generated code. This code should not be modified since the file can be overwritten
* if new genezio commands are executed.
*/

import { Remote } from "./remote.js"

export class Message {
  static remote = new Remote("https://ybiwhadgknhqy3r7tlb6y4q5em0emtin.lambda-url.eu-north-1.on.aws/Message")

  static async create(token, conversationId, text, sender, recevier, date, seen) {
    return Message.remote.call("Message.create", token, conversationId, text, sender, recevier, date, seen)
  }

  static async getByConversationId(token, conversationId) {
    return Message.remote.call("Message.getByConversationId", token, conversationId)
  }

  static async deleteAllByConversationId(token, conversationId) {
    return Message.remote.call("Message.deleteAllByConversationId", token, conversationId)
  }

  static async deleteAllByUserId(token) {
    return Message.remote.call("Message.deleteAllByUserId", token)
  }

  static async updateSeen(token, messages) {
    return Message.remote.call("Message.updateSeen", token, messages)
  }

  static async getNotifications(userId) {
    return Message.remote.call("Message.getNotifications", userId)
  }

}
