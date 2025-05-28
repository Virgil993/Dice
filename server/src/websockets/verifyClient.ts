import { ENVIRONMENT } from "@/config/envHandler";
import { Secrets } from "@/config/secrets";
import { RateLimitMiddlewares } from "@/middlewares/rateLimit";
import { ActiveSessionRepository } from "@/repositories/activeSessionRepository";
import { compareHashes, verifyActiveSessionToken } from "@/utils/auth";
import { IncomingMessage } from "http";
import url from "url";

export type UserInfoWS = {
  userId: string;
};

async function verifyClientAsync(info: {
  origin: string;
  secure: boolean;
  req: IncomingMessage;
  rateLimiters?: RateLimitMiddlewares;
  secrets?: Secrets;
}): Promise<{
  success: boolean;
  code?: number; // Optional error code
  message?: string; // Optional error message
  user?: UserInfoWS; // Optional user info if authenticated
}> {
  // Optionally verify the client connection here
  // For example, you can check the origin or other headers

  if (!info.rateLimiters || !info.secrets) {
    console.error("Rate limiters or secrets not provided in info");
    return {
      success: false,
      code: 500, // Internal Server Error
      message: "Server configuration error",
    };
  }
  const allowedOrigins = ["https://dicegames.ro"];
  if (ENVIRONMENT === "dev") {
    allowedOrigins.push("http://localhost:5173"); // Allow local dev server
  }
  if (ENVIRONMENT !== "dev" && !info.secure) {
    console.log(
      "WebSocket connection rejected: Non-secure connection in production"
    );
    return {
      success: false,
      code: 1008, // 1008 indicates policy violation
      message: "Non-secure connection in production",
    };
  }
  const origin = info.origin || "";
  if (!allowedOrigins.includes(origin)) {
    console.log("WebSocket connection rejected: Invalid origin");
    return {
      success: false,
      code: 1008, // 1008 indicates policy violation
      message: "Invalid origin",
    };
  }
  const clientIp = info.req.socket.remoteAddress || "";
  const isAllowed = await info.rateLimiters.checkWebSocketRateLimit(info.req);
  if (!isAllowed) {
    console.log(
      `WebSocket connection rejected: Rate limit exceeded for IP ${clientIp}`
    );
    return {
      success: false,
      code: 429, // Too Many Requests
      message: "Rate limit exceeded",
    };
  }
  const { token } = url.parse(info.req.url || "", true).query;
  if (!token || typeof token !== "string") {
    return {
      success: false,
      code: 401, // Unauthorized
      message: "No token provided",
    };
  }

  const payload = await verifyActiveSessionToken(
    token,
    info.secrets.active_session_token_secret
  );

  const tokenUUID = payload.tokenUUID;
  const session = await ActiveSessionRepository.getActiveSessionByTokenUUID(
    tokenUUID
  );

  if (!session) {
    console.log("WebSocket connection rejected: Invalid or expired token");
    return {
      success: false,
      code: 401, // Unauthorized
      message: "Invalid or expired token",
    };
  }

  const isValidHash = await compareHashes(token, session.token);
  if (!isValidHash) {
    console.log("WebSocket connection rejected: Invalid or expired token");
    return {
      success: false,
      code: 401, // Unauthorized
      message: "Invalid or expired token",
    };
  }
  // If all checks pass, return success
  return {
    success: true,
    user: {
      userId: payload.userId,
    },
  };
}

export function createAsyncVerifyClient(
  rateLimiters: RateLimitMiddlewares,
  secrets: Secrets
) {
  return (
    info: {
      origin: string;
      secure: boolean;
      req: IncomingMessage;
      rateLimiters?: RateLimitMiddlewares;
      secrets?: Secrets;
    },
    callback: (res: boolean, code?: number, message?: string) => void
  ) => {
    // Run async verification
    info.rateLimiters = rateLimiters; // Attach rate limiters to info
    info.secrets = secrets; // Attach secrets to info
    verifyClientAsync(info)
      .then((result) => {
        if (result.success) {
          // Store user info in request for later use
          (info.req as any).user = result.user;
          callback(true);
        } else {
          callback(false, result.code, result.message);
        }
      })
      .catch((error) => {
        console.error("Error during WebSocket verification:", error);
        callback(false, 1008, "Authentication error");
      });
  };
}
