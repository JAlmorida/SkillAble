import { User } from "../models/user.model.js";
import { FriendRequest } from "../models/friendRequest.model.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId)
      .select("-password")
      .populate("enrolledCourses");
    if (!user) {
      return res.status(404).json({
        message: "Profile not found",
        success: false,
      });
    }
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to load user",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { name } = req.body;
    const profilePicture = req.file;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    let photoUrl = user.photoUrl; // Keep existing photo URL by default

    // Only process photo if a new one was uploaded
    if (profilePicture) {
      // Delete old photo if it exists
      if (user.photoUrl) {
        const publicId = user.photoUrl.split("/").pop().split(".")[0];
        deleteMediaFromCloudinary(publicId);
      }

      // Upload new photo
      const cloudResponse = await uploadMedia(profilePicture.path);
      photoUrl = cloudResponse.secure_url;
    }

    const updatedData = { name, photoUrl };
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    }).select("-password");

    return res.status(200).json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

export const getRecommendedUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;

    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },
        { _id: { $nin: currentUser.friends } },
        { isOnboarded: true },
      ],
    });
    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in getRecommendedUsers controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMyFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate("friends", "name photoUrl");

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getMyFriends controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    //prevent sending req to yourself
    if (myId === recipientId) {
      return res
        .status(400)
        .json({ message: "you cant send frien request to yourself" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    //check if user is already friends
    if (recipient.friends.includes(myId)) {
      return res
        .status(400)
        .json({ message: "You are already friends with thus user" });
    }

    //check if a req already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });
    if (existingRequest) {
      return res.status(400).json({
        message: "A friend request already exists between you and this user",
      });
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });
    res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    //verify the current user is the recipient
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to accept this request",
      });
    }
    friendRequest.status = "accepted";
    await friendRequest.save();

    //add ueach user to the other's friend array
    //$addToSet: adds elements to an array only if theydo not already exist
    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    return res.status(200).json({
      message: "Friend request accepted",
    });
    
  } catch (error) {
    console.log("Error in acceptFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
