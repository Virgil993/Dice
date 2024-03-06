const mongoose = require("mongoose");

const verifyAccountSessionSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const verifyAccountSession = mongoose.model("VerifyAccountSession", verifyAccountSessionSchema);

export default verifyAccountSession