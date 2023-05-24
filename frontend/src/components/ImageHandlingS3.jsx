import { User } from "../backend_sdk/user.sdk";

export const uploadImageToS3WithNativeSdk = async (file,userId) =>{
    return User.UploadImageToS3(file,userId)
}

export const readImageFromS3WithNativeSdk = async (userId,photoNumber) =>{
    return User.readImageFromS3(userId,photoNumber)
}