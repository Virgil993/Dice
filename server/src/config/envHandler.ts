import dotenv from "dotenv";

dotenv.config();

export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || "";
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || "";
export const AWS_REGION = process.env.AWS_REGION || "us-east-1";
export const DB_HOST = process.env.DB_HOST || "localhost";
export const DB_PORT = process.env.DB_PORT || "3306";
export const DB_USER = process.env.DB_USER || "root";
export const DB_NAME = process.env.DB_NAME || "";
export const DB_SECRET_NAME = process.env.DB_SECRET_NAME || "";
