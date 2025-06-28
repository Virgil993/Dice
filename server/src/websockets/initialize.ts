// websocket.ts - WebSocket module to add to your existing Express app
import { Secrets } from "@/config/secrets";
import { ActiveSessionPayload } from "@/dtos/user";
import { createRateLimiters } from "@/middlewares/rateLimit";
import { ActiveSessionRepository } from "@/repositories/activeSessionRepository";
import { ConversationRepository } from "@/repositories/conversationRepository";
import { MessageRepository } from "@/repositories/messageRepository";
import { compareHashes, verifyActiveSessionToken } from "@/utils/auth";
import http, { IncomingMessage } from "http";
import Redis from "ioredis";
import url from "url";
import WebSocket from "ws";
import { createAsyncVerifyClient } from "./verifyClient";

// Types
interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAuthenticated?: boolean;
  isAlive?: boolean; // Optional: track if the user is still connected
}

type WebSocketMessage = {
  type: "message";
  id?: string;
  token?: string;
  to?: string;
  from?: string;
  message?: string;
  timestamp?: string;
};

const HEARTBEAT_INTERVAL = 30000; // 30 seconds

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
      ws.isAlive = true; // Mark the WebSocket as alive
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

      ws.on("pong", () => {
        console.log(`Received pong from user ${ws.userId}`);
        ws.isAlive = true; // Mark the WebSocket as alive
      });

      const heartbeatInterval = setInterval(() => {
        if (ws.isAlive === false) {
          console.log(`WebSocket connection closed for user ${ws.userId}`);
          connectedUsers.delete(ws.userId!);
          ws.terminate();
          clearInterval(heartbeatInterval);
          return;
        }
        ws.isAlive = false; // Reset the isAlive flag
        ws.ping(); // Send a ping to check if the connection is still alive
      }, HEARTBEAT_INTERVAL);

      // Handle disconnection
      ws.on("close", () => {
        if (ws.userId) {
          connectedUsers.delete(ws.userId);
          clearInterval(heartbeatInterval); // Clear the heartbeat interval
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
  const toUserId = data.to || "";

  // Check if the recipient is the same as the sender
  if (toUserId === ws.userId) {
    ws.close(1008, "Cannot send message to self");
    return;
  }

  // Add the message to the db

  if (!data.to || !data.message || !ws.userId || !data.token || !data.id) {
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Missing required fields",
      })
    );
    return;
  }

  const conversation = await ConversationRepository.getConversationByUserIds(
    ws.userId,
    toUserId
  );
  if (!conversation) {
    ws.close(1008, "Conversation not found");
    return;
  }
  const message = await MessageRepository.getMessageById(data.id);
  if (!message) {
    ws.close(1008, "Message not found");
    return;
  }

  // Find recipient's WebSocket connection
  const recipientWs = connectedUsers.get(toUserId);

  if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
    // Send message to recipient
    recipientWs.send(
      JSON.stringify({
        type: "message",
        id: data.id,
        from: ws.userId,
        to: toUserId,
        message: data.message,
        timestamp: data.timestamp || new Date().toISOString(),
      })
    );
  }
}
