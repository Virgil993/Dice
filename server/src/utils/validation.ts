import { UserCreateRequest } from "@/dtos/request";
import { UserError } from "@/types/errors";
import { loadEsm } from "load-esm";

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email.length > 200) {
    throw new UserError("Email is too long", 400);
  }
  if (emailRegex.test(email) === false) {
    throw new UserError("Email is not valid", 400);
  }
  return true;
}

export function validateGames(games: string[]): boolean {
  if (games.length < 5) {
    throw new UserError("Not enough games, at least 5 required", 400);
  }
  for (const game of games) {
    if (game.length > 500) {
      throw new UserError("Game name is too long", 400);
    }
  }
  return true;
}

export function validatePassword(password: string): boolean {
  // At least 8 characters, at least one uppercase letter, one lowercase letter, one digit and one special character
  // Maximum length of 200 characters
  if (password.length > 200) {
    throw new UserError("Password is too long", 400);
  }
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (strongPasswordRegex.test(password) === false) {
    throw new UserError("Password is not strong enough", 400);
  }
  return true;
}

export function validateName(name: string): boolean {
  // At least 2 characters, only letters and spaces
  // Maximum length of 200 characters
  const nameRegex = /^[a-zA-Z\s]{2,}$/;
  if (name.length > 200) {
    throw new UserError("Name is too long", 400);
  }
  if (nameRegex.test(name) === false) {
    throw new UserError("Name is not valid", 400);
  }
  return true;
}

export function validateDescription(description: string): boolean {
  // Maximum length of 2048 characters
  if (description.length > 2048) {
    throw new UserError("Description is too long", 400);
  }
  return true;
}

export function validateBirthday(birthday: string): boolean {
  const date = new Date(birthday);
  const today = new Date();
  //    Check if the user is at least 18 years old
  const eighteenthBirthday = new Date(
    date.getFullYear() - 18,
    date.getMonth(),
    date.getDate()
  );
  if (isNaN(date.getTime()) || date > today) {
    throw new UserError("Birthday is not valid", 400);
  }
  if (eighteenthBirthday > today) {
    throw new UserError("User must be at least 18 years old", 400);
  }

  return true;
}

export function validateGender(gender: string): boolean {
  const validGenders = ["male", "female"];
  if (gender.length > 10) {
    throw new UserError("Gender is too long", 400);
  }
  if (!validGenders.includes(gender)) {
    throw new UserError("Gender is not valid", 400);
  }
  return true;
}

export async function validateFiles(
  files: Express.Multer.File[]
): Promise<boolean> {
  const { fileTypeFromBuffer } = await loadEsm("file-type");
  const validMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  const maxFileSize = 10 * 1024 * 1024; // 10 MB
  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".PNG",
    ".JPG",
    ".JPEG",
    ".WEBP",
  ];
  if (files.length > 6) {
    throw new UserError("Too many files, maximum 6 allowed", 400);
  }
  if (files.length < 2) {
    throw new UserError("Not enough files, at least 2 required", 400);
  }
  for (const file of files) {
    if (!validMimeTypes.includes(file.mimetype)) {
      throw new UserError("File type is not valid", 400);
    }
    if (file.size > maxFileSize) {
      throw new UserError("File size is too large", 400);
    }
    const ext = file.originalname.split(".").pop();
    if (!allowedExtensions.includes(`.${ext}`)) {
      throw new UserError("File extension is not valid", 400);
    }
    if (file.originalname.length > 20000) {
      throw new UserError("File name is too long", 400);
    }
    const fileType = await fileTypeFromBuffer(file.buffer);
    if (!fileType) {
      throw new UserError("File type is not valid", 400);
    }
  }
  return true;
}

export async function validateUserCreateInput(
  userInfo: UserCreateRequest,
  files: Express.Multer.File[]
): Promise<boolean> {
  validateEmail(userInfo.email);
  validatePassword(userInfo.password);
  validateName(userInfo.name);
  validateDescription(userInfo.description);
  validateBirthday(userInfo.birthday);
  validateGender(userInfo.gender);
  validateGames(userInfo.gameIds);
  await validateFiles(files);
  return true;
}
