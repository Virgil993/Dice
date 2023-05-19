const mongoose = require("mongoose");

const resetPasswordSessionSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const resetPasswordSession = mongoose.model("ResetPasswordSession", resetPasswordSessionSchema);

module.exports = resetPasswordSession;