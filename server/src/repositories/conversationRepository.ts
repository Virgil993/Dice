import { Conversation } from "@/db/models/conversation";
import { Op } from "sequelize";
import { z } from "zod";

const uuidSchema = z.string().uuid();

export class ConversationRepository {
  public static async createConversation(
    user1Id: string,
    user2Id: string
  ): Promise<Conversation> {
    try {
      uuidSchema.parse(user1Id); // Validate user1Id format
      uuidSchema.parse(user2Id); // Validate user2Id format
      const conversation = await Conversation.create({
        user1Id,
        user2Id,
      });
      return conversation;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  }

  public static async getConversationById(
    conversationId: string
  ): Promise<Conversation | null> {
    try {
      uuidSchema.parse(conversationId); // Validate conversationId format
      const conversation = await Conversation.findOne({
        where: { id: conversationId },
      });
      return conversation;
    } catch (error) {
      console.error("Error fetching conversation by ID:", error);
      throw error;
    }
  }

  public static async getConversationsByUserId(
    userId: string
  ): Promise<Conversation[]> {
    try {
      uuidSchema.parse(userId); // Validate userId format
      const conversations = await Conversation.findAll({
        where: {
          [Op.or]: [{ user1Id: userId }, { user2Id: userId }],
        },
      });
      return conversations;
    } catch (error) {
      console.error("Error fetching conversations by user ID:", error);
      throw error;
    }
  }

  public static async getConversationByUserIds(
    user1Id: string,
    user2Id: string
  ): Promise<Conversation | null> {
    try {
      uuidSchema.parse(user1Id); // Validate user1Id format
      uuidSchema.parse(user2Id); // Validate user2Id format
      const conversation = await Conversation.findOne({
        where: {
          [Op.or]: [
            { user1Id, user2Id },
            { user1Id: user2Id, user2Id: user1Id },
          ],
        },
      });
      return conversation;
    } catch (error) {
      console.error("Error fetching conversation by user IDs:", error);
      throw error;
    }
  }

  public static async deleteConversation(
    conversationId: string
  ): Promise<void> {
    try {
      uuidSchema.parse(conversationId); // Validate conversationId format
      await Conversation.destroy({
        where: { id: conversationId },
      });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      throw error;
    }
  }

  public static async deleteAllConversations(userId: string): Promise<void> {
    try {
      uuidSchema.parse(userId); // Validate userId format
      await Conversation.destroy({
        where: {
          [Op.or]: [{ user1Id: userId }, { user2Id: userId }],
        },
      });
    } catch (error) {
      console.error("Error deleting all conversations for user:", error);
      throw error;
    }
  }
}
