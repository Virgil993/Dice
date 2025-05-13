import { hash } from "bcrypt";

export async function hashPassword(password: string): Promise<string> {
  const SALT = 10;

  const hashedPassword = await hash(password, SALT);

  return hashedPassword;
}
