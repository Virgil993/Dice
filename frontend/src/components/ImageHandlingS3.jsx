import { User } from "@genezio-sdk/DiceBackend_us-east-1";

export const uploadImageToS3WithNativeSdk = async (file,userId) =>{
    return User.UploadImageToS3(file,userId)
}

export const readImageFromS3WithNativeSdk = async (userId,photoNumber) =>{
    return User.readImageFromS3(userId,photoNumber)
}