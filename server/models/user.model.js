import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // <-- import bcrypt
import crypto from "crypto";
import nodemailer from "nodemailer";

const userSchema = new mongoose.Schema(
  {
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
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    photoUrl: {
      type: String,
      default: "",
    },
    isOnboarded:{
      type: Boolean, 
      default: false
    },
    friends:[
      {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User"
      }
    ], 
    bio: {
      type: String, 
      default: ""
    },
    settings: {
      type: Object,
      default: {},
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Optional: Add a method for password comparison
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", userSchema);

// 1. Forgot Password (send email)
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  // Generate token
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpire = Date.now() + 1000 * 60 * 60; // 1 hour
  await user.save();

  // Send email
  const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // your gmail address
      pass: process.env.EMAIL_PASS, // your gmail app password
    },
  });
  await transporter.sendMail({
    to: user.email,
    subject: "Password Reset",
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link will expire in 1 hour.</p>`,
  });

  res.json({ message: "Password reset link sent to your email." });
};

// 2. Reset Password (set new password)
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ message: "Password reset successful" });
};
