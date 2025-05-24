import { MessageDTO } from "@/dtos/message";
import { GetMessagesResponse, Status } from "@/dtos/request";
import { MessageRepository } from "@/repositories/messageRepository";
import { messageToDTO } from "@/utils/helper";

export class MessageService {
  constructor() {}

  public async addMessage(
    conversationId: string,
    senderId: string,
    content: string
  ): Promise<MessageDTO> {
    try {
      const message = await MessageRepository.addMessage(
        conversationId,
        senderId,
        content
      );
      return messageToDTO(message);
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
  ): Promise<MessageDTO> {
    try {
      const message = await MessageRepository.updateMessageReadStatus(
        messageId,
        isRead
      );
      return messageToDTO(message);
    } catch (error) {
      console.error("Error updating message read status:", error);
      throw error;
    }
  }
}
