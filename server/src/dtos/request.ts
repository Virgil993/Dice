import { ConversationDTO } from "./conversation";
import { GameDTO } from "./game";
import { MessageDTO } from "./message";
import { SwipeAction, SwipeDTO } from "./swipe";
import { UserDTO } from "./user";

export type ErrorResponse = {
  status: Status;
  message: string;
  retryAfter?: number;
};

export enum Status {
  SUCCESS = "success",
  ERROR = "error",
}

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
  user: UserDTO;
  games: GameDTO[];
};

export type UserUpdateRequest = {
  name?: string;
  gender?: string;
  description?: string;
  gameIds?: string[];
};

export type UserUpdateResponse = {
  status: Status;
  user: UserDTO;
  photosUrls: string[];
  games: GameDTO[];
};

export type UserLoginRequest = {
  email: string;
  password: string;
};

export type UserLoginResponse = {
  status: Status;
  token: string;
  user?: UserDTO;
  totpRequired?: boolean;
};

export type GetUserResponse = {
  status: Status;
  user: UserDTO;
  photosUrls: string[];
  games: GameDTO[];
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
  status: Status;
  otpauthUrl: string;
};

export type EnableTotpResponse = {
  status: Status;
  codes: string[];
};

// EMAIL

export type SendPasswordResetEmailRequest = {
  email: string;
};

// GAME

export type GetGamesResponse = {
  status: Status;
  games: GameDTO[];
};

// SWIPE

export type AddSwipeRequest = {
  swipedId: string;
  action: SwipeAction;
};

export type AddSwipeResponse = {
  status: Status;
  swipe: SwipeDTO;
};

// CONVERSATION
export type GetConversationsResponse = {
  status: Status;
  conversations: ConversationDTO[];
};

// MESSAGE
export type GetMessagesResponse = {
  status: Status;
  messages: MessageDTO[];
};
