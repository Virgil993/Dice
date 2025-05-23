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
