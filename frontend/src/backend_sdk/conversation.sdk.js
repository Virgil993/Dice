/**
* This is an auto generated code. This code should not be modified since the file can be overwriten
* if new genezio commands are executed.
*/

import { Remote } from "./remote.js"

export class Conversation {
  static remote = new Remote("http://127.0.0.1:8083/Conversation")

  static async create(token, users) {
    return Conversation.remote.call("Conversation.create", token, users)
  }

  static async getByUserId(token) {
    return Conversation.remote.call("Conversation.getByUserId", token)
  }

  static async delete(token, id) {
    return Conversation.remote.call("Conversation.delete", token, id)
  }

}
