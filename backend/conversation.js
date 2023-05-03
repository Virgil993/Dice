import mongoose from "mongoose";
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
}