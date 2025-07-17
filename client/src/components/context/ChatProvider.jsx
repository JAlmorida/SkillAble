import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { StreamChat } from "stream-chat";
import { toast } from "sonner";
import { useGetAuthUserQuery } from "@/features/api/authApi";
import { useStreamTokenQuery } from "@/features/api/chatApi";

export const ChatContext = createContext();

export const ChatProvider = ({ user, children }) => {
  const uniqueId = useRef(Math.random());
  const { data: authUserData } = useGetAuthUserQuery(undefined, { skip: !!user });
  const authUser = user || authUserData?.user;
  const { data: tokenData } = useStreamTokenQuery(undefined, { skip: !authUser });
  const [chatClient, setChatClient] = useState(null);
  const [chatNotifications, setChatNotifications] = useState([]);
  const clientRef = useRef(null);

  useEffect(() => {
    if (!authUser || !tokenData?.token) return;

    // Only create the client once
    if (!clientRef.current) {
      clientRef.current = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY);
    }
    const client = clientRef.current;

    // Connect user if not already connected
    if (!client.userID) {
      client.connectUser(
        { id: authUser._id, name: authUser.name, image: authUser.photoUrl },
        tokenData.token
      ).then(() => {
        setChatClient(client);
        // Watch all channels for this user
        const filter = { members: { $in: [authUser._id] } };
        const sort = { last_message_at: -1 };
        client.queryChannels(filter, sort).then(channels => {
          channels.forEach(channel => channel.watch());
        });
      });
    } else {
      setChatClient(client);
    }

    // Notification logic
    const handleNewMessage = (event) => {
      console.log("handleNewMessage fired!", event);
      console.log("event.user.id:", event.user.id, "authUser._id:", authUser._id);
      if (event.user.id.toString() === authUser._id.toString()) return;
      setChatNotifications(prev => [
        {
          id: event.message.id,
          channelId: event.channel_id,
          sender: event.user.name,
          senderAvatar: event.user.image,
          text: event.message.text,
          createdAt: event.message.created_at,
          type: event.channel_id.startsWith("course-") ? "group" : "dm",
          groupName: event.channel?.data?.courseTitle || event.channel?.data?.name || "Group Chat",
          courseThumbnail: event.channel?.data?.courseThumbnail || event.channel?.data?.image || "/default-group.png",
        },
        ...prev,
      ]);
    };

    client.on("message.new", handleNewMessage);

    // Global event listener for debugging
    client.on("message.new", (event) => {
      console.log("Global message.new event:", event);
      console.log("event.channel.data:", event.channel?.data);
    });

    // Only remove the event listener on unmount
    return () => {
      client.off("message.new", handleNewMessage);
    };
  }, [authUser, tokenData]);

  return (
    <ChatContext.Provider value={{
      chatClient,
      currentUser: authUser,
      chatNotifications,
      setChatNotifications,
      uniqueId: uniqueId.current
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatClient = () => useContext(ChatContext);


