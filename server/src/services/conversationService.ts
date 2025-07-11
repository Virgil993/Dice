import { ConversationDTO } from "@/dtos/conversation";
import { GetConversationsResponse, Status } from "@/dtos/request";
import { ConversationRepository } from "@/repositories/conversationRepository";
import { MessageRepository } from "@/repositories/messageRepository";
import { SwipeRepository } from "@/repositories/swipeRepository";
import { UserError } from "@/types/errors";
import { conversationToDTO } from "@/utils/helper";

export class ConversationService {
  constructor() {}

  public async getConversations(
    userId: string
  ): Promise<GetConversationsResponse> {
    const conversations = await ConversationRepository.getConversationsByUserId(
      userId
    );
    return {
      status: Status.SUCCESS,
      conversations: conversations.map((conversation) =>
        conversationToDTO(conversation)
      ),
    };
  }

  public async getConversationById(
    conversationId: string
  ): Promise<ConversationDTO> {
    const conversation = await ConversationRepository.getConversationById(
      conversationId
    );
    if (!conversation) {
      throw new UserError("Conversation not found", 404);
    }
    return conversationToDTO(conversation);
  }

  public async deleteConversation(conversationId: string): Promise<void> {
    const conversation = await ConversationRepository.getConversationById(
      conversationId
    );
    if (!conversation) {
      throw new UserError("Conversation not found", 404);
    }
    await MessageRepository.deleteAllByConversationId(conversationId);
    await ConversationRepository.deleteConversation(conversationId);
  }
}
