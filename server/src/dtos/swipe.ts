export type SwipeAction = "like" | "dislike";

export type SwipeDTO = {
  id: string;
  swiperId: string;
  swipedId: string;
  action: SwipeAction;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};
