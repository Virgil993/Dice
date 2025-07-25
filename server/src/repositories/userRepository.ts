import { User } from "@/db/models/user";
import { z } from "zod";

const uuidSchema = z.string().uuid();
const emailSchema = z.string().email();
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

  public static async updateUser(user: User): Promise<User> {
    try {
      const updatedUser = await user.save();
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  public static async getUserByEmail(email: string): Promise<User | null> {
    try {
      emailSchema.parse(email); // Validate email format
      const user = await User.findOne({ where: { email: email } });
      return user;
    } catch (error) {
      console.error("Error fetching user by email:", error);
      throw error;
    }
  }

  public static async getUserById(userId: string): Promise<User | null> {
    try {
      uuidSchema.parse(userId); // Validate userId format
      const user = await User.findOne({ where: { id: userId } });
      return user;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw error;
    }
  }

  public static async getAllUsers(): Promise<User[]> {
    try {
      const users = await User.findAll();
      return users;
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw error;
    }
  }

  public static async setUserVerified(userId: string): Promise<User> {
    try {
      uuidSchema.parse(userId); // Validate userId format
      const user = await User.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
      user.verified = true;
      const updatedUser = await user.save();
      return updatedUser;
    } catch (error) {
      console.error("Error updating user verification status:", error);
      throw error;
    }
  }

  public static async setUserPassword(
    userId: string,
    password: string
  ): Promise<User> {
    try {
      uuidSchema.parse(userId); // Validate userId format
      const user = await User.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
      user.password = password;
      const updatedUser = await user.save();
      return updatedUser;
    } catch (error) {
      console.error("Error updating user password:", error);
      throw error;
    }
  }

  public static async updateUserTotpSecret(
    userId: string,
    totpSecret: string | null
  ): Promise<User> {
    try {
      uuidSchema.parse(userId); // Validate userId format
      const user = await User.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
      user.totpSecret = totpSecret;
      const updatedUser = await user.save();
      return updatedUser;
    } catch (error) {
      console.error("Error updating user TOTP secret:", error);
      throw error;
    }
  }

  public static async setBackupCodes(
    userId: string,
    backupCodes: string[] | null
  ): Promise<User> {
    try {
      uuidSchema.parse(userId); // Validate userId format
      const user = await User.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
      if (!backupCodes) {
        user.backupCodes = null;
        const updatedUser = await user.save();
        return updatedUser;
      }
      const backupCodesString = backupCodes.join(",");
      user.backupCodes = backupCodesString;
      const updatedUser = await user.save();
      return updatedUser;
    } catch (error) {
      console.error("Error updating user backup codes:", error);
      throw error;
    }
  }

  public static async setUserTotp(
    userId: string,
    totp: boolean
  ): Promise<User> {
    try {
      uuidSchema.parse(userId); // Validate userId format
      const user = await User.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
      user.totpEnabled = totp;
      const updatedUser = await user.save();
      return updatedUser;
    } catch (error) {
      console.error("Error updating user TOTP enabled status:", error);
      throw error;
    }
  }

  public static async deleteUserById(userId: string): Promise<void> {
    try {
      uuidSchema.parse(userId); // Validate userId format
      const user = await User.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
      await user.destroy();
    } catch (error) {
      console.error("Error deleting user by ID:", error);
      throw error;
    }
  }
}
