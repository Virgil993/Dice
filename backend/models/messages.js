import { Schema, model } from "mongoose";
const messagesSchema = Schema({
    conversationId: {
        type:String,
        required: true
    },
    text: {
        type: String,
        required: true,
    },
    sender: {
        type: String,
        required: true
    },
    recevier: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    seen: {
        type: Boolean,
        required: true,
        default: false
    }
    

})

const messages = model("Message",messagesSchema)

export default messages;