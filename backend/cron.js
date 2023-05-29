import mongoose from "mongoose";
import UserModel from "./models/users";
import { DeleteObjectsCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AWSConfig, MONGO_DB_URI } from "./helper";

export class Cron {
    constructor() {
        this.#connect();
      }
    
    // connect mongoose to mongodb
    #connect() {
        mongoose.set("strictQuery", false);
        try {
          mongoose.connect(MONGO_DB_URI);
        } catch (err) {
          console.log(err);
        }
    }
    async deleteUnverifiedUsers() {
        const client = new S3Client({
            region: AWSConfig.REGION,
            credentials: {
              accessKeyId: AWSConfig.accessKeyId,
              secretAccessKey: AWSConfig.secretAccessKey
            },
        })
        const users = await UserModel.find({verified:false})
        for(let i=0;i<users.length;i++){
            await UserModel.deleteMany({_id: users[i]._id})
            const userId = users[i]._id
            const command = new DeleteObjectsCommand({
                Bucket: AWSConfig.S3_BUCKET,
                Delete:{
                  Objects: [{Key: userId+"/Image1"},{Key: userId+"/Image2"},{Key: userId+"/Image3"},{Key: userId+"/Image4"}]
                }
              });
            try{
                const { Deleted } = await client.send(command);
                console.log(`Successfully deleted ${Deleted.length} objects from S3 bucket.`)
            }
            catch(err){
                console.log(err)
            }
        }
    }
}