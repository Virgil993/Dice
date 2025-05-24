import { User } from "@/db/models/user";
import { UserDTO } from "@/dtos/user";
import { ErrorResponse, Status } from "@/dtos/request";
import { Game } from "@/db/models/game";
import { GameDTO } from "@/dtos/game";
import { Swipe } from "@/db/models/swipe";
import { SwipeDTO } from "@/dtos/swipe";
import { Conversation } from "@/db/models/conversation";
import { ConversationDTO } from "@/dtos/conversation";
import { Message } from "@/db/models/message";
import { MessageDTO } from "@/dtos/message";

export function toUTCDate(dateString: string): Date {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date string");
  }
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    )
  );
}

export function userToDTO(user: User): UserDTO {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    birthday: user.birthday,
    description: user.description,
    gender: user.gender,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    verified: user.verified,
    totpEnabled: user.totpEnabled,
    deletedAt: user.deletedAt,
  };
}

export function gameToDTO(game: Game): GameDTO {
  return {
    id: game.id,
    name: game.name,
    description: game.description,
    createdAt: game.createdAt,
    updatedAt: game.updatedAt,
    deletedAt: game.deletedAt,
  };
}

export function swipeToDTO(swipe: Swipe): SwipeDTO {
  return {
    id: swipe.id,
    swiperId: swipe.swiperId,
    swipedId: swipe.swipedId,
    action: swipe.action,
    createdAt: swipe.createdAt,
    updatedAt: swipe.updatedAt,
    deletedAt: swipe.deletedAt,
  };
}

export function conversationToDTO(conversation: Conversation): ConversationDTO {
  return {
    id: conversation.id,
    user1Id: conversation.user1Id,
    user2Id: conversation.user2Id,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    deletedAt: conversation.deletedAt,
  };
}

export function messageToDTO(message: Message): MessageDTO {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    content: message.content,
    isRead: message.isRead,
    readAt: message.readAt,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    deletedAt: message.deletedAt,
  };
}

export function messageToErrorResponse(message: string): ErrorResponse {
  return {
    status: Status.ERROR,
    message: message,
  };
}
