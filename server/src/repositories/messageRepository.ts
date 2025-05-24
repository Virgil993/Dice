import { Message } from "@/db/models/message";

export class MessageRepository {
  public static async addMessage(
    conversationId: string,
    senderId: string,
    content: string
  ): Promise<Message> {
    try {
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

  public static async updateMessageReadStatus(
    messageId: string,
    isRead: boolean
  ): Promise<Message> {
    try {
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

  public static async deleteAllByConversationId(
    conversationId: string
  ): Promise<void> {
    try {
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
      await Message.destroy({
        where: { conversationId: conversationIds },
      });
    } catch (error) {
      console.error("Error deleting messages by conversation IDs:", error);
      throw error;
    }
  }
}
