/**
* This is an auto generated code. This code should not be modified since the file can be overwriten
* if new genezio commands are executed.
*/

import { Remote } from "./remote.js"

export class User {
  static remote = new Remote("http://127.0.0.1:8083/User")

  static async create(name, email, password, birthday, gender, description, gamesSelected) {
    return User.remote.call("User.create", name, email, password, birthday, gender, description, gamesSelected)
  }

  static async login(email, password) {
    return User.remote.call("User.login", email, password)
  }

  static async getUserByToken(token) {
    return User.remote.call("User.getUserByToken", token)
  }

  static async getUserById(token, userId) {
    return User.remote.call("User.getUserById", token, userId)
  }

  static async logout(token) {
    return User.remote.call("User.logout", token)
  }

  static async updateUser(token, updatedUser) {
    return User.remote.call("User.updateUser", token, updatedUser)
  }

  static async updateSaidTo(token, NewUserId, saidYes) {
    return User.remote.call("User.updateSaidTo", token, NewUserId, saidYes)
  }

  static async delete(token) {
    return User.remote.call("User.delete", token)
  }

  static async userExist(id, token) {
    return User.remote.call("User.userExist", id, token)
  }

  static async forgotPassword(email) {
    return User.remote.call("User.forgotPassword", email)
  }

  static async resetPassword(id, newPassword) {
    return User.remote.call("User.resetPassword", id, newPassword)
  }

  static async getAllUsersSorted(token, user) {
    return User.remote.call("User.getAllUsersSorted", token, user)
  }

  static async shouldCreateConversation(token, userId) {
    return User.remote.call("User.shouldCreateConversation", token, userId)
  }

}
