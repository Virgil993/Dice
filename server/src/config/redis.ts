import Redis from "ioredis";
import { Secrets } from "./secrets";

export class RedisInstance {
  private client: Redis;

  constructor(secrets: Secrets) {
    this.client = new Redis(secrets.redis_connection_url);
  }

  public getClient(): Redis {
    return this.client;
  }
}
