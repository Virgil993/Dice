import { Status } from "@/dtos/request";
import { ConversationService } from "@/services/conversationService";
import { messageToErrorResponse } from "@/utils/helper";
import { Request, Response, NextFunction } from "express";

export class ConversationController {
  private conversationService;

  constructor() {
    this.conversationService = new ConversationService();
  }

  public async getConversations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const userId = req.user!.userId;
    try {
      const conversations = await this.conversationService.getConversations(
        userId
      );
      res.status(200).json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      next(error);
    }
  }

  public async deleteConversation(
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
              "Forbidden: You do not have permission to delete this conversation"
            )
          );
        return;
      }

      await this.conversationService.deleteConversation(conversationId);
      res.status(200).json({
        status: Status.SUCCESS,
      });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      next(error);
    }
  }
}
