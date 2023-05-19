import React from "react";
import AWS from 'aws-sdk';
import { User } from "../backend_sdk/user.sdk";

const S3_BUCKET = "dice-users-photos-iam";
const REGION = "eu-north-1"


AWS.config.update({
    accessKeyId: 'AKIAXRJKOX2SN5I4MQF5',
    secretAccessKey: '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'
})

const myBucket = new AWS.S3({
    params: { Bucket: S3_BUCKET},
    region: REGION,
})

export const uploadImageToS3WithNativeSdk = (file,userId) =>{
    return new Promise((resolve,reject) =>{
        const params = {
            ACL: 'public-read',
            Body: file,
            Bucket: S3_BUCKET,
            Key: userId+"/"+file.name
        }
        myBucket.putObject(params,function (err,data) {
            if (err) {
                reject(err)
            }
            else {
                console.log("Uploaded Image Successfully!")
                resolve(data)
            }
        })
    })
}

export const readImageFromS3WithNativeSdk = (userId,photoNumber) =>{
    return new Promise((resolve,reject) =>{
        const params = {
            Bucket: S3_BUCKET,
            Key: userId+"/Image"+photoNumber
        }
        myBucket.getObject(params, function (err, data) {
            if (err) {
                reject(err)
            }
            else {
                console.log("Retrieved Image Successfully!")
                resolve(data)
            }
        })

    })
}