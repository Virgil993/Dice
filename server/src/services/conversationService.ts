import { GetConversationsResponse, Status } from "@/dtos/request";
import { ConversationRepository } from "@/repositories/conversationRepository";
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

  public async deleteConversation(conversationId: string): Promise<void> {
    const conversation = await ConversationRepository.getConversationById(
      conversationId
    );
    if (!conversation) {
      throw new UserError("Conversation not found", 404);
    }
    await ConversationRepository.deleteConversation(conversationId);
  }
}
