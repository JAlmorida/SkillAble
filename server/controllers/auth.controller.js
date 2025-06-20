import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { upsertStreamUser } from "../utils/stream.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, gender } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
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

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exist with this email.",
      });
    }

    // Generate random avatar
    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png?username=${name}`;

    const newUser = await User.create({
      name,
      email,
      password, // plain password, let the model hash it
      photoUrl: randomAvatar,
    });

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.name,
        image: newUser.photoUrl || "",
      });
      console.log(`Stream user created for ${newUser.name}`);
    } catch (error) {
      console.log("Error creating Stream user:", error);
    }

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
    generateToken(res, user, `Welcome back ${user.name}`);
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

export const onboard = async (req, res) => {
  try {
    const userId = req.user._id
    const { name, bio } = req.body;

    if (!name || !bio) {
      return res.status(400).json({
        message: "All fields required",
        missingFields: [!name && "name", !bio && "bio"].filter(Boolean),
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        isOnboarded: true,
      },
      { new: true }
    );

    if (!updatedUser)
      return res.status(404).json({ meesage: "User not found " });

    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        image: updatedUser.photoUrl || "",
      });
      console.log(
        `Stream user updated after onboarding for ${updatedUser.name}`
      );
    } catch (streamError) {
      console.log(
        "Error updating Stream user during onboarding:",
        streamError.message
      );
    }
    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Onboaring Error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
