import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { UserModel } from "./models/user";
// import { saltedPassword, validatePassword } from "./authentication/session";
import { ActiveSessionModel } from "./models/activeSession";
import { connectDb, syncDb } from "./db/connect";
import { CreateUserResponse, SendVerificationEmailResponse } from "./dtos/user";
import { GenezioDeploy } from "@genezio/types";
import { VerifyAccountSessionModel } from "./models/veryifyAccountSession";
import { emailHtmlVerifyAccount, transporter } from "./authentication/email";

/**
 * The User server class that will be deployed on the genezio infrastructure.
 */
@GenezioDeploy()
export class UserService {
  constructor() {
    this.#connect();
  }

  /**
   * Private method used to connect to the DB.
   */
  #connect() {
    if (!process.env.POSTGRES_URL) {
      console.error("Missing POSTGRES_URL environment variable");
      return;
    }

    try {
      const db = connectDb();
      syncDb(db).catch((error) => {
        console.error("Error syncing DB:", error);
        throw error;
      });
    } catch (error) {
      console.error("Error connecting to DB:", error);
      return;
    }
  }

  // Send Verification email
  async sendVerificationEmail(
    email: string,
    userId: string
  ): Promise<SendVerificationEmailResponse> {
    console.log(`Sending verification email to ${email}...`);

    const frontendUrl = process.env.FRONTEND_URL;
    const secret = process.env.VERIFY_ACCOUNT_SESSION_SECRET;
    if (!secret) {
      return { success: false, err: "No secret provided" };
    }

    const token = jwt.sign({ userId: userId }, secret, {
      expiresIn: 900,
    });

    const link = `${frontendUrl}/auth/verify-email/${token}`;

    try {
      VerifyAccountSessionModel.destroy({ where: { userId: userId } });
      VerifyAccountSessionModel.create({ token: token, userId: userId });

      await transporter.sendMail({
        from: '"Dice" <dicedmn@gmail.com>',
        to: email,
        subject: "Verify your email",
        html: emailHtmlVerifyAccount(link, email),
      });
    } catch (error: any) {
      console.error("Error creating verification session:", error);
      return { success: false, err: error.toString() };
    }

    return { success: true, msg: "Email sent successfully" };
  }

  /**
   * Method that can be used to create a new user.
   *
   * The method will be exported via SDK using genezio.
   *
   * @param {*} name The user's name.
   * @param {*} email The user's email.
   * @param {*} password The user's password.
   * @returns An object containing a boolean property "success" which
   * is true if the creation was successfull, false otherwise.
   */
  async register(
    name: string,
    email: string,
    password: string
  ): Promise<CreateUserResponse> {
    console.log(`Registering user with name ${name} and email ${email}...`);

    let user;
    try {
      user = await UserModel.findOne({ email: email });
    } catch (error: any) {
      return { success: false, err: error.toString() };
    }
    if (user) {
      return { success: false, msg: "User already exists" };
    } else {
      const result = await saltedPassword(password);

      try {
        await UserModel.create({
          name: name,
          email: email,
          password: result,
        });
      } catch (error: any) {
        return { success: false, err: error.toString() };
      }

      return { success: true };
    }
  }

  /**
   * Method that can be used to obtain a login token for a giving user.
   *
   * The method will be exported via SDK using genezio.
   *
   * @param {*} email The user's email.
   * @param {*} password The user's password.
   * @returns
   */
  async login(email: string, password: string): Promise<UserLoginResponse> {
    if (!process.env.MONGO_DB_URI) {
      console.log(red_color, missing_env_error);
      return { success: false, err: missing_env_error };
    }
    console.log(`Login request received for user with email ${email}`);

    let user;
    try {
      user = await UserModel.findOne({ email: email });
    } catch (error: any) {
      return { success: false, err: error.toString() };
    }

    if (!user) {
      return { success: false, msg: "User not found" };
    }

    const isValid = await validatePassword(user.password!, password);

    if (isValid) {
      user.password = undefined;
      const token = jwt.sign(user.toJSON(), "secret", {
        expiresIn: 86400, // 1 week
      });

      try {
        await ActiveSession.create({ token: token, userId: user._id });
      } catch (error: any) {
        return { success: false, err: error.toString() };
      }

      return {
        success: true,
        user: {
          _id: user._id.toString(),
          name: user.name!,
          email: user.email!,
        },
        token: token,
      };
    } else {
      return { success: false, msg: "Incorrect user or password" };
    }
  }

  /**
   * Methods that receives a token and confirms if it is valid or not.
   *
   * @param {*} token The user's token.
   * @returns An object containing a boolean property "success" which is true if the token is valid, false otherwise.
   */
  async checkSession(token: string): Promise<CheckSessionResponse> {
    if (!process.env.MONGO_DB_URI) {
      console.log(red_color, missing_env_error);
      return { success: false, err: missing_env_error };
    }
    console.log("Check session request received...");

    let activeSession;
    try {
      activeSession = await ActiveSession.findOne({ token: token });
    } catch (error: any) {
      return { success: false, err: error.toString() };
    }

    if (!activeSession) {
      return { success: false };
    }
    let user;
    try {
      user = await UserModel.findById(activeSession.userId);
    } catch (error: any) {
      return { success: false, err: error.toString() };
    }
    if (!user) {
      return { success: false };
    }

    return { success: true };
  }
}
