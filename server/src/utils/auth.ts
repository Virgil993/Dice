import { compare, hash } from "bcrypt";
import { V3 } from "paseto";
import crypto from "crypto";
import { ActiveSessionPayload, EmailVerificationPayload } from "@/dtos/user";
import { UserError } from "@/types/errors";

export type BackupCode = {
  code: string;
  hash: string;
};

export async function hashString(password: string): Promise<string> {
  const SALT = 10;

  const hashedPassword = await hash(password, SALT);

  return hashedPassword;
}

export async function compareHashes(
  text: string,
  hashedText: string
): Promise<boolean> {
  const isMatch = compare(text, hashedText);
  return isMatch;
}

// Generate an active session token with expiration to 2 hours
export async function generateActiveSessionToken(
  userId: string,
  userAgent: string,
  email: string,
  verified: boolean,
  totpEnabled: boolean,
  secret: string
): Promise<{ token: string; tokenUUID: string }> {
  const buffer = Buffer.from(secret, "base64");
  const localKey = crypto.createSecretKey(buffer);
  const tokenUUID = crypto.randomUUID();

  const payload: ActiveSessionPayload = {
    userId: userId,
    userAgent: userAgent,
    tokenUUID: tokenUUID,
    email: email,
    verified: verified,
    totpEnabled: totpEnabled,
  };

  const token = await V3.encrypt(payload, localKey, {
    expiresIn: "2 hours",
  });

  return { token, tokenUUID };
}

export async function verifyActiveSessionToken(
  token: string,
  secret: string
): Promise<ActiveSessionPayload> {
  const buffer = Buffer.from(secret, "base64");
  const localKey = crypto.createSecretKey(buffer);

  try {
    const payload = (await V3.decrypt(token, localKey)) as ActiveSessionPayload;
    return payload;
  } catch (error) {
    throw new UserError("Invalid token", 401);
  }
}

compare;

export async function generateEmailVerificationToken(
  userId: string,
  email: string,
  secret: string
): Promise<{ token: string; tokenUUID: string }> {
  const buffer = Buffer.from(secret, "base64");
  const localKey = crypto.createSecretKey(buffer);
  const tokenUUID = crypto.randomUUID();

  const payload: EmailVerificationPayload = {
    userId: userId,
    tokenUUID: tokenUUID,
    email: email,
  };

  const token = await V3.encrypt(payload, localKey, {
    expiresIn: "15 m",
  });

  return { token, tokenUUID };
}

export async function verifyEmailVerificationToken(
  token: string,
  secret: string
): Promise<EmailVerificationPayload> {
  const buffer = Buffer.from(secret, "base64");
  const localKey = crypto.createSecretKey(buffer);

  try {
    const payload = (await V3.decrypt(
      token,
      localKey
    )) as EmailVerificationPayload;
    return payload;
  } catch (error) {
    throw new UserError("Invalid token", 401);
  }
}

export function generateTOTPSecret(secretLength: number = 20, email: string) {
  // Generate cryptographically secure random bytes
  const randomBytes = new Uint8Array(secretLength);
  crypto.getRandomValues(randomBytes);

  // Convert to Base32 encoding (required format for TOTP)
  const base32Secret = base32Encode(randomBytes);

  // Generate otpauth URL for QR code
  const otpauthUrl = generateOTPAuthURL(base32Secret, email, "DiceApp");

  return {
    secretKey: base32Secret, // Store this encrypted in your database
    otpauthUrl: otpauthUrl, // Use this in QR code for easy setup
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
      otpauthUrl
    )}&size=200x200`, // Example QR code API (replace with your own implementation)
  };
}

export function base32Encode(buffer: Uint8Array): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let result = "";
  let bits = 0;
  let value = 0;

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      bits -= 5;
      result += alphabet[(value >>> bits) & 31];
    }
  }

  if (bits > 0) {
    result += alphabet[(value << (5 - bits)) & 31];
  }

  // Pad with '=' characters if needed
  while (result.length % 8 !== 0) {
    result += "=";
  }

  return result;
}
export function generateOTPAuthURL(
  secret: string,
  email: string,
  issuer: string
): string {
  const digits = 6,
    period = 30,
    algorithm = "SHA1";

  // Ensure issuer and account are URL-encoded
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(email);

  // Build the otpauth URL according to the spec
  let url = `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}`;

  // Add issuer again as a parameter (recommended practice)
  url += `&issuer=${encodedIssuer}`;

  // Add optional parameters if non-default
  if (digits !== 6) url += `&digits=${digits}`;
  if (period !== 30) url += `&period=${period}`;
  if (algorithm !== "SHA1") url += `&algorithm=${algorithm}`;

  return url;
}

export async function generateBackupCodes(
  numberOfCodes: number = 8,
  codeLength: number = 10
): Promise<BackupCode[]> {
  const codes: BackupCode[] = [];

  const charset = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

  for (let i = 0; i < numberOfCodes; i++) {
    let code = "";
    for (let j = 0; j < codeLength; j++) {
      const randomIndex = Math.floor(
        (crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1)) *
          charset.length
      );
      code += charset[randomIndex];
    }
    const hashCode = await hashString(code);
    codes.push({ code, hash: hashCode });
  }

  return codes;
}
