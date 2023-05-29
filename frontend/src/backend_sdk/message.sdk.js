/**
* This is an auto generated code. This code should not be modified since the file can be overwriten
* if new genezio commands are executed.
*/

import { Remote } from "./remote.js"

export class Message {
  static remote = new Remote("https://n6ppw7h67vg4tb5ypqll4rd66m0xexoj.lambda-url.eu-north-1.on.aws/")

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
