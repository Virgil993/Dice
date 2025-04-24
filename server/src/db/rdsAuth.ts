import {
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
  DB_HOST,
  DB_PORT,
  DB_USER,
} from "@/config/envHandler";
import { Signer } from "@aws-sdk/rds-signer";

import { DataSource, DataSourceOptions } from "typeorm";

export const generateRDSAuthToken = async () => {
  const signer = new Signer({
    region: AWS_REGION,
    hostname: DB_HOST,
    port: Number(DB_PORT),
    username: DB_USER,
    // This part is required only for local development
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });

  const token = await signer.getAuthToken();
  return token;
};

export class RDSAuthManager {
  private dataSource: DataSource | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  private readonly TOKEN_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes (tokens expire after 15 minutes)
  private isInitializing = false;
  private initPromise: Promise<DataSource> | null = null;

  private readonly dbConfig: Omit<DataSourceOptions, "password"> = {
    type: "mysql",
  };
}
