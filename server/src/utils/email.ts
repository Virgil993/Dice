import { Secrets } from "@/config/secrets";
import { createTransport } from "nodemailer";

export function getTransporter(secrets: Secrets) {
  const transporter = createTransport({
    service: "gmail",
    secure: true,
    auth: {
      type: "OAuth2",
      user: secrets.email_verification_username,
      clientId: secrets.google_email_oauth_client_id,
      clientSecret: secrets.google_email_oauth_client_secret,
      refreshToken: secrets.google_email_refresh_token,
    },
  });

  return transporter;
}

export function getVerificationEmail(
  userId: string,
  token: string,
  appUrl: string
): string {
  return `
    <html>
      <body>
        <h1>Welcome to AppDice!</h1>
        <p>Click the link below to verify your email address:</p>
        <a href="${appUrl}/email/verify-email/?token=${token}&userId=${userId}">Verify Email</a>
      </body>
    </html>
  `;
}

export function getPasswordResetEmail(
  userId: string,
  token: string,
  appUrl: string
): string {
  return `
    <html>
      <body>
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${appUrl}/password/reset-password/?token=${token}&userId=${userId}">Reset Password</a>
      </body>
    </html>
  `;
}
