const mongoose = require("mongoose");
const messagesSchema = mongoose.Schema({
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

const messages = mongoose.model("Message",messagesSchema)

export default messages