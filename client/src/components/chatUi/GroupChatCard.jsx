import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { LogOut, MoreVertical, BellOff, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";
import { useChatClient } from "@/components/context/ChatProvider";
import { useLeaveCourseGroupChatMutation } from "@/features/api/chatApi";

const GroupChatCard = ({ group, onClick, currentUserId, onLeave, isMuted = false, onToggleMute }) => {
  const thumbnail = group.course?.courseThumbnail || group.courseThumbnail || "/default-group.png";
  const { chatClient, refreshUnreadCount, addMutedChannel, removeMutedChannel, isChannelMuted, lastMessages, channelUnreadCounts, muteUpdateTrigger, channelMapping } = useChatClient();
  
  const [localMuteStatus, setLocalMuteStatus] = useState(false);
  const [actualChannelId, setActualChannelId] = useState(null);
  const [leaveCourseGroupChat] = useLeaveCourseGroupChatMutation();
  
  // Get the last message directly from the state
  const lastMessage = React.useMemo(() => {
    if (!actualChannelId) return null;
    
    // Direct lookup for the channel ID
    let message = lastMessages[actualChannelId] || null;
    
    return message;
  }, [actualChannelId, lastMessages, Object.keys(lastMessages).length]); // Add length to force re-render
  
  // Get unread count for this specific channel
  const channelUnreadCount = React.useMemo(() => {
    if (!actualChannelId) return 0;
    return channelUnreadCounts[actualChannelId] || 0;
  }, [actualChannelId, channelUnreadCounts]);
  
  // Update local mute status when prop changes or when ChatProvider mute state changes
  useEffect(() => {
    const checkMuteStatus = () => {
      if (!chatClient || !group?.channelId) return;
      
      try {
        // Generate the channel ID with messaging: prefix for lastMessages lookup (like FriendCard)
        const channelId = `messaging:${group.channelId}`;
        setActualChannelId(channelId);
        
        // Use ChatProvider's local mute tracking with channel ID
        const channelMutedStatus = isChannelMuted(group.channelId);
        setLocalMuteStatus(channelMutedStatus);
      } catch (error) {
        console.error('[GroupChatCard] Error checking mute status:', error);
        setLocalMuteStatus(false);
        setActualChannelId(null);
      }
    };
    
    checkMuteStatus();
  }, [chatClient, group?.channelId, isChannelMuted, muteUpdateTrigger]);
  
  // Check mute status when component mounts or muteUpdateTrigger changes
  useEffect(() => {
    const actualStatus = isChannelMuted(actualChannelId);
    if (localMuteStatus !== actualStatus) {
      setLocalMuteStatus(actualStatus);
    }
  }, [muteUpdateTrigger, isChannelMuted, actualChannelId, localMuteStatus]);
  
  // Use the isMuted prop from NavBar to override internal state
  useEffect(() => {
    if (isMuted !== undefined) {
      console.log('[GroupChatCard] Received isMuted prop:', isMuted, 'for group:', group.channelId);
      setLocalMuteStatus(isMuted);
    }
  }, [isMuted, group.channelId]);
  
  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getMessagePreview = () => {
    if (!lastMessage) return '';
    
    if (lastMessage.senderId === currentUserId) {
      return 'You: ' + (lastMessage.text || 'Sent an attachment');
    } else {
      // Show sender's first name if available, otherwise fallback
      const senderName = lastMessage.senderName || lastMessage.senderId || 'Someone';
      return `${senderName}: ${lastMessage.text || 'Sent an attachment'}`;
    }
  };

  const handleLeaveGroup = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!chatClient || !group.channelId) return;
    
    const confirmed = window.confirm("Are you sure you want to leave this group chat?");
    if (!confirmed) return;

    try {
      await leaveCourseGroupChat(group.channelId).unwrap();
      
      toast.success("You have left the group chat.");
      
      // Call the onLeave callback if provided
      if (onLeave) {
        onLeave(group.channelId);
      }
      
      // Close the drawer if we're in a drawer context
      if (onClick) {
        // This will close the drawer
        onClick();
      }
    } catch (error) {
      console.error("[GroupChatCard] Error leaving group chat:", error);
      toast.error("Failed to leave group chat.");
    }
  };

  const handleToggleMute = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!chatClient) return;

    try {
      const newMuteStatus = !localMuteStatus;
      
      // Use the group.channelId directly (without messaging: prefix) for mute operations
      const muteChannelId = group.channelId;
      
      console.log('[GroupChatCard] Toggling mute for channel:', muteChannelId, 'current status:', localMuteStatus, 'new status:', newMuteStatus);
      
      if (newMuteStatus) {
        addMutedChannel(muteChannelId);
        setLocalMuteStatus(true);
        toast.success("Notifications muted");
      } else {
        removeMutedChannel(muteChannelId);
        setLocalMuteStatus(false);
        toast.success("Notifications unmuted");
      }
      
      // Call the onToggleMute callback if provided
      if (onToggleMute) {
        onToggleMute(muteChannelId, newMuteStatus);
      }
      
      // Refresh unread count to update navbar notification
      if (refreshUnreadCount) {
        setTimeout(() => {
          refreshUnreadCount();
        }, 1000);
      }
    } catch (error) {
      console.error("[GroupChatCard] Error toggling mute:", error);
      toast.error("Failed to update notification settings");
    }
  };
  
  const cardContent = (
    <div key={`${actualChannelId || group.channelId}-${Object.keys(lastMessages).length}`} className="flex items-center gap-2 p-2.5 rounded-md bg-zinc-900/90 hover:bg-zinc-800 transition-colors min-h-[48px] cursor-pointer border-b border-zinc-800 last:border-b-0">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden">
        <img src={thumbnail} alt={group.name} className="w-full h-full object-cover" />
      </div>
      {/* Name and last message */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate text-white">
          {group.name}
        </div>
        {lastMessage && (
          <div className="text-xs truncate text-zinc-400">
            {getMessagePreview()}
          </div>
            )}
        {lastMessage?.timestamp && (
          <div className="text-xs text-zinc-500 mt-1">
            {formatTime(lastMessage.timestamp)}
          </div>
        )}
      </div>
      {/* Notification badge */}
      {channelUnreadCount > 0 && !localMuteStatus && (
        <div className="flex items-center justify-center w-6 h-6">
          <span className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-medium">
              {channelUnreadCount > 99 ? '99+' : channelUnreadCount}
            </span>
          </span>
        </div>
      )}
      {/* Mute icon on the right */}
      {localMuteStatus && (
        <div className="flex items-center justify-center w-6 h-6">
          <BellOff className="h-3 w-3 text-zinc-400" title="Notifications muted" />
        </div>
      )}
      {/* Leave group dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-zinc-400 hover:text-zinc-300"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleToggleMute}>
            {localMuteStatus ? (
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
  );

  return (
    <div className="group">
      {onClick ? (
        <div onClick={onClick} className="cursor-pointer">
          {cardContent}
        </div>
      ) : (
        <Link to={`/groupchat/${group.channelId}`} className="block">
          {cardContent}
        </Link>
      )}
    </div>
  );
}

GroupChatCard.displayName = "GroupChatCard";

export default GroupChatCard;