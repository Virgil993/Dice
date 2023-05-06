import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Jwt from "jsonwebtoken";
import UserModel from "./models/users";
import ActiveSession from "./models/activeSession";
import { MONGO_DB_URI, secret, reqAuth } from "./helper";
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
              expiresIn: 86400, // 1 saptamana
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
      await User.delete({_id: user._id})
      await ActiveSession.deleteMany({ token: token });
      return { success: true };
    } catch (err) {
      return { success: false, msg: "error at delete", error: err };
    }
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
}
