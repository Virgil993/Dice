import { FileFilterCallback } from "multer";

export const fileFilter = (
  _: Express.Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  // accept only image files
  const mimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (mimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"));
  }
};
