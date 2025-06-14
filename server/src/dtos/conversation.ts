export type ConversationDTO = {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};
