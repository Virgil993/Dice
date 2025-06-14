import type { Conversation } from "./conversation";
import type { Game } from "./game";
import type { Message } from "./message";
import type { Swipe, SwipeAction } from "./swipe";
import type { FullExternalUser, PhotoUrl, User } from "./user";

export enum ResponseStatus {
  SUCCESS = "success",
  ERROR = "error",
}

export type StatusError = {
  status: ResponseStatus.ERROR;
  message: string;
  retryAfter?: number;
};

export type StatusOk<T = object> = { status: ResponseStatus.SUCCESS } & T;
export type Status<T = object> = StatusOk<T> | StatusError;

// USER

export type UserCreateRequest = {
  name: string;
  email: string;
  password: string;
  birthday: string;
  gender: string;
  description: string;
  gameIds: string[];
};

export type UserCreateResponse = {
  status: Status;
  user: User;
  photosUrls: PhotoUrl[];
  games: Game[];
};
export type UserUpdateRequest = {
  name?: string;
  gender?: string;
  description?: string;
  gameIds?: string[];
};

export type UserUpdateResponse = {
  user: User;
  photosUrls: PhotoUrl[];
  games: Game[];
};

export type ResetPasswordRequest = {
  password: string;
};

export type UserLoginRequest = {
  email: string;
  password: string;
};

export type UserLoginResponse = {
  token: string;
  user?: User;
  totpRequired?: boolean;
};

export type GetUserResponse = {
  user: User;
  photosUrls: PhotoUrl[];
  games: Game[];
};

export type GetExternalUserResponse = {
  status: Status;
  user: FullExternalUser;
};

export type GetUsersSortedResponse = {
  users: FullExternalUser[];
};

// TOTP

export type VerifyTotpRequest = {
  code: string;
};

export type EnableTotpRequest = {
  code: string;
};

export type UseBackupCodeRequest = {
  code: string;
};

export type GenerateTotpResponse = {
  otpauthUrl: string;
};

export type EnableTotpResponse = {
  codes: string[];
};

// EMAIL
export type SendPasswordResetEmailRequest = {
  email: string;
};

// GAME
export type GetGamesResponse = {
  games: Game[];
};

// SWIPE
export type AddSwipeRequest = {
  swipedId: string;
  action: SwipeAction;
};

export type AddSwipeResponse = {
  swipe: Swipe;
};

//  CONVERSATION
export type GetConversationsResponse = {
  conversations: Conversation[];
};

// MESSAGE
export type GetMessagesResponse = {
  messages: Message[];
};

export type AddMessageRequest = {
  conversationId: string;
  content: string;
};

export type AddMessageResponse = {
  message: Message;
};

export type UpdateSingularMessageReadStatusRequest = {
  messageId: string;
  isRead: boolean;
};

export type UpdateMessagesReadStatusRequest = {
  conversationId: string;
  isRead: boolean;
};
