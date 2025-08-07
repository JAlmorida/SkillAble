import crypto from "crypto";
import nodemailer from "nodemailer";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { upsertStreamUser } from "../utils/stream.js";
import sgMail from '@sendgrid/mail';
import { sendPasswordResetEmail, sendEmailConfirmation } from '../utils/email.js';
import axios from "axios";
import { PendingUser } from "../models/pendingUser.model.js";

export const register = async (req, res) => {
  const { recaptchaToken, ...otherFields } = req.body;

  // 1. Verify reCAPTCHA
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${recaptchaToken}`;
  try {
    const { data } = await axios.post(verifyUrl);
    if (!data.success) {
      return res.status(400).json({ success: false, message: "reCAPTCHA failed. Please try again." });
    }
  } catch (err) {
    return res.status(400).json({ success: false, message: "reCAPTCHA verification error." });
  }

  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Check if pending user exists
    const existingPending = await PendingUser.findOne({ email });
    if (existingPending) {
      return res.status(409).json({
        success: false,
        pendingConfirmation: true,
        message: "A confirmation code has already been sent to this email. Please check your spam.",
        email: existingPending.email,
      });
    }

    // Generate random avatar
    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png?username=${firstName}`;

    const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const confirmationExpires = Date.now() + 1000 * 60 * 10; // 10 minutes

    const pendingUser = await PendingUser.create({
      firstName,
      lastName,
      email,
      password,
      confirmationCode,
      confirmationExpires,
      // You can add photoUrl if you want to keep it for later
    });

    // Email send limit logic...
    const now = new Date();
    if (pendingUser.confirmationEmailLastSentAt && pendingUser.confirmationEmailSendCount >= 3) {
      const diff = (now - pendingUser.confirmationEmailLastSentAt) / (1000 * 60); // minutes
      if (diff < 30) {
        return res.status(429).json({
          message: "You have reached the limit of 3 confirmation emails. Please try again after 30 minutes.",
        });
      } else {
        // Reset count after 30 minutes
        pendingUser.confirmationEmailSendCount = 0;
      }
    }

    // Update send count and last sent time
    pendingUser.confirmationEmailSendCount = (pendingUser.confirmationEmailSendCount || 0) + 1;
    pendingUser.confirmationEmailLastSentAt = now;
    await pendingUser.save();

    // Send confirmation email
    await sendEmailConfirmation(pendingUser.email, confirmationCode);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to register",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password",
      });
    }
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    // --- Approval check ---
    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your account is pending admin approval. Please wait for an admin to approve your account, Please check you spam category in email for more updates.",
      });
    }

    generateToken(res, user, `Welcome ${user.firstName} ${user.lastName}`);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
};

export const logout = async (_, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "logged out successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to logout",
    });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  // --- Email sending limit logic ---
  const now = new Date();
  if (user.resetEmailLastSentAt && user.resetEmailSendCount >= 3) {
    const diff = (now - user.resetEmailLastSentAt) / (1000 * 60); // minutes
    if (diff < 30) {
      return res.status(429).json({
        message: "You have reached the limit of 3 reset emails. Please try again after 30 minutes.",
      });
    } else {
      user.resetEmailSendCount = 0;
    }
  }

  // Generate token
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpire = Date.now() + 1000 * 60 * 60; // 1 hour

  // Update email send count and last sent time
  user.resetEmailSendCount = (user.resetEmailSendCount || 0) + 1;
  user.resetEmailLastSentAt = now;
  await user.save();

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl);
    res.json({ message: "Password reset link sent to your email." });
  } catch (err) {
    console.error("Error sending reset email:", err);
    res.status(500).json({ message: "Failed to send reset email. Please try again later." });
  }
};

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

export const confirmEmail = async (req, res) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const { code } = req.body;
  const pendingUser = await PendingUser.findOne({ email });

  if (!pendingUser) return res.status(404).json({ message: "No pending registration found." });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await PendingUser.deleteOne({ email });
      return res.status(400).json({ message: "A user with this email already exists. Please log in." });
    }

  if (
    pendingUser.confirmationCode === code &&
    pendingUser.confirmationExpires > Date.now()
  ) {
    const newUser = await User.create({
      firstName: pendingUser.firstName,
      lastName: pendingUser.lastName,
      email: pendingUser.email,
      password: pendingUser.password,
      // ...any other fields...
    });

      // --- UPSERT TO STREAM HERE ---
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: `${newUser.firstName} ${newUser.lastName}`,
        email: newUser.email,
      });

    await PendingUser.deleteOne({ email });
    return res.json({ success: true, message: "Email confirmed! Account created." });
  } else {
    return res.status(400).json({
      message: "Invalid or expired code. Please request a new confirmation code.",
    });
    }
  } catch (error) {
    console.error("Error in confirmEmail:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const resendConfirmation = async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const pendingUser = await PendingUser.findOne({ email });
  if (!pendingUser) return res.status(404).json({ message: "Pending user not found" });

  // --- Email sending limit logic ---
  const now = new Date();
  if (pendingUser.confirmationEmailLastSentAt && pendingUser.confirmationEmailSendCount >= 3) {
    const diff = (now - pendingUser.confirmationEmailLastSentAt) / (1000 * 60); // minutes
    if (diff < 30) {
      return res.status(429).json({
        message: "You have reached the limit of 3 confirmation emails. Please try again after 30 minutes.",
      });
    } else {
      pendingUser.confirmationEmailSendCount = 0;
    }
  }

  // Generate new code and expiry
  const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
  pendingUser.confirmationCode = confirmationCode;
  pendingUser.confirmationExpires = Date.now() + 1000 * 60 * 10; // 10 min

  // Update send count and last sent time
  pendingUser.confirmationEmailSendCount = (pendingUser.confirmationEmailSendCount || 0) + 1;
  pendingUser.confirmationEmailLastSentAt = now;
  await pendingUser.save();

  // Send email
  await sendEmailConfirmation(pendingUser.email, confirmationCode);

  res.json({ message: "Confirmation code resent. Please check your spam" });
};

export const validateResetToken = async (req, res) => {
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).json({ valid: false, message: "Invalid or expired token" });
  }
  return res.json({ valid: true, expiresAt: user.resetPasswordExpire });
};

