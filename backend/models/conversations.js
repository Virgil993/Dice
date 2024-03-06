const mongoose = require("mongoose");
const conversationsSchema = mongoose.Schema({
    users: {
        type: [String],
        required: true
    },
    messages: {
        type: Array,
        required: true
    }

})

const conversations = mongoose.model("Conversation",conversationsSchema)

export default conversations