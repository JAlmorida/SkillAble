import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useStreamTokenQuery } from "@/features/api/chatApi";
import { useGetAuthUserQuery } from "@/features/api/authApi";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import { toast } from "sonner";
import CallButton from "@/components/chatUi/CallButton";
import { Button } from "@/components/ui/button";
import { useChatClient } from "@/components/context/ChatProvider";
import ChatLoader from "@/components/chatUi/ChatLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { chatClient, currentUser } = useChatClient();
  const { userId: targetUserId } = useParams();

  // Use RTK Query hooks directly
  const { data: authUserData, isLoading: authUserLoading } = useGetAuthUserQuery();
  const authUser = authUserData?.user;

  const { data: tokenData, isLoading: tokenLoading } = useStreamTokenQuery(undefined, {
    skip: !authUser,
  });

  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only proceed if chatClient is connected and user is set
    if (!chatClient || !chatClient.user || !currentUser || !targetUserId) return;

    const channelId = [currentUser._id, targetUserId].sort().join("-");
    const currChannel = chatClient.channel("messaging", channelId, {
      members: [currentUser._id, targetUserId],
    });

    console.time("channelWatch");
    currChannel.watch().then(() => {
      console.timeEnd("channelWatch");
      setChannel(currChannel);
    }).catch((error) => {
      console.error("Error initializing chat:", error);
    });

    // Cleanup if needed
    return () => {
      setChannel(null);
    };
  }, [chatClient, chatClient?.user, currentUser, targetUserId]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;
      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });
      toast.success("Video call link sent successfully!");
    }
  };

  if (!chatClient || !chatClient.user || !channel) {
    return <div><ChatLoader/></div>;
  }

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
            <Thread />
          </div>
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;