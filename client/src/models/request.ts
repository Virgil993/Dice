import type { User } from "./user";

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
};

export type UserCreateResponse = {
  user: User;
};

export type UserUpdateRequest = {
  name?: string;
  gender?: string;
  description?: string;
};

export type UserUpdateResponse = {
  user: User;
  photosUrls: string[];
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
  photosUrls: string[];
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
