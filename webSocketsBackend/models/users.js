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
    type: Array,
    required: true,
  },
  saidNoTo: {
    type: Array,
    required: true,
  },
  gamesSelected: {
    type: Array,
    required: true
  }
});

const users = mongoose.model("User", usersSchema);

module.exports = users;