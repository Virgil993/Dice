export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};
