import { ConversationService } from "@/services/conversationService";
import { MessageService } from "@/services/messageService";
import { messageToErrorResponse } from "@/utils/helper";
import { Request, Response, NextFunction } from "express";

export class MessageController {
  private messageService: MessageService;
  private conversationService: ConversationService;
  constructor() {
    this.messageService = new MessageService();
    this.conversationService = new ConversationService();
  }

  public async getMessages(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const userId = req.user!.userId;
    const conversationId = req.params.id;
    if (!conversationId) {
      res
        .status(400)
        .json(messageToErrorResponse("Conversation ID is required"));
      return;
    }
    try {
      const conversation = await this.conversationService.getConversationById(
        conversationId
      );
      if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
        res
          .status(403)
          .json(
            messageToErrorResponse(
              "Forbidden: You do not have permission to access this conversation"
            )
          );
        return;
      }
      const messages = await this.messageService.getMessagesByConversationId(
        conversationId
      );

      res.status(200).json(messages);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      next(error);
    }
  }
}
