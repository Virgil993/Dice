import dotenv from "dotenv";

dotenv.config();

export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || "";
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || "";
export const AWS_REGION = process.env.AWS_REGION || "";
export const DB_HOST = process.env.DB_HOST || "";
export const DB_PORT = process.env.DB_PORT || "";
export const DB_USER = process.env.DB_USER || "";
export const DB_NAME = process.env.DB_NAME || "";
export const ENVIRONMENT = process.env.ENVIRONMENT || "dev";
export const BUCKET_NAME = process.env.BUCKET_NAME || "";
export const API_URL = process.env.API_URL || "";
export const APP_URL = process.env.APP_URL || "";
