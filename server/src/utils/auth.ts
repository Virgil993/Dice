import { compare, hash } from "bcrypt";
import { V3 } from "paseto";
import crypto from "crypto";
import {
  ActiveSessionPayload,
  EmailVerificationPayload,
  PasswordResetPayload,
  TotpTempPayload,
} from "@/dtos/user";
import { UserError } from "@/types/errors";
import { authenticator } from "otplib";
export type BackupCode = {
  code: string;
  hash: string;
};

const ENCRYPTION_ALGORITHM = "aes-256-gcm";

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

export async function generatePasswordResetToken(
  userId: string,
  email: string,
  secret: string
): Promise<{ token: string; tokenUUID: string }> {
  const buffer = Buffer.from(secret, "base64");
  const localKey = crypto.createSecretKey(buffer);
  const tokenUUID = crypto.randomUUID();
  const payload: PasswordResetPayload = {
    userId: userId,
    tokenUUID: tokenUUID,
    email: email,
  };

  const token = await V3.encrypt(payload, localKey, {
    expiresIn: "15 m",
  });

  return { token, tokenUUID };
}

export async function verifyPasswordResetToken(
  token: string,
  secret: string
): Promise<PasswordResetPayload> {
  const buffer = Buffer.from(secret, "base64");
  const localKey = crypto.createSecretKey(buffer);

  try {
    const payload = (await V3.decrypt(token, localKey)) as PasswordResetPayload;
    return payload;
  } catch (error) {
    throw new UserError("Invalid token", 401);
  }
}

export async function generateTotpTempToken(
  userId: string,
  email: string,
  secret: string
): Promise<string> {
  const buffer = Buffer.from(secret, "base64");
  const localKey = crypto.createSecretKey(buffer);

  const payload: TotpTempPayload = {
    userId: userId,
    email: email,
  };

  const token = await V3.encrypt(payload, localKey, {
    expiresIn: "15 m",
  });

  return token;
}

export async function verifyTotpTempToken(
  token: string,
  secret: string
): Promise<TotpTempPayload> {
  const buffer = Buffer.from(secret, "base64");
  const localKey = crypto.createSecretKey(buffer);

  try {
    const payload = (await V3.decrypt(token, localKey)) as TotpTempPayload;
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
  // Ensure issuer and account are URL-encoded
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(email);

  // Build the otpauth URL according to the spec
  let url = `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}`;

  // Add issuer again as a parameter (recommended practice)
  url += `&issuer=${encodedIssuer}`;

  return url;
}

export function encryptTotpSecret(
  secret: string,
  encryptionKey: string
): string {
  const key = crypto.createHash("sha256").update(encryptionKey).digest();

  // Generate random IV (initialization vector)
  const iv = crypto.randomBytes(16);

  // Create cipher
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

  // Encrypt the text
  let encrypted = cipher.update(secret, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Get the authentication tag
  const tag = cipher.getAuthTag();

  // Combine IV, tag, and encrypted data
  return iv.toString("hex") + ":" + tag.toString("hex") + ":" + encrypted;
}

export function decryptTotpSecret(
  encryptedData: string,
  decryptionKey: string
): string {
  // Create a hash of the secret key to ensure it's 32 bytes
  const key = crypto.createHash("sha256").update(decryptionKey).digest();

  // Split the encrypted data
  const parts = encryptedData.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted data format");
  }

  const iv = Buffer.from(parts[0], "hex");
  const tag = Buffer.from(parts[1], "hex");
  const encrypted = parts[2];

  // Create decipher
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  // Decrypt
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

export function verifyTOTPCode(userSecret: string, userCode: string): boolean {
  authenticator.options = {
    window: 1, // Allow a 1-time window for time-based codes
    step: 30, // Time step in seconds
    digits: 6, // Number of digits in the code
  };

  const isValid = authenticator.check(userCode, userSecret);
  return isValid;
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
