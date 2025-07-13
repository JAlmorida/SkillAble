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
    // Ensure consistent user_details structure
    const streamUserData = {
      id: userData.id,
      name: userData.name || 'Anonymous User',
      user_details: {
        email: userData.email || 'noemail@example.com',
        name: userData.name || 'Anonymous User',
      }
    };
    console.log('typeof user_details:', typeof streamUserData.user_details);
    console.log('user_details:', streamUserData.user_details);

    await streamClient.upsertUsers([streamUserData]);
    return streamUserData;
  } catch (error) {
    console.error("Error upserting Stream user:", error);
    throw error; // Re-throw to handle in calling functions
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

