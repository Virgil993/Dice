import { UserPhoto } from "@/db/models/userPhoto";
import { z } from "zod";

const uuidSchema = z.string().uuid();
const uuidArraySchema = z.array(z.string().uuid());

export class UserPhotoRepository {
  public static async createUserPhoto(
    userPhoto: UserPhoto
  ): Promise<UserPhoto> {
    try {
      const newUserPhoto = await userPhoto.save();
      return newUserPhoto;
    } catch (error) {
      console.error("Error creating user photo:", error);
      throw error;
    }
  }

  public static async getUserPhotosByUserId(
    userId: string
  ): Promise<UserPhoto[]> {
    try {
      uuidSchema.parse(userId); // Validate userId format
      const userPhotos = await UserPhoto.findAll({
        where: { userId: userId },
      });
      return userPhotos;
    } catch (error) {
      console.error("Error fetching user photos by user ID:", error);
      throw error;
    }
  }

  public static async deleteUserPhotosByID(ids: string[]) {
    try {
      uuidArraySchema.parse(ids); // Validate ids format
      const deletedPhotos = await UserPhoto.destroy({
        where: { id: ids },
      });
      return deletedPhotos;
    } catch (error) {
      console.error("Error deleting user photos by ID:", error);
      throw error;
    }
  }
}
