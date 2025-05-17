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
