// websocket.ts - WebSocket module to add to your existing Express app
import WebSocket from "ws";
import http from "http";
import { IncomingMessage } from "http";
import url from "url";
import { Secrets } from "@/config/secrets";
import { ENVIRONMENT } from "@/config/envHandler";
import Redis from "ioredis";
import { createRateLimiters } from "@/middlewares/rateLimit";
import { createAsyncVerifyClient } from "./verifyClient";
import { compareHashes, verifyActiveSessionToken } from "@/utils/auth";
import { ActiveSessionRepository } from "@/repositories/activeSessionRepository";
import { UserRepository } from "@/repositories/userRepository";
import { ActiveSessionPayload } from "@/dtos/user";
import { ConversationRepository } from "@/repositories/conversationRepository";
import { MessageRepository } from "@/repositories/messageRepository";

// Types
interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAuthenticated?: boolean;
}

type WebSocketMessage = {
  type: "message";
  token?: string;
  to?: string;
  from?: string;
  message?: string;
  timestamp?: string;
};

// Store connected authenticated users
const connectedUsers = new Map<string, AuthenticatedWebSocket>();

// Function to initialize WebSocket on your existing server
export function initializeWebSocket(
  server: http.Server,
  secrets: Secrets,
  redisClient: Redis
): WebSocket.Server {
  const rateLimiters = createRateLimiters(redisClient);
  const wss = new WebSocket.Server({
    server,
    path: "/ws", // Optional: specify a path for WebSocket connections
    verifyClient: createAsyncVerifyClient(rateLimiters, secrets),
  });

  wss.on(
    "connection",
    async (ws: AuthenticatedWebSocket, req: IncomingMessage) => {
      console.log("New WebSocket client attempting to connect");

      const { token } = url.parse(req.url || "", true).query;
      if (!token || typeof token !== "string") {
        console.log("WebSocket connection rejected: No token provided");
        ws.close(1008, "Authentication required");
        return;
      }

      let payload;
      try {
        payload = await verifyActiveSessionToken(
          token,
          secrets.active_session_token_secret
        );
      } catch (error) {
        console.error("WebSocket connection rejected: Invalid token", error);
        ws.close(1008, "Invalid token");
        return;
      }

      const tokenUUID = payload.tokenUUID;
      const session = await ActiveSessionRepository.getActiveSessionByTokenUUID(
        tokenUUID
      );

      if (!session) {
        console.log("WebSocket connection rejected: Invalid or expired token");
        ws.close(1008, "Invalid or expired token");
        return;
      }

      const isValidHash = await compareHashes(token, session.token);
      if (!isValidHash) {
        console.log("WebSocket connection rejected: Invalid or expired token");
      }

      // Mark WebSocket as authenticated
      ws.isAuthenticated = true;
      ws.userId = session.userId;

      // Add to connected users
      connectedUsers.set(session.userId, ws);
      console.log(
        `User ${payload.email} (${payload.userId}) connected via WebSocket`
      );

      // Handle incoming messages
      ws.on("message", async (data: WebSocket.Data) => {
        if (!ws.isAuthenticated || !ws.userId) {
          ws.close(1008, "Not authenticated");
          return;
        }

        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          if (!message.token) {
            ws.close(1008, "Token is required");
            return;
          }
          let payload;
          try {
            payload = await verifyActiveSessionToken(
              message.token,
              secrets.active_session_token_secret
            );
          } catch (error) {
            console.error("Invalid token in WebSocket message:", error);
            ws.close(1008, "Invalid token in message");
            return;
          }

          await handleMessage(ws, message, payload);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Invalid message format",
            })
          );
        }
      });

      // Handle disconnection
      ws.on("close", () => {
        if (ws.userId) {
          connectedUsers.delete(ws.userId);
          console.log(`User ${ws.userId} disconnected from WebSocket`);
        }
      });

      // Handle errors
      ws.on("error", (error: Error) => {
        console.error("WebSocket error:", error);
        if (ws.userId) {
          connectedUsers.delete(ws.userId);
        }
      });

      // Send connection success message
      ws.send(
        JSON.stringify({
          type: "connected",
          userId: ws.userId,
          email: payload.email,
        })
      );
    }
  );

  return wss;
}

async function handleMessage(
  ws: AuthenticatedWebSocket,
  data: WebSocketMessage,
  payload: ActiveSessionPayload
): Promise<void> {
  const userId = payload.userId;
  if (userId != ws.userId) {
    ws.close(1008, "User ID mismatch");
    return;
  }
  if (data.from && data.from !== ws.userId) {
    ws.close(1008, "From user ID does not match authenticated user");
    return;
  }
  const toUserId = data.to || "";

  // Check if the recipient is the same as the sender
  if (toUserId === ws.userId) {
    ws.close(1008, "Cannot send message to self");
    return;
  }

  // Check if the recipient exists
  const recipient = await UserRepository.getUserById(toUserId);
  if (!recipient) {
    ws.close(1008, "Recipient user does not exist");
    return;
  }

  // Check if there is an active conversation
  const conversation = await ConversationRepository.getConversationByUserIds(
    ws.userId,
    toUserId
  );

  if (!conversation) {
    ws.close(1008, "No active conversation found");
    return;
  }

  // Add the message to the db

  if (!data.to || !data.message || !ws.userId) {
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Missing required fields",
      })
    );
    return;
  }

  // Find recipient's WebSocket connection
  const recipientWs = connectedUsers.get(toUserId);

  if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
    // Send message to recipient
    recipientWs.send(
      JSON.stringify({
        type: "message",
        from: ws.userId,
        message: data.message,
        timestamp: new Date().toISOString(),
      })
    );
    // Optional: Save message to database for persistence
    // await messageService.saveMessage(ws.userId, data.to, data.message);
  }
  //   Save message to the database
  await MessageRepository.addMessage(conversation.id, ws.userId, data.message);
}
