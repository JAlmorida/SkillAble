import { Link } from "react-router-dom";
import React, { useState, useEffect, useMemo } from "react";
import { BellOff, MoreVertical, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";
import { useChatClient } from "@/components/context/ChatProvider";

const FriendCard = React.memo(({ friend, currentUserId, onClick, isMuted = false, onToggleMute }) => {
  const displayName = friend.name || `${friend.firstName || ""} ${friend.lastName || ""}`.trim();
  const { chatClient, refreshUnreadCount, addMutedChannel, removeMutedChannel, isChannelMuted, lastMessages, channelMapping, muteUpdateTrigger, channelUnreadCounts } = useChatClient();
  const [localMuteStatus, setLocalMuteStatus] = useState(false);
  const [actualChannelId, setActualChannelId] = useState(null);
  
  // Get the last message directly from the state
  const lastMessage = React.useMemo(() => {
    if (!actualChannelId) return null;
    
    // Direct lookup for the channel ID (now using correct Stream Chat format)
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
      if (!chatClient || !friend?._id) return;
      
      try {
        // Generate the channel ID with messaging: prefix for lastMessages lookup (preserves real-time preview)
        const channelId = `messaging:${[chatClient.userID, friend._id].sort().join('-')}`;
        setActualChannelId(channelId);
        
        // Strip messaging: prefix for consistency with mute operations
        const muteChannelId = channelId && channelId.includes(':') ? channelId.split(':')[1] : channelId;
        const channelMutedStatus = isChannelMuted(muteChannelId);
        setLocalMuteStatus(channelMutedStatus);
      } catch (error) {
        console.error('[FriendCard] Error checking mute status:', error);
        setLocalMuteStatus(false);
        setActualChannelId(null);
      }
    };
    
    checkMuteStatus();
  }, [chatClient, friend?._id, isChannelMuted, muteUpdateTrigger]);
  
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
      console.log('[FriendCard] Received isMuted prop:', isMuted, 'for friend:', friend._id);
      setLocalMuteStatus(isMuted);
    }
  }, [isMuted, friend._id]);

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

  // Get message preview with proper sender name
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

  const handleToggleMute = async () => {
    try {
      // Use the muteChannelId (without messaging: prefix) for mute operations
      const muteChannelId = actualChannelId && actualChannelId.includes(':') ? actualChannelId.split(':')[1] : actualChannelId;
      
      console.log('[FriendCard] Toggling mute for channel:', muteChannelId, 'current status:', localMuteStatus);
      
      if (localMuteStatus) {
        await removeMutedChannel(muteChannelId);
      } else {
        await addMutedChannel(muteChannelId);
      }
      setLocalMuteStatus(!localMuteStatus);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const cardContent = (
    <div className="flex items-center gap-2 p-2.5 rounded-md bg-zinc-900/90 hover:bg-zinc-800 transition-colors min-h-[48px] cursor-pointer border-b border-zinc-800 last:border-b-0">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden">
        {friend.photoUrl ? (
          <img src={friend.photoUrl} alt={displayName} className="w-full h-full object-cover" />
        ) : (
          <svg className="w-5 h-5 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" />
            <path d="M12 14c-4 0-7 2-7 4v2h14v-2c0-2-3-4-7-4z" />
          </svg>
        )}
      </div>
      
      {/* Name and last message */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate text-white">
          {displayName}
        </div>
        {lastMessage && (
          <div className="text-xs truncate text-zinc-400">
            {getMessagePreview()}
            {lastMessage.timestamp && (
              <span className="ml-1">· {formatTime(lastMessage.timestamp)}</span>
            )}
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
      
      {/* Mute/unmute dropdown */}
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
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return onClick ? (
    <div onClick={onClick}>{cardContent}</div>
  ) : (
    <Link to={`/message/${friend._id}`}>{cardContent}</Link>
  );
});

export default FriendCard;
