import { StreamChat } from "stream-chat";
import { FriendRequest } from "../models/friendRequest.model.js";
import { User } from "../models/user.model.js";
import { generateStreamToken, upsertStreamUser } from "../utils/stream.js";
import { CourseEnroll } from "../models/courseEnroll.model.js";
import { Course } from "../models/course.model.js";

export const getStreamToken = async (req, res) => {
  try {
    const token = generateStreamToken(req.user._id);

    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getRecommendedUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = req.user;

    // Get users who are not the current user and not already friends
    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },
        { _id: { $nin: currentUser.friends || [] } },
        { isApproved: true }, // Only show approved users
      ],
    }).select("firstName lastName photoUrl bio");

    res.status(200).json({ users: recommendedUsers });
  } catch (error) {
    console.error("Error in getRecommendedUsers controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMyFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("friends", "firstName lastName photoUrl bio");

    res.status(200).json(user.friends || []);
  } catch (error) {
    console.error("Error in getMyFriends controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: recipientId } = req.params;

    //prevent sending req to yourself
    if (myId.toString() === recipientId) {
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
    if (friendRequest.recipient.toString() !== req.user._id.toString()) {
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

    // Create DM channel and add both users as members
    const streamClient = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET);
    
    // Get both users' details for Stream
    const [sender, recipient] = await Promise.all([
      User.findById(friendRequest.sender),
      User.findById(friendRequest.recipient)
    ]);

    // Upsert both users to Stream
    await Promise.all([
      upsertStreamUser({
        id: sender.id,
        name: sender.name,
        firstName: sender.firstName,
        lastName: sender.lastName,
        image: sender.photoUrl,
      }),
      upsertStreamUser({
        id: recipient.id,
        name: recipient.name,
        firstName: recipient.firstName,
        lastName: recipient.lastName,
        image: recipient.photoUrl,
      })
    ]);

    // Create DM channel
    const channelId = [sender.id, recipient.id].sort().join('-');
    const channel = streamClient.channel('messaging', channelId, {
      members: [sender.id, recipient.id]
    });

    await channel.create();
    
    // Add members to the channel
    await channel.addMembers([sender.id, recipient.id]);

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
      recipient: req.user._id,
      status: "pending",
    }).populate("sender", "firstName lastName photoUrl");

    const acceptedReqs = await FriendRequest.find({
      sender: req.user._id,
      status: "accepted",
    }).populate("recipient", "firstName lastName photoUrl");

    res.status(200).json({ incomingReqs, acceptedReqs });
  } catch (error) {
    console.log("Error in getPendingFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getOutgoingFriendReqs = async (req, res) => {
  try {
    const outgoingRequest = await FriendRequest.find({
      sender: req.user._id,
      status: "pending",
    }).populate("recipient", "firstName lastName photoUrl");

    res.status(200).json(outgoingRequest);
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteAcceptedFriendRequest = async (req, res) => {
  try {
    const { id } = req.params;
    // Only allow deleting accepted requests sent by the user
    await FriendRequest.deleteOne({ _id: id, status: "accepted", sender: req.user._id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete notification." });
  }
};

const streamClient = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET);

export const createCourseGroupchat = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { name } = req.body; 
    const user = req.user;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (!name) {
      return res.status(400).json({ message: "Group chat name is required" });
    }

    // Upsert Stream user
    const streamUser = {
      id: user._id.toString(),
      name: user.name,
      image: user.photoUrl || null
    };
    
    await streamClient.upsertUser(streamUser);

    // Create channel ID
    const channelId = `course-${courseId}`;
    
    // Use the provided name or fallback to course title, or a default
    const channelName = name || course.title || course.courseTitle || 'Course Group Chat';
    
    // Create or get the channel
    const channel = streamClient.channel('messaging', channelId, {
      name: channelName,
      members: [user._id.toString()],
      created_by_id: user._id.toString()
    });

    try {
      await channel.create();
      console.log("Channel created successfully:", channelId, "with name:", channelName);
    } catch (error) {
      if (error.message && error.message.includes("already exist")) {
        // Channel exists, add the user as a member
        await channel.addMembers([user._id.toString()]);
        console.log("User added to existing channel:", channelId);
      } else {
        throw error;
      }
    }

    // Ensure creator is a member (double-check)
    await channel.addMembers([user._id.toString()]);
    console.log("Creator confirmed as member:", user._id.toString());

    res.status(201).json({ 
      channelId, 
      name: channelName,
      message: "Group chat created successfully"
    });
  } catch (error) {
    console.error("Error in createCourseGroupchat:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const joinCourseGroupChat = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.user;

    // Upsert Stream user
    const streamUser = {
      id: user._id.toString(),
      name: user.name,
      image: user.photoUrl || null
    };
    
    await streamClient.upsertUser(streamUser);

    // Create channel ID
    const channelId = `course-${courseId}`;
    
    // Get the channel
    const channel = streamClient.channel('messaging', channelId);

    // Add user to the channel
    await channel.addMembers([user._id.toString()]);

    res.status(200).json({ message: "Successfully joined group chat" });
  } catch (error) {
    console.error("Error joining group chat:", error);
    res.status(500).json({ message: "Failed to join group chat" });
  }
};

// New function to add users to group chat when they enroll
export const addUserToCourseGroupChat = async (req, res) => {
  try {
    const { courseId, userId } = req.params;

    // Upsert Stream user
    const streamUser = {
      id: userId,
      name: user.name,
      image: user.photoUrl || null
    };
    
    await streamClient.upsertUser(streamUser);

    // Create channel ID
    const channelId = `course-${courseId}`;
    
    // Get the channel
    const channel = streamClient.channel('messaging', channelId);

    // Add user to the channel
    await channel.addMembers([userId]);

    res.status(200).json({ message: "User added to group chat" });
  } catch (error) {
    console.error("Error adding user to group chat:", error);
    res.status(500).json({ message: "Failed to add user to group chat" });
  }
};

export const getUserCourseGroupChats = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // Get all channels for the user
    const channels = await streamClient.queryChannels({
      members: { $in: [userId] }
    });

    // Filter for course group channels
    const courseGroupChannels = channels.filter(channel => 
      channel.id.startsWith('course-')
    );

    // Format the response
    const formattedChannels = courseGroupChannels.map(channel => {
      // Get the actual member count from the channel state
      const memberCount = channel.state?.members ? Object.keys(channel.state.members).length : 0;
      
      // Get the channel name, fallback to a default if not set
      const channelName = channel.data?.name || channel.data?.title || 'Course Group Chat';
      
      return {
        channelId: channel.id,
        name: channelName,
        memberCount: memberCount,
        lastMessage: channel.state?.last_message || null
      };
    });

    console.log("Formatted channels:", formattedChannels);

    res.status(200).json({ groupChats: formattedChannels });
  } catch (error) {
    console.error("Error getting user course group chats:", error);
    res.status(500).json({ message: "Failed to get course group chats" });
  }
};

export const leaveCourseGroupChat = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.user;

    const channelId = `course-${courseId}`;
    const channel = streamClient.channel('messaging', channelId);

    // Remove user from the channel
    await channel.removeMembers([user._id.toString()]);

    res.status(200).json({ message: "Successfully left group chat" });
  } catch (error) {
    console.error("Error leaving group chat:", error);
    res.status(500).json({ message: "Failed to leave group chat" });
  }
};

