import type { Game } from "./game";

export enum Gender {
  MALE = "male",
  FEMALE = "female",
}

export type User = {
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

export type PhotoUrl = {
  url: string;
  position: number;
};

export type ExternalUser = {
  id: string;
  email: string;
  name: string;
  birthday: Date;
  description: string;
  gender: Gender;
};

export type FullExternalUser = {
  user: ExternalUser;
  photosUrls: PhotoUrl[];
  games: Game[];
};
