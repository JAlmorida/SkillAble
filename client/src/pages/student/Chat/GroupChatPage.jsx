
import { useEffect, useState } from "react";
import { useChatClient } from "@/components/context/ChatProvider";
import { useParams, useNavigate } from "react-router-dom";
import { Chat, Channel, Window, MessageList, MessageInput, Thread, ChannelHeader } from 'stream-chat-react';
import CallButton from "@/components/chatUi/CallButton";
import { useTheme } from "@/components/context/ThemeProvider";
import { LogOut, MoreVertical, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";
import { useLeaveCourseGroupChatMutation } from "@/features/api/chatApi";
import 'stream-chat-react/dist/css/v2/index.css';

const GroupChatPage = ({ channelId: propChannelId, isFullscreen = false }) => {
  const { channelId: urlChannelId } = useParams();
  const channelId = propChannelId || urlChannelId;
  const { chatClient, addMutedChannel, removeMutedChannel, isChannelMuted } = useChatClient();
  const [channel, setChannel] = useState(null);
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState(theme);
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [leaveCourseGroupChat] = useLeaveCourseGroupChatMutation();

  // Extract courseId from channelId (channelId format: "course-{courseId}")
  const courseId = channelId?.replace('course-', '');

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

  const streamTheme = resolvedTheme === 'dark' ? 'str-chat__theme-dark' : 'messaging light';

  useEffect(() => {
    
    if (!chatClient || !channelId) {
      return;
    }

    const initializeChannel = async () => {
      try {
        const channelInstance = chatClient.channel('messaging', channelId);
        await channelInstance.watch();
        setChannel(channelInstance);
      } catch (error) {
        console.error('Error initializing channel:', error);
        // If channel doesn't exist, this might be a backend issue
        if (error.message && error.message.includes("not found")) {
          // Still set the channel to show error state
          setChannel(null);
        } else {
          // For other errors, still set the channel
          setChannel(null);
        }
      }
    };

    initializeChannel();
  }, [chatClient, channelId]);

  useEffect(() => {
    if (!channel) return;
    
    // Mark as read when the group chat is opened
    channel.markRead().catch((err) => {
      console.error("[GroupChatPage] Error marking group channel as read:", err);
    });
  }, [channel]);

  if (!channel) {
    return (
      <div className="flex items-center justify-center h-[86vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading group chat...</p>
        </div>
      </div>
    );
  }

  const handleVideoCall = async () => {
    if (!channel) return;
    const callUrl = `${window.location.origin}/groupcall/${channel.id}`;
    await channel.sendMessage({
      text: `I've started a group video call. Join us here: ${callUrl}`,
      attachments: [],
    });
  };

  const handleLeaveGroup = async () => {
    if (!channel || !courseId) return;

    const confirmed = window.confirm("Are you sure you want to leave this group chat?");
    if (!confirmed) return;

    try {
      // Use backend API to leave the group chat
      await leaveCourseGroupChat(courseId).unwrap();
      
      toast.success("You have left the group chat.");
      navigate("/student/chat"); // Navigate back to the main chat page
    } catch (error) {
      console.error("[GroupChatPage] Error leaving group chat:", error);
      console.error("[GroupChatPage] Error details:", {
        message: error.message,
        stack: error.stack,
        channelId: channel?.id,
        courseId: courseId
      });
      toast.error("Failed to leave group chat.");
    }
  };

  const handleToggleMute = async () => {
    if (!channel) return;

    try {
      if (isMuted) {
        // Unmute notifications
        await channel.unmute();
        setIsMuted(false);
        removeMutedChannel(channelId);
        toast.success("Notifications unmuted");
      } else {
        // Mute notifications
        await channel.mute();
        setIsMuted(true);
        addMutedChannel(channelId);
        toast.success("Notifications muted");
      }
    } catch (error) {
      console.error("[GroupChatPage] Error toggling mute:", error);
      toast.error("Failed to update notification settings");
    }
  };

  return (
    <div className={isFullscreen ? "h-full w-full overflow-hidden" : "h-[86vh] mx-auto overflow-hidden"}>
      <Chat client={chatClient} theme={streamTheme}>
        <Channel channel={channel}>
          <Window>
            <div className="flex items-center justify-between w-full px-4 py-3 border-b border-zinc-800 bg-zinc-900">
              <div className="flex items-center gap-2">
                <img
                  src={channel.data?.image || "/default-group.png"}
                  alt={channel.data?.name || "Group Chat"}
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-semibold text-white">
                  {channel.data?.name || "Group Chat"}
                </span>
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
                    <DropdownMenuItem onClick={handleLeaveGroup} className="text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Leave Group Chat
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

export default GroupChatPage;