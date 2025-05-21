import { Gender } from "@/db/models/user";

export type UserDTO = {
  id: string;
  email: string;
  name: string;
  birthday: Date;
  description: string;
  gender: Gender;
  createdAt: Date;
  updatedAt: Date;
  verified: boolean;
  totpEnabled: boolean;
  deletedAt: Date | null;
};

export type UserPhotoDTO = {
  id: string;
  userId: string;
  position: number;
  originalFilename: string;
  mimeType: string;
  fileHash: string;
  sizeBytes: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type UserCreateRequest = {
  name: string;
  email: string;
  password: string;
  birthday: string;
  gender: string;
  description: string;
};

export type UserLoginRequest = {
  email: string;
  password: string;
};

export type UserLoginResponse = {
  token: string;
  user: UserDTO;
};

export type ActiveSessionPayload = {
  userId: string;
  userAgent: string;
  verified: boolean;
  tokenUUID: string;
  totpEnabled: boolean;
  email: string;
};

export type EmailVerificationPayload = {
  userId: string;
  tokenUUID: string;
  email: string;
};
