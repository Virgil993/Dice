import { Swipe } from "@/db/models/swipe";
import { z } from "zod";

export class SwipeRepository {
  public static async createSwipe(
    swiperId: string,
    swipedId: string,
    action: "like" | "dislike"
  ): Promise<Swipe> {
    try {
      const swipe = await Swipe.create({
        swiperId,
        swipedId,
        action,
      });
      return swipe;
    } catch (error) {
      console.error("Error creating swipe:", error);
      throw error;
    }
  }

  public static async getSwipeBySwiperIds(
    swiperId: string,
    swipedId: string
  ): Promise<Swipe | null> {
    try {
      const uuidSchema = z.string().uuid();
      uuidSchema.parse(swiperId); // Validate swiperId format
      uuidSchema.parse(swipedId); // Validate swipedId format
      const swipe = await Swipe.findOne({
        where: {
          swiperId,
          swipedId,
        },
      });
      return swipe;
    } catch (error) {
      console.error("Error fetching swipes by swiper ID:", error);
      throw error;
    }
  }

  public static async getSwipesBySwiperId(swiperId: string): Promise<Swipe[]> {
    try {
      const swipes = await Swipe.findAll({
        where: { swiperId },
        order: [["createdAt", "DESC"]],
      });
      return swipes;
    } catch (error) {
      console.error("Error fetching swipes by swiper ID:", error);
      throw error;
    }
  }

  public static async deleteSwipeByUserId(userId: string): Promise<void> {
    try {
      await Swipe.destroy({
        where: { swiperId: userId },
      });
    } catch (error) {
      console.error("Error deleting swipe by user ID:", error);
      throw error;
    }
  }
}
