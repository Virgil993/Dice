import { Gender } from "@/db/models/user";
import { GameDTO } from "./game";

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

export type ExternalUserDTO = {
  id: string;
  email: string;
  name: string;
  birthday: Date;
  description: string;
  gender: Gender;
};

export type FullExternalUserDTO = {
  user: ExternalUserDTO;
  photosUrls: PhotoUrlDTO[];
  games: GameDTO[];
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

export type PhotoUrlDTO = {
  url: string;
  position: number;
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

export type PasswordResetPayload = {
  userId: string;
  tokenUUID: string;
  email: string;
};

export type TotpTempPayload = {
  userId: string;
  email: string;
};
