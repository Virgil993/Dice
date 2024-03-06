import jwt from "jsonwebtoken";
import activeSession from "./models/activeSession";
import resetPasswordSession from "./models/resetPasswordSession";
import nodemailer from "nodemailer";
import verifyAccountSession from "./models/verifyAccountSession";

export async function reqAuth(token) {
  const session = await activeSession.find({ token: token });
  const decodedToken = jwt.verify(token, secret);
  if (
    session.length === 1 &&
    decodedToken.exp >= (new Date().getTime() + 1) / 1000
  ) {
    return {
      success: true,
      msg: "token authorized",
      userId: session[0].userId,
    };
  } else {
    return {
      success: false,
      msg: "User is not logged on or session expired",
      userId: undefined,
    };
  }
}

export async function reqResetPassword(token) {
  const session = await resetPasswordSession.find({ token: token });
  const decodedToken = jwt.verify(token, secret);
  if (
    session.length === 1 &&
    decodedToken.exp >= (new Date().getTime() + 1) / 1000
  ) {
    return {
      success: true,
      msg: "token authorized",
      userId: session[0].userId,
    };
  } else {
    return {
      success: false,
      msg: "User not authorized or session expired",
      userId: undefined,
    };
  }
}

export async function reqVerifyAccount(token) {
  const session = await verifyAccountSession.find({ token: token });
  const decodedToken = jwt.verify(token, secret);
  if (
    session.length === 1 &&
    decodedToken.exp >= (new Date().getTime() + 1) / 1000
  ) {
    return {
      success: true,
      msg: "token authorized",
    };
  } else {
    return {
      success: false,
      msg: "User not authorized or session expired",
    };
  }
}

export const MONGO_DB_URI = process.env.MONGO_DB_URI;

export const secret = "secretkey";

export function emailHtmlResetPassword(link, email) {
  const htmlText = `<h1>Hello, ${email} </h1>
    <br>
    <div>Click the button to change your password.</div>
    <br>
    <a href=${link}><button>Change password</button></a>
    <br>
    <div>If you didn't send us the password change request, please ignore this email.</div>
    <br>
    <br>
    <footer>This email has been generated automatically. Please do not reply to it</footer>
    `;
  return htmlText;
}

export const AWSConfig = {
  S3_BUCKET: process.env.S3_BUCKET,
  REGION: process.env.REGION,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
};
