import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Jwt, { decode } from "jsonwebtoken";
import UserModel from "./models/users";
import ActiveSession from "./models/activeSession";
import { MONGO_DB_URI, secret, reqAuth, reqResetPassword, emailHtml, transporter, AWSConfig } from "./helper";
import resetPasswordSession from "./models/resetPasswordSession";
import AWS from 'aws-sdk';
import conversations from "./models/conversations";


export class User {
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

  // create a new user
  async create(name, email, password, birthday, gender, description, gamesSelected) {
    if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      return { success: false, msg: "wrong email format" };
    }
    if (password.length < 10) {
      return { success: false, msg: "password is too short" };
    }
    const user = await UserModel.findOne({ email: email });
    if (user) {
      return { success: false, msg: "Email already exists" };
    }
    const promise = new Promise((resolve, reject) => {
      bcrypt.genSalt(10, async function (err, salt) {
        if (err) {
          reject({ success: false, msg: "Error at genSalt", error: err });
        } else {
          bcrypt.hash(password, salt, async function (err, hash) {
            if (err) {
              reject({ success: false, msg: "Error at hash", error: err });
            } else {
              var err,
                newUser = await UserModel.create({
                  name: name,
                  email: email,
                  password: hash,
                  birthday:birthday,
                  gender: gender,
                  description:description,
                  gamesSelected: gamesSelected,
                });
              if (err) {
                reject({
                  success: false,
                  msg: "Error at database",
                  error: err,
                });
              } else {
                var userId = newUser._id.toString();
                resolve({
                  success: true,
                  msg: "The user was succesfully registered",
                  userId: userId,
                });
              }
            }
          });
        }
      });
    });
    return promise;
  }

  // login
  async login(email, password) {
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return { success: false, msg: "Wrong credentials" };
    }
    const promise = new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, async function (err, res) {
        if (err) {
          reject({ success: false, msg: "Error at compare", error: err });
        } else {
          if (res) {
            const token = Jwt.sign(user.toJSON(), secret, {
              expiresIn: 86400, // 1 week
            });
            await ActiveSession.deleteMany({ userId: user._id });
            await ActiveSession.create({ token: token, userId: user._id });
            user.password = null;
            resolve({ success: true, user: user, token: token });
          } else {
            resolve({ success: false, msg: "incorrect user or password" });
          }
        }
      });
    });
    return promise;
  }


  // get a user by his token
  async getUserByToken(token) {
    const activeSession = await reqAuth(token);
    if (!activeSession.success) {
      return { success: false, msg: activeSession.msg };
    }

    const user = await UserModel.findById(activeSession.userId);

    if (!user) {
      return { success: false, msg: "user not logged in or not found" };
    }
    return { success: true, user: user };
  }

  async getUserById(token,userId){
    const activeSession = await reqAuth(token);
    if (!activeSession.success) {
      return { success: false, msg: activeSession.msg };
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return { success: false, msg: "user not not found" };
    }
    return { success: true, user: user };
  }

  // logout
  async logout(token) {
    try {
      await ActiveSession.deleteMany({ token: token }).catch((err)=>{
        return { success: false, msg: "error at logout", error: err } 
      });
      return { success: true };
    } catch (err) {
      return { success: false, msg: "error at logout", error: err };
    }
  }

  // update User
  async updateUser(token, updatedUser) {
    const sessionStatus = await this.getUserByToken(token);
    if (!sessionStatus.success) {
      return { success: false, msg: sessionStatus.msg };
    }
    const user = sessionStatus.user;
    if (!user) {
      return { success: false, msg: "user not found" };
    }

    const dataToSet = {};
    if (updatedUser.name != null) {
      dataToSet.name = updatedUser.name;
    }

    if (updatedUser.email != null) {
      if (!updatedUser.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
        return { success: false, msg: "fields validations error" };
      }
      dataToSet.email = updatedUser.email;
    }

    if(updatedUser.birthday != null) {
        dataToSet.birthday = updatedUser.birthday;
    }

    if (updatedUser.gender != null) {
      dataToSet.gender = updatedUser.gender;
    }

    if (updatedUser.description != null) {
        dataToSet.description = updatedUser.description;
    }

    if (updatedUser.saidYesTo != null) {
        dataToSet.saidYesTo = updatedUser.saidYesTo;
    }

    if (updatedUser.saidNoTo != null) {
        dataToSet.saidNoTo = updatedUser.saidNoTo;
    }

    if (updatedUser.gamesSelected != null) {
        dataToSet.gamesSelected = updatedUser.gamesSelected;
    }

    const newValues = { $set: dataToSet };
    try {
      await UserModel.updateOne({ _id: user._id }, newValues);
      return { success: true, msg: "update completed" };
    } catch (err) {
      return { success: false, msg: "error at update", error: err };
    }
  }

  async updateSaidTo(token, NewUserId, saidYes){
    const sessionStatus = await this.getUserByToken(token);
    if (!sessionStatus.success) {
      return { success: false, msg: sessionStatus.msg };
    }
    const user = sessionStatus.user;
    if (!user) {
      return { success: false, msg: "user not found" };
    }

    if(!NewUserId) {
      return {success: false, msg: "new userId not found"};
    }
     try {
       if(saidYes){
          if(user.saidYesTo){
            await UserModel.findByIdAndUpdate(
              {_id: user._id},
              { "$push": {"saidYesTo": NewUserId.toString()} }, 
              { "new": true, "upsert": true }
              )
              return { success: true, msg: "update completed" };
          }
          else{
            await UserModel.findByIdAndUpdate(
              {_id: user._id},
              { "$set": {"saidYesTo": [NewUserId.toString()]} }, 
              )
              return { success: true, msg: "update completed" };
          }        
       }
       else{
          if(user.saidNoTo){
            await UserModel.findByIdAndUpdate(
              {_id: user._id},
              { "$push": {"saidNoTo": NewUserId.toString()} }, 
              { "new": true, "upsert": true }
              )
              return { success: true, msg: "update completed" };
          }
          else{
            await UserModel.findByIdAndUpdate(
              {_id: user._id},
              { "$set": {"saidNoTo": [NewUserId.toString()]} }, 
              )
              return { success: true, msg: "update completed" };
          }
       }
     }
     catch (err) {
      return { success: false, msg: "error at update", error: err };
    }
  }

  async delete(token) {
    try {
      const sessionStatus = await this.getUserByToken(token);
      if (!sessionStatus.success) {
        return { success: false, msg: sessionStatus.msg };
      }
      const user = sessionStatus.user;
      if (!user) {
        return { success: false, msg: "user not found" };
      }
      console.log(user._id)
      await UserModel.deleteMany({_id: user._id})
      await ActiveSession.deleteMany({ token: token });
      return { success: true };
    } catch (err) {
      return { success: false, msg: "error at delete", error: err };
    }
  }


  async userExist(id,token){
    const session = await reqResetPassword(token)
    if(!session || !session.success){
      return {success: false, msg: session.msg}
    }
    const decodedToken = decode(token)

    const user = await UserModel.findById(id)
    if (!user) {
      return { success: false, msg: "user dosen't exist" };
    }
    if(user.email != decodedToken.email)
    {
      return {success: false, msg: "user email dosen't match token email"};
    }
    if(id!= decodedToken.id){
      return {success: false, msg: "tokenId dosen't match user id"};
    }

    const newSecret = secret + user.password

    try{
      const payload = Jwt.verify(token,newSecret)
    }
    catch (err){
      return {success: false, msg: "error at verify token", error: err}
    }

    user.password = null
    return { success: true, user: user };
  }

  async forgotPassword(email){
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return { success: false, msg: "Wrong credentials" };
    }
    const newSecret = secret + user.password
    const payload = {
      email: user.email,
      id: user._id
    }
    const token = Jwt.sign(payload,newSecret,{expiresIn: '15m'})
    const link = `http://localhost:8080/auth/resetPassword/${user._id}/${token}`
    await resetPasswordSession.deleteMany({ userId: user._id });
    await resetPasswordSession.create({ token: token, userId: user._id });

    try{
      const info = await transporter.sendMail({
        from: "No-reply-dice <dicedmn@gmail.com>",
        to:user.email,
        subject:"Dice password reset",
        html: emailHtml(link,user.email),
      })
      // console.log(info)
      return {success: true, msg:"email sent successfully"}
    }
    catch(err){
      return {success:false, msg:"error at send mail", error:err}
    }

  }

  async resetPassword(id,newPassword){
    const user = await UserModel.findById(id)
    if(!user){
      return {success: false,msg:"user not found"}
    }

    if (newPassword.length < 10) {
      return { success: false, msg: "password is too short" };
    }


    const promise = new Promise((resolve, reject) => {
      bcrypt.genSalt(10, async function (err, salt) {
        if (err) {
          reject({ success: false, msg: "Error at genSalt", error: err });
        } else {
          bcrypt.hash(newPassword, salt, async function (err, hash) {
            if (err) {
              reject({ success: false, msg: "Error at hash", error: err });
            } else {

              const dataToSet = {}
              dataToSet.password = hash
              const newValues = { $set: dataToSet };
              var err,res = await UserModel.updateOne({_id:user._id},newValues)
              await resetPasswordSession.deleteMany({ userId: user._id });
              if (err) {
                reject({
                  success: false,
                  msg: "Error at database",
                  error: err,
                });
              } else {
                resolve({
                  success: true,
                  msg: "password successfully changed",
                });
              }
            }
          });
        }
      });
    })

  return promise

  }

  async getAllUsersSorted(token,user) {
    try {
      const sessionStatus = await this.getUserByToken(token);
      if (!sessionStatus.success) {
        return { success: false, msg: sessionStatus.msg };
      }
      if (!user) {
        return { success: false, msg: "user not found" };
      }
      var saidYesTo = user.saidYesTo
      var saidNoTo = user.saidNoTo
      var gamesSelected = user.gamesSelected
      var allUsers = await UserModel.find({})

      allUsers = allUsers.filter(element => element._id.toString() != user._id.toString() 
      && (!saidYesTo || !(saidYesTo.includes(element._id.toString()))) 
      && (!saidNoTo || !(saidNoTo.includes(element._id.toString()))))
      
      function elemCommon(a, b){
        return a.filter((element)=>{
          return b.includes(element)
        })
      }

      function compareCompatibility(a, b) {
        if (elemCommon(gamesSelected,a.gamesSelected) < elemCommon(gamesSelected,b.gamesSelected)){
          return 1;
        }
        if (elemCommon(gamesSelected,a.gamesSelected) > elemCommon(gamesSelected,b.gamesSelected)){
          return 2;
        }
        return 0;
      }

      allUsers.sort( compareCompatibility );
      return  { success: true, users: allUsers  };

    }
    catch (err) {
      return { success: false, msg: "error at get all sorted users", error: err };
    }
  }

  async shouldCreateConversation(token,userId){
    try{
      const sessionStatus = await this.getUserByToken(token);
      if (!sessionStatus.success) {
        return { success: false, msg: sessionStatus.msg };
      }
      const user = sessionStatus.user;
      if (!user) {
        return { success: false, msg: "user not found" };
      }

      const user2 = await UserModel.findOne({_id:userId})
      if (!user2) {
        return { success: false, msg: "user 2 not found" };
      }

      if(user2.saidYesTo && user2.saidYesTo.includes(user._id.toString())){
        return {success: true, shouldCreate: true}
      }
      else{
        
        return {success: true, shouldCreate: false}
      }
    }
    catch(err){
      return { success: false, msg: "error at should Create Conversation", error: err };
    }
  }

  async UploadImageToS3(file,userId,fileName){
    const S3_BUCKET = AWSConfig.S3_BUCKET;
    const REGION = AWSConfig.REGION;

    AWS.config.update({
        accessKeyId: AWSConfig.accessKeyId,
        secretAccessKey: AWSConfig.secretAccessKey
    })


    const myBucket = new AWS.S3({
      params: { Bucket: S3_BUCKET},
      region: REGION,
    })
    return new Promise((resolve,reject) =>{
      const params = {
          Body: file,
          Bucket: S3_BUCKET,
          Key: userId+"/"+fileName
      }
      myBucket.putObject(params,function (err,data) {
          if (err) {
              console.log(err)
              reject({
                success: false,
                msg: "Error at upload image to S3 bucket",
                error: err
              })
          }
          else {
              console.log("Uploaded Image Successfully!")
              resolve({
                success: true,
                msg: "Uploaded Image Successfully!",
                data: data
              })
          }
      })
    })
  }

  async readImageFromS3(userId,photoNumber){
    const S3_BUCKET = AWSConfig.S3_BUCKET;
    const REGION = AWSConfig.REGION;

    AWS.config.update({
        accessKeyId: AWSConfig.accessKeyId,
        secretAccessKey: AWSConfig.secretAccessKey
    })

    const myBucket = new AWS.S3({
      params: { Bucket: S3_BUCKET},
      region: REGION,
    })
    return new Promise((resolve,reject) =>{
      const params = {
          Bucket: S3_BUCKET,
          Key: userId+"/Image"+photoNumber
      }
      myBucket.getObject(params, function (err, data) {
          if (err) {
              reject({
                success: false,
                msg: "Error at read image from S3 bucket",
                error: err
              })
          }
          else {
              let objectData = data.Body.toString('utf-8')
              resolve({
                success: true,
                msg: "Retrieved Image Successfully!",
                data: objectData
              })
          }
      })

    })
  }
}
