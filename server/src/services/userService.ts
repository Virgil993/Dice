import {
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
  BUCKET_NAME,
} from "@/config/envHandler";
import { Secrets } from "@/config/secrets";
import { ActiveSession } from "@/db/models/activeSession";
import { Gender, User } from "@/db/models/user";
import { UserPhoto } from "@/db/models/userPhoto";
import {
  GetUserResponse,
  Status,
  UserCreateResponse,
  UserLoginResponse,
  UserUpdateRequest,
  UserUpdateResponse,
} from "@/dtos/request";
import { UserPhotoDTO } from "@/dtos/user";
import { ActiveSessionRepository } from "@/repositories/activeSessionRepository";
import { PasswordResetSessionRepository } from "@/repositories/passwordResetSessionRepository";
import { UserPhotoRepository } from "@/repositories/userPhotoRepository";
import { UserRepository } from "@/repositories/userRepository";
import { UserError } from "@/types/errors";
import {
  compareHashes,
  generateActiveSessionToken,
  generateTotpTempToken,
  hashString,
  verifyPasswordResetToken,
} from "@/utils/auth";
import { hashFile } from "@/utils/hash";
import { toUTCDate, userToDTO } from "@/utils/helper";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class UserService {
  private s3Client: S3Client;
  private bucketName: string;
  private secrets: Secrets;

  constructor(secrets: Secrets) {
    this.secrets = secrets;
    this.s3Client = new S3Client({
      region: AWS_REGION,
      // This part is required only for local development
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucketName = BUCKET_NAME;
  }

  public async createUser(
    name: string,
    email: string,
    password: string,
    birthday: string,
    gender: Gender,
    description: string,
    files: Express.Multer.File[]
  ): Promise<UserCreateResponse> {
    const existingUser = await UserRepository.getUserByEmail(email);
    if (existingUser) {
      throw new UserError("User with this email already exists", 409);
    }

    const utcTime = toUTCDate(birthday);
    const hashedPassword = await hashString(password);
    const newUser = User.build({
      name: name,
      email: email,
      password: hashedPassword,
      birthday: utcTime,
      description: description,
      gender: gender,
    });
    const result = await UserRepository.createUser(newUser);

    const userDto = userToDTO(result);

    await this.updateUserPhotos(files, result.id);

    return {
      status: Status.SUCCESS,
      user: userDto,
    };
  }

  public async updateUser(
    userId: string,
    newUser: UserUpdateRequest,
    files: Express.Multer.File[]
  ): Promise<UserUpdateResponse> {
    const user = await UserRepository.getUserById(userId);
    if (!user) {
      throw new UserError("User not found", 404);
    }

    if (newUser.name) {
      user.name = newUser.name;
    }
    if (newUser.gender) {
      user.gender = newUser.gender as Gender;
    }
    if (newUser.description) {
      user.description = newUser.description;
    }

    const updatedUser = await UserRepository.updateUser(user);

    await this.updateUserPhotos(files, userId);
    const urls = await this.getUserPhotosUrls(userId);
    return {
      status: Status.SUCCESS,
      user: userToDTO(updatedUser),
      photosUrls: urls,
    };
  }

  public async loginUser(
    email: string,
    password: string,
    userAgent: string
  ): Promise<UserLoginResponse> {
    const user = await UserRepository.getUserByEmail(email);
    if (!user) {
      throw new UserError("Invalid username or password", 401);
    }

    const isPasswordValid = await compareHashes(password, user.password);
    if (!isPasswordValid) {
      throw new UserError("Invalid username or password", 401);
    }

    if (user.totpEnabled) {
      const tempToken = await generateTotpTempToken(
        user.id,
        email,
        this.secrets.totp_temp_token_secret
      );
      return {
        status: Status.SUCCESS,
        totpRequired: true,
        token: tempToken,
      };
    }

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

  public async getUserById(userId: string): Promise<GetUserResponse> {
    const user = await UserRepository.getUserById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    const photosUrls = await this.getUserPhotosUrls(userId);
    return {
      status: Status.SUCCESS,
      user: userToDTO(user),
      photosUrls: photosUrls,
    };
  }

  public async resetPassword(
    userId: string,
    token: string,
    newPassword: string
  ): Promise<void> {
    const payload = await verifyPasswordResetToken(
      token,
      this.secrets.password_reset_session_token_secret
    );

    if (payload.userId !== userId) {
      throw new UserError("Invalid token", 401);
    }

    const session =
      await PasswordResetSessionRepository.getPasswordResetSessionByTokenUUID(
        payload.tokenUUID
      );

    if (!session || session.userId !== userId) {
      throw new UserError("Invalid or expired password reset token", 401);
    }

    const isTokenValid = compareHashes(token, session.token);
    if (!isTokenValid) {
      throw new UserError("Invalid password reset token", 401);
    }

    const user = await UserRepository.getUserById(userId);
    if (!user) {
      throw new UserError("User not found", 404);
    }

    const hashedPassword = await hashString(newPassword);
    await UserRepository.setUserPassword(userId, hashedPassword);
  }

  private async updateUserPhotos(
    files: Express.Multer.File[],
    userId: string
  ): Promise<UserPhotoDTO[]> {
    const oldPhotos = await UserPhotoRepository.getUserPhotosByUserId(userId);
    const newPhotosDTOS: UserPhotoDTO[] = [];
    const newPhotos: UserPhoto[] = [];
    files.forEach((file, index) => {
      const fileHash = hashFile(file);

      const newPhoto: UserPhoto = UserPhoto.build({
        userId: userId,
        position: index + 1,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        fileHash: fileHash,
      });

      newPhotos.push(newPhoto);
      newPhotosDTOS.push({
        id: newPhoto.id,
        userId: newPhoto.userId,
        position: newPhoto.position,
        originalFilename: newPhoto.originalFilename,
        mimeType: newPhoto.mimeType,
        sizeBytes: newPhoto.sizeBytes,
        fileHash: newPhoto.fileHash,
        createdAt: newPhoto.createdAt,
        updatedAt: newPhoto.updatedAt,
        deletedAt: newPhoto.deletedAt,
      });
    });

    for (const newPhoto of newPhotos) {
      const currentPhoto = await UserPhotoRepository.createUserPhoto(newPhoto);
      const params = {
        Bucket: this.bucketName,
        Key: `user-photos/${userId}/${currentPhoto.id}`,
        Body: files[currentPhoto.position - 1].buffer,
        ContentType: files[currentPhoto.position - 1].mimetype,
      };
      await this.s3Client.send(new PutObjectCommand(params));
    }

    // Delete old photos from the database
    const oldPhotosIDs = oldPhotos.map((photo) => photo.id);
    await UserPhotoRepository.deleteUserPhotosByID(oldPhotosIDs);

    // Delete old photos from S3
    for (const oldPhoto of oldPhotos) {
      const params = {
        Bucket: this.bucketName,
        Key: `user-photos/${userId}/${oldPhoto.id}`,
      };
      await this.s3Client.send(new DeleteObjectCommand(params));
    }

    return newPhotosDTOS;
  }

  private async getUserPhotosUrls(userId: string): Promise<string[]> {
    const urls: string[] = [];
    const photos = await UserPhotoRepository.getUserPhotosByUserId(userId);
    for (const photo of photos) {
      const params = {
        Bucket: this.bucketName,
        Key: `user-photos/${userId}/${photo.id}`,
      };
      const url = await getSignedUrl(
        this.s3Client,
        new GetObjectCommand(params),
        { expiresIn: 3600 } // URL expires in 1 hour
      );
      urls.push(url);
    }
    return urls;
  }
}
