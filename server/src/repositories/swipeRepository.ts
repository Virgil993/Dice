import { Swipe } from "@/db/models/swipe";

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
}
