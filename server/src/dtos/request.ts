import { UserDTO } from "./user";

export type ErrorResponse = {
  status: Status;
  message: string;
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
};

export type UserCreateResponse = {
  status: Status;
  user: UserDTO;
};

export type UserUpdateRequest = {
  name?: string;
  gender?: string;
  description?: string;
};

export type UserUpdateResponse = {
  status: Status;
  user: UserDTO;
  photosUrls: string[];
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
};

// TOTP
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
