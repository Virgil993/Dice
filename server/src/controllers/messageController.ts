import {
  AddMessageRequest,
  Status,
  UpdateMessagesReadStatusRequest,
  UpdateSingularMessageReadStatusRequest,
} from "@/dtos/request";
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

  public async addMessage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const userId = req.user!.userId;
    const { conversationId, content } = req.body as AddMessageRequest;

    if (!conversationId) {
      res
        .status(400)
        .json(messageToErrorResponse("Conversation ID is required"));
      return;
    }
    if (!content) {
      res
        .status(400)
        .json(messageToErrorResponse("Message content is required"));
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
              "Forbidden: You do not have permission to send messages in this conversation"
            )
          );
        return;
      }

      const message = await this.messageService.addMessage(
        conversationId,
        userId,
        content
      );

      res.status(201).json(message);
    } catch (error) {
      console.error("Error adding message:", error);
      next(error);
    }
  }

  public async updateSingularMessageReadStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const userId = req.user!.userId;
    const { messageId, isRead } =
      req.body as UpdateSingularMessageReadStatusRequest;

    if (!messageId) {
      res.status(400).json(messageToErrorResponse("Message ID is required"));
      return;
    }
    if (typeof isRead !== "boolean") {
      res.status(400).json(messageToErrorResponse("isRead must be a boolean"));
      return;
    }

    try {
      const message = await this.messageService.getMessageById(messageId);
      if (!message) {
        res.status(404).json(messageToErrorResponse("Message not found"));
        return;
      }
      const conversation = await this.conversationService.getConversationById(
        message.conversationId
      );
      if (!conversation) {
        res.status(404).json(messageToErrorResponse("Conversation not found"));
        return;
      }
      //  Check if the user is part of the conversation
      if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
        res
          .status(403)
          .json(
            messageToErrorResponse(
              "Forbidden: You do not have permission to update this message"
            )
          );
        return;
      }
      if (message.senderId === userId) {
        res
          .status(403)
          .json(
            messageToErrorResponse(
              "Forbidden: You do not have permission to update this message"
            )
          );
        return;
      }

      await this.messageService.updateMessageReadStatus(messageId, isRead);

      res.status(200).json({
        status: Status.SUCCESS,
      });
    } catch (error) {
      console.error("Error updating message read status:", error);
      next(error);
    }
  }

  public async updateMessagsReadStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const userId = req.user!.userId;
    const { conversationId, isRead } =
      req.body as UpdateMessagesReadStatusRequest;
    if (!conversationId) {
      res
        .status(400)
        .json(messageToErrorResponse("Conversation ID is required"));
      return;
    }
    if (typeof isRead !== "boolean") {
      res.status(400).json(messageToErrorResponse("isRead must be a boolean"));
      return;
    }

    try {
      // Check if the user is part of the conversation
      const conversation = await this.conversationService.getConversationById(
        conversationId
      );
      if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
        res
          .status(403)
          .json(
            messageToErrorResponse(
              "Forbidden: You do not have permission to update this message"
            )
          );
        return;
      }

      await this.messageService.updateMessagesReadStatus(
        userId,
        conversationId,
        isRead
      );

      res.status(200).json({
        status: Status.SUCCESS,
      });
    } catch (error) {
      console.error("Error updating message read status:", error);
      next(error);
    }
  }
}
