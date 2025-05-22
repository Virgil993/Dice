import { UserCreateRequest } from "@/dtos/request";
import { loadEsm } from "load-esm";

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email.length > 200) {
    throw new Error("Email is too long");
  }
  if (emailRegex.test(email) === false) {
    throw new Error("Email is not valid");
  }
  return true;
}

export function validatePassword(password: string): boolean {
  // At least 8 characters, at least one uppercase letter, one lowercase letter, one digit and one special character
  // Maximum length of 200 characters
  if (password.length > 200) {
    throw new Error("Password is too long");
  }
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (strongPasswordRegex.test(password) === false) {
    throw new Error("Password is not strong enough");
  }
  return true;
}

export function validateName(name: string): boolean {
  // At least 2 characters, only letters and spaces
  // Maximum length of 200 characters
  const nameRegex = /^[a-zA-Z\s]{2,}$/;
  if (name.length > 200) {
    throw new Error("Name is too long");
  }
  if (nameRegex.test(name) === false) {
    throw new Error("Name is not valid");
  }
  return true;
}

export function validateDescription(description: string): boolean {
  // Maximum length of 2048 characters
  if (description.length > 2048) {
    throw new Error("Description is too long");
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
    throw new Error("Birthday is not valid");
  }
  if (eighteenthBirthday > today) {
    throw new Error("User must be at least 18 years old");
  }

  return true;
}

export function validateGender(gender: string): boolean {
  const validGenders = ["male", "female"];
  if (gender.length > 10) {
    throw new Error("Gender is too long");
  }
  if (!validGenders.includes(gender)) {
    throw new Error("Gender is not valid");
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
    throw new Error("Too many files, maximum 6 allowed");
  }
  if (files.length < 2) {
    throw new Error("Not enough files, at least 2 required");
  }
  for (const file of files) {
    if (!validMimeTypes.includes(file.mimetype)) {
      throw new Error("File type is not valid");
    }
    if (file.size > maxFileSize) {
      throw new Error("File size is too large");
    }
    const ext = file.originalname.split(".").pop();
    if (!allowedExtensions.includes(`.${ext}`)) {
      throw new Error("File extension is not valid");
    }
    if (file.originalname.length > 20000) {
      throw new Error("File name is too long");
    }
    const fileType = await fileTypeFromBuffer(file.buffer);
    if (!fileType) {
      throw new Error("File type is not valid");
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
  await validateFiles(files);
  return true;
}
