import { User } from "@/db/models/user";

export class UserRepository {
  public static async createUser(user: User): Promise<User> {
    try {
      const newUser = await user.save();
      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
}
