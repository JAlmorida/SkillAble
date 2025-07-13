import { StreamChat } from "stream-chat";
import { FriendRequest } from "../models/friendRequest.model.js";
import { User } from "../models/user.model.js";
import { generateStreamToken, upsertStreamUser } from "../utils/stream.js";
import { CourseEnroll } from "../models/courseEnroll.model.js";
import { Course } from "../models/course.model.js";

export const getStreamToken = async (req, res) => {
  try {
    const token = generateStreamToken(req.user.id);

    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
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
        .json({ message: "you cant send friend request to yourself" });
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

    // Add each user to the other's friend array
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });
    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    // Create a reverse accepted request for the recipient if it doesn't exist
    const reverseAccepted = await FriendRequest.findOne({
      sender: friendRequest.recipient,
      recipient: friendRequest.sender,
      status: "accepted",
    });

    if (!reverseAccepted) {
      await FriendRequest.create({
        sender: friendRequest.recipient,
        recipient: friendRequest.sender,
        status: "accepted",
      });
    }

    return res.status(200).json({
      message: "Friend request accepted",
    });
  } catch (error) {
    console.log("Error in acceptFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate("sender", "name photoUrl");

    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "name photoUrl");

    res.status(200).json({ incomingReqs, acceptedReqs });
  } catch (error) {
    console.log("Error in getPendingFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getOutgoingFriendReqs = async (req, res) => {
  try {
    const outgoingRequest = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate("recipient", "name photoUrl");

    res.status(200).json(outgoingRequest);
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const streamClient = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET);
export const createCourseGroupchat = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { name } = req.body; // Remove courseThumbnail from req.body
    const user = req.user;

    // Fetch the course to get the real title and thumbnail
    const course = await Course.findById(courseId);

    if (!name) {
      return res.status(400).json({ message: "Group chat name is required" });
    }

    await upsertStreamUser({
      id: user.id,
      name: user.name,
      image: user.photoUrl,
    });

    const channelId = `course-${courseId}`;
    let channel = streamClient.channel("messaging", channelId, {
      created_by_id: user.id,
      name,
      image: course?.courseThumbnail || "", // Always use the latest course thumbnail
      courseTitle: course ? course.courseTitle : name,
      courseThumbnail: course?.courseThumbnail || "",
    });

    try {
      await channel.create();
    } catch (error) {
      if (error.message && error.message.includes("already exist")) {
        // Channel exists, update its name and image
        await channel.update({
          name,
          image: course?.courseThumbnail || "",
          courseTitle: course ? course.courseTitle : name,
          courseThumbnail: course?.courseThumbnail || "",
        });
      } else if (error.message && error.message.includes("was deleted")) {
        return res.status(400).json({
          message:
            "Your chat user was deleted from Stream. Please contact support or use a different account.",
        });
      } else {
        throw error;
      }
    }

    await channel.addMembers([user.id]);

    res.status(201).json({ channelId, name });
  } catch (error) {
    console.error("Error in createGroupChat:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const joinCourseGroupChat = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.user;
    const channelId = `course-${courseId}`;

    // Check if user is enrolled in the course
    const isEnrolled = await CourseEnroll.findOne({ courseId, userId: user.id });
    if (!isEnrolled) {
      return res.status(403).json({ message: "You must be enrolled in this course to join the group chat." });
    }

    const channel = streamClient.channel("messaging", channelId);

    // Add user as a member (idempotent, so it's safe to call even if already a member)
    await channel.addMembers([user.id]);

    // Now you can return success (no need to call channel.watch() here)
    res.status(200).json({ channelId });
  } catch (error) {
    if (error.message && error.message.includes("not found")) {
      return res.status(404).json({ message: "Group chat does not exist for this course." });
    }
    console.error("Error in joinCourseGroupChat:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserCourseGroupChats = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Fetching group chats for user:", userId);

    const channels = await streamClient.queryChannels(
      { type: "messaging", members: { $in: [userId] } },
      [{ last_message_at: -1 }]
    );
    const groupChats = channels.map(ch => {
      // Fallback for name if missing or empty
      let name = ch.data.name;
      if (!name || typeof name !== "string" || name.trim() === "") {
        // Try to use courseTitle if available, else fallback to a default
        name = ch.data.courseTitle || "Course Group Chat";
      }
      return {
        channelId: ch.id,
        name,
        courseThumbnail: ch.data.image,
        members: ch.state.members ? Object.values(ch.state.members).map(m => ({
          id: m.user_id,
          name: m.user?.name,
          email: m.user?.email,
        })) : [],
      };
    });
    res.json({ groupChats });
  } catch (error) {
    console.error("Error in getUserCourseGroupChats:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
