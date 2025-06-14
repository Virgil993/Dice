import { Secrets } from "@/config/secrets";
import { ActiveSession } from "@/db/models/activeSession";
import {
  EnableTotpResponse,
  GenerateTotpResponse,
  Status,
  UserLoginResponse,
} from "@/dtos/request";
import { ActiveSessionRepository } from "@/repositories/activeSessionRepository";
import { UserRepository } from "@/repositories/userRepository";
import { UserError } from "@/types/errors";
import {
  compareHashes,
  decryptTotpSecret,
  encryptTotpSecret,
  generateActiveSessionToken,
  generateBackupCodes,
  generateTOTPSecret,
  hashString,
  verifyTOTPCode,
} from "@/utils/auth";
import { userToDTO } from "@/utils/helper";

export class TotpService {
  private secrets: Secrets;

  constructor(secrets: Secrets) {
    this.secrets = secrets;
  }

  public async generateSecret(userId: string): Promise<GenerateTotpResponse> {
    // Check if the user exists in the database
    const user = await UserRepository.getUserById(userId);
    if (!user) {
      throw new UserError("User not found", 404);
    }

    if (user.totpEnabled) {
      throw new UserError("TOTP is already enabled for this user", 409);
    }

    // Generate a TOTP secret for the user
    const totpSecret = generateTOTPSecret(20, user.email);

    // Store the TOTP secret in the database
    const encryptedSecret = encryptTotpSecret(
      totpSecret.secretKey,
      this.secrets.totp_secret_encryption_key
    );
    await UserRepository.updateUserTotpSecret(userId, encryptedSecret);

    return {
      status: Status.SUCCESS,
      otpauthUrl: totpSecret.otpauthUrl,
    };
  }

  public async verifyTotpCode(
    userId: string,
    code: string,
    userAgent: string
  ): Promise<UserLoginResponse> {
    // Check if the user exists in the database
    const user = await UserRepository.getUserById(userId);
    if (!user) {
      throw new UserError("User not found", 404);
    }

    if (!user.totpSecret) {
      throw new UserError("TOTP is not enabled for this user", 403);
    }

    const decryptedSecret = decryptTotpSecret(
      user.totpSecret,
      this.secrets.totp_secret_encryption_key
    );

    if (!verifyTOTPCode(decryptedSecret, code)) {
      throw new UserError("Invalid TOTP code", 403);
    }

    // Generate a new session token for the user
    const token = await generateActiveSessionToken(
      user.id,
      userAgent,
      user.email,
      user.verified,
      user.totpEnabled,
      this.secrets.active_session_token_secret
    );

    const hashedToken = await hashString(token.token);

    const acctiveSession = ActiveSession.build({
      userId: user.id,
      token: hashedToken,
      tokenUuid: token.tokenUUID,
      userAgent: userAgent,
      lastUsedAt: new Date(),
    });

    await ActiveSessionRepository.createActiveSession(acctiveSession);
    return {
      status: Status.SUCCESS,
      token: token.token,
      user: userToDTO(user),
    };
  }

  public async enableTotp(
    userId: string,
    code: string,
    userAgent: string
  ): Promise<EnableTotpResponse> {
    // Check if the user exists in the database
    const user = await UserRepository.getUserById(userId);
    if (!user) {
      throw new UserError("User not found", 404);
    }

    if (user.totpEnabled) {
      throw new UserError("TOTP is already enabled for this user", 409);
    }

    // Verify the TOTP code
    await this.verifyTotpCode(userId, code, userAgent);

    // Generate backup codes for the user
    const backupCodes = await generateBackupCodes();
    const hashedCodes = backupCodes.map((code) => code.hash);
    const plainCodes = backupCodes.map((code) => code.code);
    await UserRepository.setBackupCodes(userId, hashedCodes);
    await UserRepository.setUserTotp(userId, true);

    return {
      status: Status.SUCCESS,
      codes: plainCodes,
    };
  }

  public async disableTotp(userId: string): Promise<void> {
    // Check if the user exists in the database
    const user = await UserRepository.getUserById(userId);
    if (!user) {
      throw new UserError("User not found", 404);
    }

    if (!user.totpEnabled) {
      throw new UserError("TOTP is not enabled for this user", 409);
    }

    // Disable TOTP for the user
    await UserRepository.setUserTotp(userId, false);
    await UserRepository.setBackupCodes(userId, null);
    await UserRepository.updateUserTotpSecret(userId, null);
  }

  public async useBackupCode(
    userId: string,
    code: string,
    userAgent: string
  ): Promise<UserLoginResponse> {
    // Check if the user exists in the database
    const user = await UserRepository.getUserById(userId);
    if (!user) {
      throw new UserError("User not found", 404);
    }

    if (!user.totpEnabled) {
      throw new UserError("TOTP is not enabled for this user", 403);
    }

    if (!user.backupCodes) {
      throw new UserError("No backup codes available", 403);
    }

    const codesHashed = user.backupCodes.split(",").map((c) => c.trim());
    let codeFound = undefined;
    for (const c of codesHashed) {
      if (await compareHashes(code, c)) {
        codeFound = c;
        break;
      }
    }
    if (!codeFound) {
      throw new UserError("Invalid backup code", 403);
    }

    // remove the used backup code from the list
    const codeIndex = codesHashed.indexOf(codeFound);
    if (codeIndex > -1) {
      codesHashed.splice(codeIndex, 1);
    }

    await UserRepository.setBackupCodes(userId, codesHashed);

    // Generate a new session token for the user
    const token = await generateActiveSessionToken(
      user.id,
      userAgent,
      user.email,
      user.verified,
      user.totpEnabled,
      this.secrets.active_session_token_secret
    );

    const hashedToken = await hashString(token.token);

    const acctiveSession = ActiveSession.build({
      userId: user.id,
      token: hashedToken,
      tokenUuid: token.tokenUUID,
      userAgent: userAgent,
      lastUsedAt: new Date(),
    });

    await ActiveSessionRepository.createActiveSession(acctiveSession);
    return {
      status: Status.SUCCESS,
      token: token.token,
      user: userToDTO(user),
    };
  }
}
