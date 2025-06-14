export type Conversation = {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};
