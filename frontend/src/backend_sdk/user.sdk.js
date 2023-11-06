/**
* This is an auto generated code. This code should not be modified since the file can be overwritten
* if new genezio commands are executed.
*/

import { Remote } from "./remote.js"

export class User {
  static remote = new Remote("https://xwefu2mqeicyov7nzbaf45fs5i0fnxpy.lambda-url.eu-north-1.on.aws/User")

  static async SendVerificationEmail(email) {
    return User.remote.call("User.SendVerificationEmail", email)
  }

  static async checkVerification(email, token) {
    return User.remote.call("User.checkVerification", email, token)
  }

  static async updateVerifed(email) {
    return User.remote.call("User.updateVerifed", email)
  }

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

  static async UploadImageToS3(file, userId, fileName) {
    return User.remote.call("User.UploadImageToS3", file, userId, fileName)
  }

  static async readImageFromS3(userId, photoNumber) {
    return User.remote.call("User.readImageFromS3", userId, photoNumber)
  }

  static async deleteUserFromS3(token) {
    return User.remote.call("User.deleteUserFromS3", token)
  }

}