// Check if user has left a group chat
export const checkGroupChatMembership = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id.toString();

    const channelId = `course-${courseId}`;
    const channel = streamClient.channel('messaging', channelId);

    try {
      await channel.watch();
      const isMember = !!channel.state.members[userId];
      
      res.status(200).json({ 
        isMember,
        channelId,
        memberCount: Object.keys(channel.state.members || {}).length
      });
    } catch (error) {
      // If channel doesn't exist or user can't access it, they're not a member
      res.status(200).json({ 
        isMember: false,
        channelId,
        memberCount: 0
      });
    }
  } catch (error) {
    console.error("Error checking group chat membership:", error);
    res.status(500).json({ message: "Failed to check group chat membership" });
  }
};

// Rejoin a group chat
export const rejoinCourseGroupChat = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.user;

    // Upsert Stream user
    const streamUser = {
      id: user._id.toString(),
      name: user.name,
      image: user.photoUrl || null
    };
    
    await streamClient.upsertUser(streamUser);

    // Create channel ID
    const channelId = `course-${courseId}`;
    
    // Get the channel
    const channel = streamClient.channel('messaging', channelId);

    // Add user to the channel
    await channel.addMembers([user._id.toString()]);

    res.status(200).json({ message: "Successfully rejoined group chat" });
  } catch (error) {
    console.error("Error rejoining group chat:", error);
    res.status(500).json({ message: "Failed to rejoin group chat" });
  }
};
