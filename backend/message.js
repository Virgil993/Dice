import mongoose from "mongoose";
import { MONGO_DB_URI, reqAuth } from "./helper";
import MessageModel from "./models/messages";

import { GenezioDeploy } from "@genezio/types";

@GenezioDeploy()
export class Message {
  constructor() {
    this.#connect();
  }

  // connect mongoose to mongodb
  #connect() {
    mongoose.set("strictQuery", false);
    try {
      mongoose.connect(MONGO_DB_URI);
    } catch (err) {
      console.log(err);
    }
  }

  async create(token, conversationId, text, sender, recevier, date, seen) {
    const authObject = await reqAuth(token);
    if (!authObject.success) {
      return { success: false, msg: authObject.msg };
    }

    if (!text || !sender || !recevier || !date || !conversationId) {
      return {
        success: false,
        msg: "Missing required params at create message",
      };
    }

    const newMessage = await MessageModel.create({
      conversationId: conversationId,
      text: text,
      sender: sender,
      recevier: recevier,
      date: date,
      seen: seen,
    });

    return { success: true, messageId: newMessage._id };
  }

  async getByConversationId(token, conversationId) {
    const authObject = await reqAuth(token);
    if (!authObject.success) {
      return { success: false, msg: authObject.msg };
    }

    if (!conversationId) {
      return {
        success: false,
        msg: "Missing required params at get messages from conversation",
      };
    }

    const elements = await MessageModel.find({
      conversationId: conversationId,
    });
    return { success: true, elements: elements };
  }

  async deleteAllByConversationId(token, conversationId) {
    const authObject = await reqAuth(token);
    if (!authObject.success) {
      return { success: false, msg: authObject.msg };
    }

    if (!conversationId) {
      return {
        success: false,
        msg: "Missing required params at delete all messages by conversation id",
      };
    }

    await MessageModel.deleteMany({ conversationId: conversationId });
    return { success: true };
  }

  async deleteAllByUserId(token) {
    const authObject = await reqAuth(token);
    if (!authObject.success) {
      return { success: false, msg: authObject.msg };
    }
    const userId = authObject.userId;
    await MessageModel.deleteMany({ sender: userId });
    await MessageModel.deleteMany({ recevier: userId });
    return { success: true };
  }

  async updateSeen(token, messages) {
    try {
      const authObject = await reqAuth(token);
      if (!authObject.success) {
        return { success: false, msg: authObject.msg };
      }
      for (let i = 0; i < messages.length; i++) {
        await MessageModel.findByIdAndUpdate(
          { _id: messages[i]._id },
          { seen: true }
        );
      }
      return { success: true };
    } catch (err) {
      console.log(err);
      return {
        success: false,
        msg: "error at update seen messages",
        error: err,
      };
    }
  }

  async getNotifications(userId) {
    try {
      if (!userId) {
        return { success: false, msg: "No user id provided" };
      }

      const messages = await MessageModel.find({
        recevier: userId,
        seen: false,
      });
      const conversations = [];
      for (let i = 0; i < messages.length; i++) {
        if (!conversations.includes(messages[i].conversationId)) {
          conversations.push(messages[i].conversationId);
        }
      }

      return {
        success: true,
        messages: messages,
        conversations: conversations,
      };
    } catch (err) {
      console.log(err);
      return { success: false, msg: "error at get notifications", error: err };
    }
  }
}
