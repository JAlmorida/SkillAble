import { StreamChat } from "stream-chat";
import dotenv from "dotenv";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("Stream API key or Secret is missing");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  try {
    let name = userData.name;
    if (!name || !name.trim()) {
      if (userData.firstName && userData.lastName) {
      name = `${userData.firstName} ${userData.lastName}`;
      } else if (userData.firstName) {
        name = userData.firstName;
      } else if (userData.lastName) {
        name = userData.lastName;
      }
    }
    if (!name || !name.trim()) {
      name = "Anonymous User";
    }
    const streamUserData = {
      id: userData.id,
      name,
      user_details: {
        email: userData.email || 'noemail@example.com',
        name,
      }
    };
    await streamClient.upsertUsers([streamUserData]);
    return streamUserData;
  } catch (error) {
    console.error("Error upserting Stream user:", error);
    throw error;
  }
};

export const generateStreamToken = (userId) => {
  try {
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.error("Error generating Stream token:", error);
    throw error; // Re-throw to handle in calling functions
  }
};

export const updateStreamChannelImage = async (channelId, imageUrl) => {
  try {
    const channel = streamClient.channel("messaging", channelId);
    await channel.update({ image: imageUrl });
    console.log("Updated Stream channel image for", channelId);
  } catch (err) {
    console.error("Failed to update Stream channel image:", err.message);
    throw err; // Let the caller handle the error if needed
  }
};

