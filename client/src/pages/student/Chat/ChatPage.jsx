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

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { userId: targetUserId } = useParams();

  // Use RTK Query hooks directly
  const { data: authUserData, isLoading: authUserLoading } = useGetAuthUserQuery();
  const authUser = authUserData?.user;

  const { data: tokenData, isLoading: tokenLoading } = useStreamTokenQuery(undefined, {
    skip: !authUser,
  });

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser || !targetUserId) return;

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.name,
            image: authUser.photoUrl,
          },
          tokenData.token
        );

        const channelId = [authUser._id, targetUserId].sort().join("-");
        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();

    // Cleanup on unmount
    return () => {
      if (chatClient) chatClient.disconnectUser();
    };
    // eslint-disable-next-line
  }, [tokenData, authUser, targetUserId]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;
      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });
      toast.success("Video call link sent successfully!");
    }
  };

  if (
    loading ||
    tokenLoading ||
    authUserLoading ||
    !chatClient ||
    !channel
  ) {
    return (
      <div className="flex flex-col items-center justify-center overflow-hdden">
        <Skeleton className="w-16 h-16 rounded-full mb-4" />
        <div className="text-lg font-semibold mb-2">Loading chat...</div>
        <Skeleton className="w-1/2 h-8 mb-2" />
        <Skeleton className="w-1/3 h-8" />
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative h-full">
            <CallButton handleVideoCall={handleVideoCall} />
            <ChannelHeader />
            <MessageList />
            <MessageInput focus />
          </div>
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;