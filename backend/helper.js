import jwt from "jsonwebtoken";
import activeSession from "./models/activeSession";

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

export const MONGO_DB_URI = process.env.MONGO_DB_URI;

export const secret = process.env.SECRET_KEY;
