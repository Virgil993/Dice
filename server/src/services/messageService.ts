import { MessageDTO } from "@/dtos/message";
import {
  AddMessageResponse,
  GetMessagesResponse,
  Status,
} from "@/dtos/request";
import { MessageRepository } from "@/repositories/messageRepository";
import { UserError } from "@/types/errors";
import { messageToDTO } from "@/utils/helper";

export class MessageService {
  constructor() {}

  public async addMessage(
    conversationId: string,
    senderId: string,
    content: string
  ): Promise<AddMessageResponse> {
    try {
      const message = await MessageRepository.addMessage(
        conversationId,
        senderId,
        content
      );
      return {
        status: Status.SUCCESS,
        message: messageToDTO(message),
      };
    } catch (error) {
      console.error("Error adding message:", error);
      throw error;
    }
  }

  public async getMessagesByConversationId(
    conversationId: string
  ): Promise<GetMessagesResponse> {
    try {
      const messages = await MessageRepository.getMessagesByConversationId(
        conversationId
      );
      return {
        status: Status.SUCCESS,
        messages: messages.map((message) => messageToDTO(message)),
      };
    } catch (error) {
      console.error("Error fetching messages by conversation ID:", error);
      throw error;
    }
  }

  public async updateMessageReadStatus(
    messageId: string,
    isRead: boolean
  ): Promise<void> {
    try {
      await MessageRepository.updateMessageReadStatus(messageId, isRead);
    } catch (error) {
      console.error("Error updating message read status:", error);
      throw error;
    }
  }

  public async updateMessagesReadStatus(
    readerId: string,
    conversationId: string,
    isRead: boolean
  ): Promise<void> {
    try {
      await MessageRepository.updateMessagesReadStatusByConversationId(
        readerId,
        conversationId,
        isRead
      );
    } catch (error) {
      console.error("Error updating message read status:", error);
      throw error;
    }
  }

  public async getMessageById(messageId: string): Promise<MessageDTO | null> {
    try {
      const message = await MessageRepository.getMessageById(messageId);
      if (!message) {
        return null;
      }
      return messageToDTO(message);
    } catch (error) {
      console.error("Error fetching message by ID:", error);
      throw error;
    }
  }
}
