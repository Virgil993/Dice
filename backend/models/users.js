import { Schema, model } from "mongoose";
const usersSchema = new Schema({
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
    default: false,
  }
});

const users = model("User", usersSchema);

export default users;