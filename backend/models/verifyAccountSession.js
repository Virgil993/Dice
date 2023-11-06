import { Schema, model } from "mongoose";

const verifyAccountSessionSchema = new Schema({
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

const verifyAccountSession = model("VerifyAccountSession", verifyAccountSessionSchema);

export default verifyAccountSession;