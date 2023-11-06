import { Schema, model } from "mongoose";
const conversationsSchema = Schema({
    users: {
        type: [String],
        required: true
    },
    messages: {
        type: Array,
        required: true
    }

})

const conversations = model("Conversation",conversationsSchema)

export default conversations;