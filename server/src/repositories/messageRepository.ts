import { Message } from "@/db/models/message";
import { z } from "zod";

const uuidSchema = z.string().uuid();
const uuidArraySchema = z.array(z.string().uuid());

export class MessageRepository {
  public static async addMessage(
    conversationId: string,
    senderId: string,
    content: string
  ): Promise<Message> {
    try {
      uuidSchema.parse(conversationId); // Validate conversationId format
      uuidSchema.parse(senderId); // Validate senderId format
      const message = await Message.create({
        conversationId,
        senderId,
        content,
      });
      return message;
    } catch (error) {
      console.error("Error adding message:", error);
      throw error;
    }
  }

  public static async getMessagesByConversationId(
    conversationId: string
  ): Promise<Message[]> {
    try {
      uuidSchema.parse(conversationId); // Validate conversationId format
      const messages = await Message.findAll({
        where: { conversationId },
        order: [["createdAt", "ASC"]],
      });
      return messages;
    } catch (error) {
      console.error("Error fetching messages by conversation ID:", error);
      throw error;
    }
  }

  public static async getMessageById(
    messageId: string
  ): Promise<Message | null> {
    try {
      uuidSchema.parse(messageId); // Validate messageId format
      const message = await Message.findByPk(messageId);
      return message;
    } catch (error) {
      console.error("Error fetching message by ID:", error);
      throw error;
    }
  }

  public static async updateMessageReadStatus(
    messageId: string,
    isRead: boolean
  ): Promise<Message> {
    try {
      uuidSchema.parse(messageId); // Validate messageId format
      const message = await Message.findByPk(messageId);
      if (!message) {
        throw new Error("Message not found");
      }
      message.isRead = isRead;
      if (isRead) {
        message.readAt = new Date();
      } else {
        message.readAt = null;
      }
      await message.save();
      return message;
    } catch (error) {
      console.error("Error updating message read status:", error);
      throw error;
    }
  }

  public static async updateMessagesReadStatusByConversationId(
    readerId: string,
    conversationId: string,
    isRead: boolean
  ): Promise<void> {
    try {
      uuidSchema.parse(readerId); // Validate readerId format
      uuidSchema.parse(conversationId); // Validate conversationId format
      const messages = await Message.findAll({
        where: { conversationId },
      });
      for (const message of messages) {
        if (message.senderId !== readerId) {
          message.isRead = isRead;
          if (isRead) {
            message.readAt = new Date();
          } else {
            message.readAt = null;
          }
          await message.save();
        }
      }
    } catch (error) {
      console.error(
        "Error updating messages read status by conversation ID:",
        error
      );
      throw error;
    }
  }

  public static async deleteAllByConversationId(
    conversationId: string
  ): Promise<void> {
    try {
      uuidSchema.parse(conversationId); // Validate conversationId format
      await Message.destroy({
        where: { conversationId },
      });
    } catch (error) {
      console.error("Error deleting messages by conversation ID:", error);
      throw error;
    }
  }

  public static async deleteAllByConversationIds(
    conversationIds: string[]
  ): Promise<void> {
    try {
      uuidArraySchema.parse(conversationIds); // Validate conversationIds format
      await Message.destroy({
        where: { conversationId: conversationIds },
      });
    } catch (error) {
      console.error("Error deleting messages by conversation IDs:", error);
      throw error;
    }
  }
}
