/**
* This is an auto generated code. This code should not be modified since the file can be overwriten
* if new genezio commands are executed.
*/

import { Remote } from "./remote.js"

export class Message {
  static remote = new Remote("http://127.0.0.1:8083/Message")

  static async create(token, conversationId, text, sender, recevier, date, seen) {
    return Message.remote.call("Message.create", token, conversationId, text, sender, recevier, date, seen)
  }

  static async getByConversationId(token, conversationId) {
    return Message.remote.call("Message.getByConversationId", token, conversationId)
  }

  static async deleteAllByConversationId(token, conversationId) {
    return Message.remote.call("Message.deleteAllByConversationId", token, conversationId)
  }

  static async updateSeen(token, messages) {
    return Message.remote.call("Message.updateSeen", token, messages)
  }

  static async getNotifications(userId) {
    return Message.remote.call("Message.getNotifications", userId)
  }

}
