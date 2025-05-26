import { AddSwipeRequest, AddSwipeResponse } from "@/dtos/request";
import { SwipeService } from "@/services/swipeService";
import { messageToErrorResponse } from "@/utils/helper";
import { Request, Response, NextFunction } from "express";

export class SwipeController {
  private swipeService: SwipeService;
  constructor() {
    this.swipeService = new SwipeService();
  }

  public async addSwipe(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const userInfo = req.user!;
    const { swipedId, action } = req.body as AddSwipeRequest;
    if (!swipedId || !action) {
      res
        .status(400)
        .json(messageToErrorResponse("swipedId and action are required"));
      return;
    }
    try {
      const result = await this.swipeService.addSwipe(
        userInfo.userId,
        swipedId,
        action
      );
      res.status(200).json(result);
      return;
    } catch (error) {
      console.error("Error processing swipe:", error);
      next(error);
    }
  }
}
