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

  public static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await User.findOne({ where: { email: email } });
      return user;
    } catch (error) {
      console.error("Error fetching user by email:", error);
      throw error;
    }
  }
}
