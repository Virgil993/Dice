import { ActiveSessionModel } from "../models/activeSession.js";
import JWT from "jsonwebtoken";
import { VerifyAccountSessionModel } from "../models/veryifyAccountSession.js";
import { ResetPasswordSessionModel } from "../models/resetPasswordSession.js";

export type AuthResponse = {
  success: boolean;
  msg?: string;
  err?: string;
};

export async function checkActiveSessionToken(
  token: string
): Promise<AuthResponse> {
  let session;

  const secret = process.env.ACTIVE_SESSION_SECRET;
  if (!secret) {
    return { success: false, err: "No secret provided" };
  }

  try {
    session = await ActiveSessionModel.findAll({
      where: {
        token: token,
      },
    });
    if (session.length != 1) {
      return { success: false, msg: "User is not logged on" };
    }

    JWT.verify(token, secret);

    return { success: true };
  } catch (error: any) {
    return { success: false, err: error.toString() };
  }
}

export async function checkVerifyAccountSessionToken(
  token: string
): Promise<AuthResponse> {
  let session;

  const secret = process.env.VERIFY_ACCOUNT_SESSION_SECRET;
  if (!secret) {
    return { success: false, err: "No secret provided" };
  }

  try {
    session = await VerifyAccountSessionModel.findAll({
      where: {
        token: token,
      },
    });
    if (session.length != 1) {
      return { success: false, msg: "User is not logged on" };
    }

    JWT.verify(token, secret);

    return { success: true };
  } catch (error: any) {
    return { success: false, err: error.toString() };
  }
}

export async function checkResetPasswordSessionToken(
  token: string
): Promise<AuthResponse> {
  let session;

  const secret = process.env.RESET_PASSWORD_SESSION_SECRET;
  if (!secret) {
    return { success: false, err: "No secret provided" };
  }

  try {
    session = await ResetPasswordSessionModel.findAll({
      where: {
        token: token,
      },
    });
    if (session.length != 1) {
      return { success: false, msg: "User is not logged on" };
    }

    JWT.verify(token, secret);

    return { success: true };
  } catch (error: any) {
    return { success: false, err: error.toString() };
  }
}
