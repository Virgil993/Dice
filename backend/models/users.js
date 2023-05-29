const mongoose = require("mongoose");
const usersSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: { 
    type: String,
    required: true,
  },
  birthday: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  saidYesTo: {
    type: [String],
    default: undefined
  },
  saidNoTo: {
    type: [String],
    default: undefined
  },
  gamesSelected: {
    type: Array,
    required: true
  },
  verified:{
    type: Boolean,
    required: true,
    default: true,
  }
});

const users = mongoose.model("User", usersSchema);

module.exports = users;