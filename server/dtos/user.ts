export type User = {
  id: string;
  email: string;
  name: string;
  birthday: Date;
  gender: string;
  description: string;
  verified: boolean;
};

export type CreateUserResponse = {
  success: boolean;
  msg?: string;
  err?: string;
};

export type UserLoginResponse = {
  success: boolean;
  user?: User;
  token?: string;
  msg?: string;
  err?: string;
};

export type SendVerificationEmailResponse = {
  success: boolean;
  msg?: string;
  err?: string;
};
