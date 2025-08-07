import { useEffect, useState } from "react";
import { useChatClient } from "@/components/context/ChatProvider";
import { useParams } from "react-router-dom";
import { Chat, Channel, Window, MessageList, MessageInput, Thread, ChannelHeader } from 'stream-chat-react';
import CallButton from "@/components/chatUi/CallButton";
import { useTheme } from "@/components/context/ThemeProvider";
import { Bell, BellOff, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";
import 'stream-chat-react/dist/css/v2/index.css';

const ChatPage = ({ targetUserId: propTargetUserId, isFullscreen = false }) => {
  const { userId } = useParams();
  const targetUserId = propTargetUserId || userId;
  const { chatClient, isChannelMuted, addMutedChannel, removeMutedChannel } = useChatClient();
  const [channel, setChannel] = useState(null);
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState(theme);
  const [isMuted, setIsMuted] = useState(false);
  const [channelId, setChannelId] = useState(null);

  useEffect(() => {
    if (channelId) {
      const muted = isChannelMuted(channelId);
      setIsMuted(muted);
    }
  }, [channelId, isChannelMuted]);

  useEffect(() => {
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const updateTheme = () => setResolvedTheme(mq.matches ? "dark" : "light");
      updateTheme();
      mq.addEventListener("change", updateTheme);
      return () => mq.removeEventListener("change", updateTheme);
    } else {
      setResolvedTheme(theme);
    }
  }, [theme]);

  const streamTheme = resolvedTheme === "dark" ? "str-chat__theme-dark" : "messaging light";

  useEffect(() => {
    if (!chatClient || !targetUserId) {
      return;
    }
    
    const newChannelId = [chatClient.userID, targetUserId].sort().join('-');
    setChannelId(newChannelId);
    
    const channel = chatClient.channel('messaging', newChannelId, {
      members: [chatClient.userID, targetUserId],
    });
    
    channel.watch().then(() => {
      setChannel(channel);
    }).catch(error => {
      console.error(`[ChatPage] Error initializing channel ${channelId}:`, error);
      
      if (error.message && error.message.includes("not found")) {
        channel.create().then(() => {
          setChannel(channel);
        }).catch(createError => {
          console.error('[ChatPage] Failed to create channel:', createError);
          setChannel(channel);
        });
      } else {
        setChannel(channel);
      }
    });
  }, [chatClient, targetUserId]);

  useEffect(() => {
    if (!channel) return;
    
    channel.markRead().catch((err) => {
      console.error("[ChatPage] Error marking channel as read:", err);
    });
  }, [channel]);

  if (!channel) {
    return (
      <div className="flex items-center justify-center h-[86vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  const handleVideoCall = async () => {
    if (!channel) return;
    const callUrl = `${window.location.origin}/call/${channel.id}`;
    await channel.sendMessage({
      text: `I've started a video call. Join us here: ${callUrl}`,
      attachments: [],
    });
  };

  const handleToggleMute = async () => {
    if (!channel || !channelId) return;

    try {
      const isCurrentlyMuted = isChannelMuted(channelId);
      
      if (isCurrentlyMuted) {
        await channel.unmute();
        removeMutedChannel(channelId);
        setIsMuted(false);
        toast.success("Notifications unmuted");
      } else {
        await channel.mute();
        addMutedChannel(channelId);
        setIsMuted(true);
        toast.success("Notifications muted");
      }
    } catch (error) {
      console.error("[ChatPage] Error toggling mute:", error);
      toast.error("Failed to update notification settings");
    }
  };



  let displayName = "Chat";
  let displayImage = "/default-avatar.png";
  if (channel && channel.state && channel.state.members) {
    const members = Object.values(channel.state.members);
    const otherMember = members.find(
      m => m.user && m.user.id !== chatClient.userID
    );
    if (otherMember && otherMember.user) {
      displayName =
        otherMember.user.name ||
        `${otherMember.user.firstName || ""} ${otherMember.user.lastName || ""}`.trim() ||
        otherMember.user.id;
      displayImage = otherMember.user.photoUrl || otherMember.user.image || "/default-avatar.png";
    }
  }

  return (
    <div className={isFullscreen ? "h-full w-full overflow-hidden" : "h-[86vh] mx-auto overflow-hidden"}>
      <Chat client={chatClient} theme={streamTheme}>
        <Channel channel={channel}>
          <Window>
            <div className="flex items-center justify-between w-full px-4 py-3 border-b border-zinc-800 bg-zinc-900">
              <div className="flex items-center gap-2">
                <img
                  src={channel.data?.image || "/default-avatar.png"}
                  alt={displayName}
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-semibold text-white">
                  {displayName}
                </span>
                {channelId && isChannelMuted(channelId) && (
                  <BellOff className="h-3 w-3 text-zinc-400" title="Notifications muted" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <CallButton onCall={handleVideoCall} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-800">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleToggleMute}>
                      {isMuted ? (
                        <>
                          <Bell className="mr-2 h-4 w-4" />
                          Unmute Notifications
                        </>
                      ) : (
                        <>
                          <BellOff className="mr-2 h-4 w-4" />
                          Mute Notifications
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <MessageList />
            <MessageInput />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;