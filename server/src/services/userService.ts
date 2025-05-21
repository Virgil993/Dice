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
import { UserDTO, UserLoginResponse, UserPhotoDTO } from "@/dtos/user";
import { ActiveSessionRepository } from "@/repositories/activeSessionRepository";
import { UserPhotoRepository } from "@/repositories/userPhotoRepository";
import { UserRepository } from "@/repositories/userRepository";
import { UserError } from "@/types/errors";
import {
  comparePassword,
  generateActiveSessionToken,
  hashPassword,
} from "@/utils/auth";
import { hashFile } from "@/utils/hash";
import { toUTCDate, userToDTO } from "@/utils/helper";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

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
  ): Promise<UserDTO> {
    const existingUser = await UserRepository.getUserByEmail(email);
    if (existingUser) {
      throw new UserError("User with this email already exists", 409);
    }

    const utcTime = toUTCDate(birthday);
    const hashedPassword = await hashPassword(password);
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

    return userDto;
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

    const isPasswordValid = comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UserError("Invalid username or password", 401);
    }

    const token = await generateActiveSessionToken(
      user.id,
      userAgent,
      user.email,
      user.verified,
      user.totpEnabled,
      this.secrets.active_session_token_secret
    );

    const acctiveSession = ActiveSession.build({
      userId: user.id,
      token: token,
      userAgent: userAgent,
      lastUsedAt: new Date(),
    });

    await ActiveSessionRepository.createActiveSession(acctiveSession);

    return {
      token: token,
      user: userToDTO(user),
    };
  }

  public async getUserById(userId: string): Promise<UserDTO> {
    const user = await UserRepository.getUserById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    return userToDTO(user);
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
}
