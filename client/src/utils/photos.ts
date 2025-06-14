export const acceptedFileTypesPhotos = [
  "image/png",
  "image/jpg",
  "image/jpeg",
  "image/webp",
];

export function convertFromBlobToFile(
  blob: Blob,
  fileName: string,
  fileType: string
): File {
  return new File([blob], fileName, { type: fileType });
}
