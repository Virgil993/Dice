import mongoose, { Model } from "mongoose";
import UserModel from "./models/users";
import { MONGO_DB_URI, reqAuth } from "./helper";
import ConversationModel from './models/conversations'

export class Conversation{
    constructor() {
        this.#connect()
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

    async create(token, users){
        const authObject = await reqAuth(token);
        if (!authObject.success) {
          return { success: false, msg: authObject.msg };
        }

        if(users.length < 2) {
            return {success: false, msg: "Not enough users to create a conversation"}
        }

        const newConversation = await ConversationModel.create({
            users: users,
            messages: []
        })

        return { success: true, conversationId: newConversation._id}
    }

    async getByBothUserId(user1Id,user2Id){
        const conversation = await ConversationModel.find({users : {$all : [user2Id,user1Id]}})
        if(!conversation || conversation.length == 0){
            return {success: false, msg: "error at get conversation by both user id"}
        }
        return {success: true, element: conversation[0]}
    }

    async getByUserId(token) {
        const authObject = await reqAuth(token);
        if (!authObject.success) {
          return { success: false, msg: authObject.msg };
        }
    
        const userId = authObject.userId;

        if (!userId) {
            return { success: false, msg: "userId not found" };
        }

        const elements = await ConversationModel.find({users: userId});
        return {success: true, elements: elements};
    }


    async addMessage(message){
        try{
            const conversation = await ConversationModel.find({users : {$all : [message.recevier,message.sender]}})
            if(conversation[0].messages){
            await ConversationModel.findByIdAndUpdate(
                {_id: conversation[0]._id},
                { "$push": {"messages": message} }, 
                { "new": true, "upsert": true }
                )
                
                return {success: true}
            }
            else{
            await ConversationModel.findByIdAndUpdate(
                {_id: conversation[0]._id},
                { "$set": {"messages": [message]} }, 
                )
                return {success: true}
            }
            
        }
        catch(err){
            console.log(err)
            return {success:false, msg: "error at add message", error: err}

        }
    }

    async delete(token, id){
        const authObject = await reqAuth(token);
        if (!authObject.success) {
          return { success: false, msg: authObject.msg };
        }

        if (!id) {
            return { success: false, msg: "Required fields are empty" };
        }

        await ConversationModel.deleteMany({ _id: id });
        return { success: true };
    }

    async deleteAll(token){
        const authObject = await reqAuth(token);
        if (!authObject.success) {
          return { success: false, msg: authObject.msg };
        }

        await ConversationModel.deleteMany({users: authObject.userId})
        return {success: true};
    }
}