import * as crypto from "crypto";

export function hashFile(
  file: Express.Multer.File,
  algorithm: string = "sha256"
): string {
  const hash = crypto.createHash(algorithm);
  hash.update(file.buffer);
  return hash.digest("hex");
}
