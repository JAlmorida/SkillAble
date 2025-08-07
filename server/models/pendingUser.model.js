import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  confirmationCode: String,
  confirmationExpires: Date,
}, { timestamps: true });

export const PendingUser = mongoose.model("PendingUser", pendingUserSchema);
