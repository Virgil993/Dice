import { Conversation } from "@/db/models/conversation";
import { AddSwipeResponse, Status } from "@/dtos/request";
import { SwipeAction } from "@/dtos/swipe";
import { ConversationRepository } from "@/repositories/conversationRepository";
import { SwipeRepository } from "@/repositories/swipeRepository";
import { UserError } from "@/types/errors";
import { swipeToDTO } from "@/utils/helper";

export class SwipeService {
  constructor() {}

  public async addSwipe(
    swiperId: string,
    swipedId: string,
    action: SwipeAction
  ): Promise<AddSwipeResponse> {
    const existingSwipe = await SwipeRepository.getSwipeBySwiperIds(
      swiperId,
      swipedId
    );
    if (existingSwipe) {
      throw new UserError("You have already swiped on this user", 409);
    }

    const swipe = await SwipeRepository.createSwipe(swiperId, swipedId, action);

    const reverseSwipe = await SwipeRepository.getSwipeBySwiperIds(
      swipedId,
      swiperId
    );
    if (reverseSwipe && reverseSwipe.action === "like" && action === "like") {
      const existingConversation =
        await ConversationRepository.getConversationByUserIds(
          swiperId,
          swipedId
        );
      if (!existingConversation) {
        throw new UserError("Conversation already exists", 409);
      }
      await ConversationRepository.createConversation(swiperId, swipedId);
    }
    return {
      status: Status.SUCCESS,
      swipe: swipeToDTO(swipe),
    };
  }
}
