import Redis from "ioredis";
import { Request, Response, NextFunction } from "express";
import { LoginAttempt } from "./auth";
import { IncomingMessage } from "http";

type RateLimitOptions = {
  windowMs?: number; // Time window in milliseconds
  maxRequests?: number; // Maximum requests allowed
  keyGenerator?: string | ((req: Request) => string); // Key generator function or strategy
  message?: string; // Error message to return
  route?: string; // Route identifier for the rate limit
};

type ProggresiveRateLimitOptions<T = RateLimitOptions> = T & {
  attempts?: Array<{
    maxRequests: number; // Maximum requests allowed
    windowMs: number; // Time window in milliseconds
  }>;
};

export type RateLimitMiddlewares = {
  login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  register: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  sendEmail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  resetPassword: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
  totpVerify: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
  api: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  recordFailedLogin: (req: Request) => Promise<void>;
  clearLoginAttempts: (req: Request) => Promise<void>;
  checkWebSocketRateLimit: (req: IncomingMessage) => Promise<boolean>;
};

class RateLimiter {
  private redis: Redis;
  constructor(redisClient: Redis) {
    this.redis = redisClient;
  }

  // Main rate limiting middleware factory
  createMiddleware(options: RateLimitOptions) {
    const {
      windowMs = 15 * 60 * 1000, // 15 minutes default
      maxRequests = 5,
      keyGenerator = "ip", // 'ip', 'user', or custom function
      message = "Too many requests, please try again later",
      route = "default",
    } = options;

    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Generate the rate limit key
        const key = this.generateKey(req, keyGenerator, route);

        // Get current count
        const current = await this.redis.get(key);
        const count = current ? parseInt(current) : 0;

        // Check if limit exceeded
        if (count >= maxRequests) {
          const ttl = await this.redis.ttl(key);

          res.status(429).json({
            status: "error",
            message: message,
            retryAfter: ttl > 0 ? ttl : windowMs / 1000,
          });
          return;
        }

        const newCount = await this.incrementCounter(key, windowMs);

        // Add rate limit headers
        res.set({
          "X-RateLimit-Limit": maxRequests,
          "X-RateLimit-Remaining": Math.max(0, maxRequests - newCount),
          "X-RateLimit-Reset": new Date(Date.now() + windowMs).toISOString(),
        });

        next();
      } catch (error) {
        console.error("Rate limiting error:", error);
        // Fail open - don't block requests if Redis is down
        next();
      }
    };
  }

  generateKeyIncomingMessage(
    req: IncomingMessage,
    keyGenerator: string | ((req: IncomingMessage) => string),
    route: string
  ) {
    let identifier;
    if (typeof keyGenerator === "function") {
      identifier = keyGenerator(req);
    } else {
      switch (keyGenerator) {
        case "ip":
          identifier = req.socket.remoteAddress || "";
          break;
        default:
          identifier = keyGenerator;
      }
    }

    return `rate_limit:${route}:${identifier}`;
  }

  // Generate rate limit key based on strategy
  generateKey(
    req: Request,
    keyGenerator: string | ((req: Request) => string),
    route: string
  ) {
    let identifier;

    if (typeof keyGenerator === "function") {
      identifier = keyGenerator(req);
    } else {
      switch (keyGenerator) {
        case "ip":
          identifier = this.getClientIP(req);
          break;
        case "user":
          identifier = req.user?.userId || req.user?.email || "anonymous";
          break;
        case "hybrid":
          // Use user if authenticated, otherwise IP
          identifier = req.user?.userId || this.getClientIP(req);
          break;
        default:
          identifier = keyGenerator;
      }
    }

    return `rate_limit:${route}:${identifier}`;
  }

  // Get client IP (handles proxies)
  getClientIP(req: Request) {
    return (
      req.ip ||
      req.socket.remoteAddress ||
      (req.socket ? req.socket.remoteAddress : null) ||
      "0.0.0.0"
    );
  }

  // Atomically increment counter with expiration
  async incrementCounter(key: string, windowMs: number) {
    const multi = this.redis.multi();
    multi.incr(key);
    multi.expire(key, Math.ceil(windowMs / 1000));
    const results = await multi.exec();
    if (!results || results.length === 0) {
      throw new Error("Failed to increment rate limit counter");
    }
    return results[0][1] as number; // Return the incremented count
  }

  // Helper method for progressive penalties
  createLoginMiddleware(baseOptions: ProggresiveRateLimitOptions) {
    const {
      attempts = [
        { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 in 15 min
        { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 in 1 hour
        { maxRequests: 1, windowMs: 24 * 60 * 60 * 1000 }, // 1 in 24 hours
      ],
      ...otherOptions
    } = baseOptions;

    return async (req: Request, res: Response, next: NextFunction) => {
      const key = this.generateKey(
        req,
        otherOptions.keyGenerator || "ip",
        otherOptions.route || "default"
      );
      try {
        const attemptsData = await this.redis.get(key);
        let attemptsParsed: LoginAttempt = attemptsData
          ? JSON.parse(attemptsData)
          : {
              count: 0,
              lockoutLevel: 0,
              lastAttempt: null,
            };
        if (attemptsParsed.lastAttempt) {
          const timeSinceLastAttempt = Date.now() - attemptsParsed.lastAttempt;

          if (
            attemptsParsed.lockoutLevel > 0 &&
            timeSinceLastAttempt >
              attempts[attemptsParsed.lockoutLevel].windowMs
          ) {
            attemptsParsed = {
              count: 0,
              lockoutLevel: 0,
              lastAttempt: null,
            };
          }
        }

        const isLockedOut = () => {
          if (!attemptsParsed.lastAttempt) return false;

          const timeSinceLastAttempt = Date.now() - attemptsParsed.lastAttempt;
          if (
            attemptsParsed.count >=
            attempts[attemptsParsed.lockoutLevel].maxRequests
          ) {
            return (
              timeSinceLastAttempt <
              attempts[attemptsParsed.lockoutLevel].windowMs
            );
          }

          return false;
        };

        if (isLockedOut()) {
          const ttl = await this.redis.ttl(key);
          res.status(429).json({
            status: "error",
            message:
              otherOptions.message ||
              "Too many requests, please try again later",
            retryAfter:
              ttl > 0
                ? ttl
                : attempts[attemptsParsed.lockoutLevel].windowMs / 1000,
          });
          return;
        }

        req.loginAttempts = attemptsParsed;
        req.loginAttemptsKey = key;

        next();
      } catch (error) {
        console.error("Rate limiting error:", error);
        // Fail open - don't block requests if Redis is down
        next();
      }
    };
  }

  recordFailedLogin = async (req: Request) => {
    if (!req.loginAttemptsKey) return;

    const attempts = req.loginAttempts || {
      count: 0,
      lockoutLevel: 0,
      lastAttempt: null,
    };
    const now = Date.now();

    attempts.count += 1;
    attempts.lastAttempt = now;

    // Escalate lockout level based on attempt count
    if (attempts.lockoutLevel === 0 && attempts.count > 5) {
      attempts.lockoutLevel = 1;
      attempts.count = 0; // Reset count for next level
    } else if (attempts.lockoutLevel === 1 && attempts.count > 3) {
      attempts.lockoutLevel = 2;
      attempts.count = 0; // Reset count for next level
    }

    // Set TTL based on lockout level
    let ttl;
    if (attempts.lockoutLevel === 0) {
      ttl = 15 * 60; // 15 minutes
    } else if (attempts.lockoutLevel === 1) {
      ttl = 60 * 60; // 1 hour
    } else {
      ttl = 24 * 60 * 60; // 1 day
    }

    await this.redis.setex(req.loginAttemptsKey, ttl, JSON.stringify(attempts));
  };

  clearLoginAttempts = async (req: Request) => {
    if (req.loginAttemptsKey) {
      await this.redis.del(req.loginAttemptsKey);
    }
  };

  checkWebSocketRateLimit = async (req: IncomingMessage) => {
    const windowMs = 15 * 60 * 1000, // 15 minutes default
      maxRequests = 10,
      keyGenerator = "ip",
      route = "websocket";

    try {
      // Generate the rate limit key
      const key = this.generateKeyIncomingMessage(req, keyGenerator, route);

      // Get current count
      const current = await this.redis.get(key);
      const count = current ? parseInt(current) : 0;

      // Check if limit exceeded
      if (count >= maxRequests) {
        return false;
      }

      await this.incrementCounter(key, windowMs);
      return true; // Allow the request to proceed
    } catch (error) {
      console.error("Rate limiting error:", error);
      // Fail open - don't block requests if Redis is down
      return true; // Allow the request to proceed
    }
  };
}

// Usage examples and helper functions
export function createRateLimiters(redisClient: Redis): RateLimitMiddlewares {
  const limiter = new RateLimiter(redisClient);

  return {
    // Login rate limiter with progressive penalties
    login: limiter.createLoginMiddleware({
      keyGenerator: "hybrid", // Use user email if available, otherwise IP
      route: "login",
      message: "Too many login attempts. Please try again later.",
    }),
    recordFailedLogin: limiter.recordFailedLogin,
    clearLoginAttempts: limiter.clearLoginAttempts,
    // Registration - IP based
    register: limiter.createMiddleware({
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 25,
      keyGenerator: "ip",
      route: "register",
      message: "Too many registration attempts from this IP",
    }),

    // Email sending - User based
    sendEmail: limiter.createMiddleware({
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 10,
      keyGenerator: "hybrid", // Use user email if available, otherwise IP
      route: "send_email",
      message: "Too many emails sent. Please wait before requesting another.",
    }),

    // Password reset - IP based
    resetPassword: limiter.createMiddleware({
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3,
      keyGenerator: "ip",
      route: "reset_password",
      message: "Too many password reset attempts from this IP",
    }),

    // TOTP verification - User based with short window
    totpVerify: limiter.createMiddleware({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 10,
      keyGenerator: "hybrid", // Use user email if available, otherwise IP
      route: "totp_verify",
      message: "Too many TOTP verification attempts",
    }),

    // General API - User based, generous limits
    api: limiter.createMiddleware({
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 100,
      keyGenerator: "user",
      route: "api",
      message: "API rate limit exceeded",
    }),
    // WebSocket rate limit
    checkWebSocketRateLimit: limiter.checkWebSocketRateLimit,
  };
}

module.exports = { RateLimiter, createRateLimiters };
