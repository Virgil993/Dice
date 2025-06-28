import Redis from "ioredis";
import { Secrets } from "./secrets";

export class RedisInstance {
  private client: Redis;

  constructor(secrets: Secrets) {
    console.log(
      "Initializing Redis client with connection URL:",
      secrets.redis_connection_url
    );
    const redisHost = new URL(secrets.redis_connection_url).hostname;
    this.client = new Redis(secrets.redis_connection_url, {
      tls: {
        rejectUnauthorized: false, // Adjust based on your security requirements
        servername: redisHost, // Use the hostname for SNI
      },
    });
  }

  public getClient(): Redis {
    return this.client;
  }
}
