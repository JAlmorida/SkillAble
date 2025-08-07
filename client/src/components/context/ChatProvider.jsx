import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { StreamChat } from "stream-chat";
import { useGetAuthUserQuery } from "@/features/api/authApi";
import { useStreamTokenQuery } from "@/features/api/chatApi";

export const ChatContext = createContext();

export const ChatProvider = ({ user, children }) => {
  const { data: authUserData } = useGetAuthUserQuery(undefined, { skip: !!user });
  const authUser = user || authUserData?.user;
  const { data: tokenData } = useStreamTokenQuery(undefined, { skip: !authUser });
  
  const [chatClient, setChatClient] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastMessages, setLastMessages] = useState({}); 
  const [channelMapping, setChannelMapping] = useState({}); 
  const [mutedChannels, setMutedChannels] = useState(new Set()); 
  const [muteUpdateTrigger, setMuteUpdateTrigger] = useState(0); 
  const [isConnecting, setIsConnecting] = useState(false);
  const clientRef = useRef(null);
  
  // Add caching and debouncing
  const channelsCache = useRef(null);
  const lastChannelsFetch = useRef(0);
  const recalculateTimeoutRef = useRef(null);
  const CACHE_DURATION = 5000; // 5 seconds cache
  const DEBOUNCE_DELAY = 300; // 300ms debounce

  // Load muted channels from localStorage on mount
  useEffect(() => {
    if (authUser?._id) {
      try {
        const stored = localStorage.getItem(`mutedChannels_${authUser._id}`);
        if (stored) {
          const mutedSet = new Set(JSON.parse(stored));
          setMutedChannels(mutedSet);
        }
      } catch (error) {
        console.error('[ChatProvider] Error loading muted channels from localStorage:', error);
      }
    }
  }, [authUser?._id]);

  // Save muted channels to localStorage whenever it changes
  useEffect(() => {
    if (authUser?._id) {
      try {
        localStorage.setItem(`mutedChannels_${authUser._id}`, JSON.stringify(Array.from(mutedChannels)));
      } catch (error) {
        console.error('[ChatProvider] Error saving muted channels to localStorage:', error);
      }
    }
  }, [mutedChannels, authUser?._id]);

  // Cached channels fetch with rate limiting
  const getCachedChannels = async () => {
    const now = Date.now();
    
    // Return cached data if it's still valid
    if (channelsCache.current && (now - lastChannelsFetch.current) < CACHE_DURATION) {
      return channelsCache.current;
    }
    
    // Fetch fresh data
    if (!chatClient) {
      return [];
    }
    
    try {
      const channels = await chatClient.queryChannels({ members: { $in: [chatClient.userID] } });
      
      // Cache the result
      channelsCache.current = channels;
      lastChannelsFetch.current = now;
      
      return channels;
    } catch (error) {
      console.error('[ChatProvider] Error fetching channels:', error);
      return channelsCache.current || []; // Fallback to cached data
    }
  };

  // Debounced unread count recalculation
  const debouncedRecalculateUnreadCount = () => {
    if (recalculateTimeoutRef.current) {
      clearTimeout(recalculateTimeoutRef.current);
    }
    
    recalculateTimeoutRef.current = setTimeout(async () => {
      await recalculateUnreadCount();
      recalculateTimeoutRef.current = null;
    }, DEBOUNCE_DELAY);
  };

  const getInitialUnreadCount = async () => {
    if (!chatClient) {
      return;
    }
    
    try {
      // Try to use Stream's built-in countUnread first (more efficient)
      if (typeof chatClient.countUnread === "function") {
        const count = await chatClient.countUnread();
        setUnreadCount(count);
        return;
      }
      
      // Fallback to manual calculation
      const channels = await getCachedChannels();
      let totalUnread = 0;
      
      // Process channels immediately
      const newLastMessages = {};
      const newChannelMapping = {};
      const newChannelUnreadCounts = {};
      
      for (const channel of channels) {
        // Check if channel is muted using the improved function
        const channelMuted = isChannelMuted(channel.id);
        const channelUnreadCount = channel.state?.unread_count || 0;
        
        // Store individual channel unread counts
        newChannelUnreadCounts[channel.id] = channelUnreadCount;
        
        // Only count unread messages if channel is not muted
        if (channel.state && channel.state.unread_count && !channelMuted) {
          totalUnread += channel.state.unread_count;
        }
        
        // Build channel mapping for user IDs
        if (channel.state && channel.state.members) {
          const memberIds = Object.keys(channel.state.members);
          
          // Map each member to this channel ID
          memberIds.forEach(memberId => {
            newChannelMapping[memberId] = channel.id;
          });
        }
        
        // Store last message for this channel
        if (channel.state && channel.state.messages && channel.state.messages.length > 0) {
          const lastMessage = channel.state.messages[channel.state.messages.length - 1];
          
          newLastMessages[channel.id] = {
            text: lastMessage.text || 'Sent an attachment',
            senderId: lastMessage.user?.id,
            senderName: lastMessage.user?.name || lastMessage.user?.first_name,
            timestamp: lastMessage.created_at
          };
        } else {
        }
      }
      
      // Update all states at once to avoid multiple re-renders
      setLastMessages(newLastMessages);
      setChannelMapping(newChannelMapping);
      setChannelUnreadCounts(newChannelUnreadCounts);
      
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('[ChatProvider] Error getting initial unread count:', error);
      setUnreadCount(0);
      setChannelUnreadCounts({});
    }
  };

  // Function to add a channel to muted list
  const addMutedChannel = (channelId) => {
    if (!channelId) return; // Add null check
    
    setMutedChannels(prev => {
      const newSet = new Set(prev);
      // Always store without the messaging: prefix for consistency
      const normalizedChannelId = channelId.includes(':') ? channelId.split(':')[1] : channelId;
      newSet.add(normalizedChannelId);
      return newSet;
    });
    setMuteUpdateTrigger(prev => prev + 1); // Trigger re-render
    
    // Update channel unread counts to reflect muted status
    setChannelUnreadCounts(prev => {
      const updated = { ...prev };
      // Set unread count to 0 for muted channels
      if (channelId.includes(':')) {
        updated[channelId] = 0; // Full channel ID with messaging: prefix
      }
      return updated;
    });
    
    // Recalculate unread count to exclude muted channels
    recalculateUnreadCount();
  };

  // Function to remove a channel from muted list
  const removeMutedChannel = (channelId) => {
    if (!channelId) return; // Add null check
    
    setMutedChannels(prev => {
      const newSet = new Set(prev);
      // Normalize the channel ID to match how it's stored (without messaging: prefix)
      const normalizedChannelId = channelId.includes(':') ? channelId.split(':')[1] : channelId;
      newSet.delete(normalizedChannelId);
      return newSet;
    });
    setMuteUpdateTrigger(prev => prev + 1); // Trigger re-render
    
    // Update channel unread counts to reflect unmuted status
    setChannelUnreadCounts(prev => {
      const updated = { ...prev };
      // Restore actual unread count for unmuted channels
      if (channelId.includes(':')) {
        // We need to get the actual unread count from the channel
        // For now, we'll let the next message update it
        delete updated[channelId]; // Remove the forced 0 count
      }
      return updated;
    });
    
    // Recalculate unread count to include unmuted channels
    recalculateUnreadCount();
  };

  // Function to check if a channel is muted
  const isChannelMuted = (channelId) => {
    if (!channelId) return false; // Add null check
    
    // Normalize the channel ID to match how it's stored (without messaging: prefix)
    const normalizedChannelId = channelId.includes(':') ? channelId.split(':')[1] : channelId;
    const muted = mutedChannels.has(normalizedChannelId);
    
    return muted;
  };



  // Function to recalculate unread count when mute status changes
  const recalculateUnreadCount = async () => {
    if (!chatClient) return;
    
    try {
      // Use cached channels to reduce API calls
      const channels = await getCachedChannels();
      let totalUnread = 0;
      
      for (const channel of channels) {
        // Use the isChannelMuted function to properly check mute status
        const channelMuted = isChannelMuted(channel.id);
        const channelUnreadCount = channel.state?.unread_count || 0;
        
        // Only count unread messages if channel is not muted
        if (channelUnreadCount > 0 && !channelMuted) {
          totalUnread += channelUnreadCount;
        }
      }
      
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('[ChatProvider] Error recalculating unread count:', error);
    }
  };



  // Enhanced unread count logic with better error handling
  
  // Real-time event handlers - defined outside useEffect to avoid reference issues
  const handleNewMessage = useCallback(async (event) => {
    // Update last message for this channel immediately
    const channelId = event.channel?.id || event.cid;
    if (channelId) {
      const newMessage = {
        text: event.message.text || 'Sent an attachment',
        senderId: event.message.user?.id,
        senderName: event.message.user?.name || event.message.user?.first_name,
        timestamp: event.message.created_at
      };
      
      // Update last message immediately and also update channel mapping
      setLastMessages(prev => {
        const updated = {
          ...prev,
          [channelId]: newMessage
        };
        return updated;
      });
      
      // Update channel unread counts
      setChannelUnreadCounts(prev => {
        const currentCount = prev[channelId] || 0;
        const newCount = event.message.user?.id !== chatClient?.userID ? currentCount + 1 : currentCount;
        
        // Don't increment unread count if channel is muted
        const channelMuted = isChannelMuted(channelId);
        const finalCount = channelMuted ? 0 : newCount;
        
        return {
          ...prev,
          [channelId]: finalCount
        };
      });
      
      // Trigger NavBar re-render
      setMuteUpdateTrigger(prev => prev + 1);
      
      // Update channel mapping for all members in the channel
      if (event.channel?.state?.members) {
        const memberIds = Object.keys(event.channel.state.members);
        setChannelMapping(prev => {
          const updated = { ...prev };
          memberIds.forEach(memberId => {
            if (memberId !== chatClient?.userID) {
              updated[memberId] = channelId;
            }
          });
          return updated;
        });
      }
      
      // Only increment unread count if the message is from another user AND channel is not muted
      if (event.message.user?.id !== chatClient?.userID) {
        // Check if the channel is muted using the improved function
        const channelMuted = isChannelMuted(channelId);
        
        // Only increment unread count if channel is not muted
        if (!channelMuted) {
          setUnreadCount(prev => {
            const newCount = prev + 1;
            return newCount;
          });
        } else {
          // If channel is muted, prevent browser notification
          if (event.message.user?.id !== chatClient?.userID) {
            // Block the notification by preventing default behavior
            event.preventDefault && event.preventDefault();
          }
        }
      }
    }
  }, [chatClient, isChannelMuted]);

  const handleRead = useCallback((event) => {
    
    // Only decrement if the current user is the one who read the message
    if (event.user?.id === chatClient?.userID) {
      const channelId = event.channel?.id || event.cid;
      if (channelId) {
        // Check if the channel is muted using the improved function
        const channelMuted = isChannelMuted(channelId);
        
        // Update channel unread counts
        setChannelUnreadCounts(prev => {
          const currentCount = prev[channelId] || 0;
          const newCount = Math.max(0, currentCount - 1);
          return {
            ...prev,
            [channelId]: newCount
          };
        });
        
        // Only decrement unread count if channel is not muted
        if (!channelMuted) {
          setUnreadCount(prev => {
            const newCount = Math.max(0, prev - 1);
            return newCount;
          });
        }
      }
    }
  }, [chatClient, isChannelMuted]);

  // Message updated handler (for when messages are edited)
  const handleMessageUpdated = useCallback((event) => {
    const channelId = event.channel?.id || event.cid;
    if (channelId) {
      const updatedMessage = {
        text: event.message.text || 'Sent an attachment',
        senderId: event.message.user?.id,
        senderName: event.message.user?.name || event.message.user?.first_name,
        timestamp: event.message.created_at
      };
      
      setLastMessages(prev => ({
        ...prev,
        [channelId]: updatedMessage
      }));
      
      // Trigger NavBar re-render
      setMuteUpdateTrigger(prev => prev + 1);
    }
  }, []);

  // Connection recovery handler
  const handleConnectionRecovered = useCallback(() => {
    getInitialUnreadCount();
  }, []);

  // Channel updated handler (for when users are added/removed)
  const handleChannelUpdated = useCallback((event) => {
    // Re-fetch unread count when channel membership changes
    getInitialUnreadCount();
  }, []);

  // Use refs to store the latest callback functions
  const handleNewMessageRef = useRef(handleNewMessage);
  const handleReadRef = useRef(handleRead);
  const handleMessageUpdatedRef = useRef(handleMessageUpdated);
  const handleConnectionRecoveredRef = useRef(handleConnectionRecovered);
  const handleChannelUpdatedRef = useRef(handleChannelUpdated);

  // Update refs when callbacks change
  useEffect(() => {
    handleNewMessageRef.current = handleNewMessage;
    handleReadRef.current = handleRead;
    handleMessageUpdatedRef.current = handleMessageUpdated;
    handleConnectionRecoveredRef.current = handleConnectionRecovered;
    handleChannelUpdatedRef.current = handleChannelUpdated;
  }, [handleNewMessage, handleRead, handleMessageUpdated, handleConnectionRecovered, handleChannelUpdated]);



  useEffect(() => {
    if (!authUser || !tokenData?.token) {
      return;
    }
    
    if (!clientRef.current) {
      clientRef.current = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY);
    }
    const client = clientRef.current;

    if (!client.userID) {
      client.connectUser(
        { id: authUser._id, name: authUser.name, image: authUser.photoUrl },
        tokenData.token
      ).then(() => {
        setChatClient(client);
        
        // Override notification methods to block muted channels
        const originalShowNotification = client.showNotification;
        client.showNotification = (message, channelId) => {
          if (channelId && mutedChannels.size > 0 && isChannelMuted(channelId)) {
            return; // Block notification for muted channels
          }
          return originalShowNotification.call(client, message, channelId);
        };
        
        // Wait a bit for the client to be fully initialized
        setTimeout(() => {
          if (typeof client.countUnread === "function") {
            client.countUnread().then(count => {
              setUnreadCount(count);
            }).catch(err => {
              console.error('[ChatProvider] Error fetching initial unread count:', err);
            });
          }
        }, 500);
      }).catch(err => {
        console.error('[ChatProvider] Error connecting user:', err);
      });
    } else {
      setChatClient(client);
      
      // Override notification methods for existing client
      const originalShowNotification = client.showNotification;
      client.showNotification = (message, channelId) => {
        if (channelId && mutedChannels.size > 0 && isChannelMuted(channelId)) {
          return; // Block notification for muted channels
        }
        return originalShowNotification.call(client, message, channelId);
      };
      
      // Also fetch unread count for existing client
      setTimeout(() => {
        if (typeof client.countUnread === "function") {
          client.countUnread().then(count => {
            setUnreadCount(count);
          }).catch(err => {
            console.error('[ChatProvider] Error fetching unread count for existing client:', err);
          });
        }
      }, 500);
    }

    return () => {
      if (client) client.disconnectUser();
    };
  }, [authUser, tokenData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (recalculateTimeoutRef.current) {
        clearTimeout(recalculateTimeoutRef.current);
      }
    };
  }, []);

  // Handle service worker messages for mute status
  useEffect(() => {
    const handleServiceWorkerMessage = async (event) => {
      if (event.data && event.data.type) {
        switch (event.data.type) {
          case 'GET_USER_DATA':
            if (authUser?._id) {
              event.ports[0]?.postMessage({
                userId: authUser._id
              });
            }
            break;
          
          case 'CHECK_MUTE_STATUS':
            if (event.data.channelId) {
              const isMuted = mutedChannels.has(event.data.channelId);
              event.ports[0]?.postMessage({
                isMuted: isMuted
              });
            }
            break;
        }
      }
    };

    // Listen for messages from service worker
    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, [authUser?._id, mutedChannels]);

  // Add a ref to track if we've already initialized
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!chatClient || initializedRef.current) {
      return;
    }

    // Mark as initialized to prevent multiple setups
    initializedRef.current = true;

    // Use cached channels to reduce API calls
    getCachedChannels()
      .then(channels => {
        channels.forEach(channel => {
          // Only watch channels that aren't already being watched
          if (channel.state && !channel.state.isUpToDate) {
            channel.watch().then(() => {
              // Populate lastMessages with existing messages from each channel
              if (channel.state && channel.state.messages && channel.state.messages.length > 0) {
                const lastMessage = channel.state.messages[channel.state.messages.length - 1];
                const newMessage = {
                  text: lastMessage.text || 'Sent an attachment',
                  senderId: lastMessage.user?.id,
                  senderName: lastMessage.user?.name || lastMessage.user?.first_name,
                  timestamp: lastMessage.created_at
                };
                
                setLastMessages(prev => ({
                  ...prev,
                  [channel.id]: newMessage
                }));
                
                // Also update channel mapping for DM channels
                if (channel.state.members) {
                  const memberIds = Object.keys(channel.state.members);
                  memberIds.forEach(memberId => {
                    if (memberId !== chatClient.userID) {
                      setChannelMapping(prev => ({
                        ...prev,
                        [memberId]: channel.id
                      }));
                    }
                  });
                }
              }
            }).catch(err => {
              console.error(`[ChatProvider] Error watching channel ${channel.id}:`, err);
            });
          }
        });
      })
      .catch(err => console.error('[ChatProvider] Error getting cached channels:', err));

    // Register event listeners immediately
    chatClient.on('message.new', handleNewMessageRef.current);
    chatClient.on('message.read', handleReadRef.current);
    chatClient.on('message.updated', handleMessageUpdatedRef.current);
    chatClient.on('connection.recovered', handleConnectionRecoveredRef.current);
    chatClient.on('channel.updated', handleChannelUpdatedRef.current);

    // Fetch initial unread count after event handlers are set up
    getInitialUnreadCount();

    return () => {
      chatClient.off('message.new', handleNewMessageRef.current);
      chatClient.off('message.read', handleReadRef.current);
      chatClient.off('message.updated', handleMessageUpdatedRef.current);
      chatClient.off('connection.recovered', handleConnectionRecoveredRef.current);
      chatClient.off('channel.updated', handleChannelUpdatedRef.current);
    };
  }, [chatClient]);

  // Memoize getLastMessage function to ensure stable reference
  const getLastMessage = useCallback((channelId) => {
    // First try direct lookup (for group chats)
    let message = lastMessages[channelId] || null;
    
    // If not found, try to find the channel ID using the mapping (for DM chats)
    if (!message && channelMapping[channelId]) {
      const actualChannelId = channelMapping[channelId];
      message = lastMessages[actualChannelId] || null;
    }
    
    return message;
  }, [lastMessages, channelMapping]);

  // Function to get unread count for a specific channel
  const getChannelUnreadCount = useCallback(async (channelId) => {
    if (!chatClient || !channelId) return 0;
    
    try {
      const channels = await getCachedChannels();
      const channel = channels.find(c => c.id === channelId);
      
      if (channel) {
        return channel.state?.unread_count || 0;
      }
      
      return 0;
    } catch (error) {
      console.error('[ChatProvider] Error getting channel unread count:', error);
      return 0;
    }
  }, [chatClient, getCachedChannels]);

  // State to track individual channel unread counts
  const [channelUnreadCounts, setChannelUnreadCounts] = useState({});

  // Function to update channel unread counts
  const updateChannelUnreadCounts = useCallback(async () => {
    if (!chatClient) return;
    
    try {
      const channels = await getCachedChannels();
      const newChannelUnreadCounts = {};
      
      for (const channel of channels) {
        const unreadCount = channel.state?.unread_count || 0;
        newChannelUnreadCounts[channel.id] = unreadCount;
      }
      
      setChannelUnreadCounts(newChannelUnreadCounts);
    } catch (error) {
      console.error('[ChatProvider] Error updating channel unread counts:', error);
    }
  }, [chatClient, getCachedChannels]);

  return (
    <ChatContext.Provider value={{
      chatClient,
      unreadCount,
      lastMessages,
      channelMapping,
      isConnecting,
      getLastMessage,
      forceRefreshLastMessages: async () => {
        if (!chatClient) {
          return;
        }
        
        try {
          // Invalidate cache to force fresh data
          channelsCache.current = null;
          const channels = await getCachedChannels();
          const newLastMessages = {};
          const newChannelMapping = {};
          
          for (const channel of channels) {
            
            // Build channel mapping
            if (channel.state && channel.state.members) {
              const memberIds = Object.keys(channel.state.members);
              memberIds.forEach(memberId => {
                newChannelMapping[memberId] = channel.id;
              });
            }
            
            // Get last message
            if (channel.state && channel.state.messages && channel.state.messages.length > 0) {
              const lastMessage = channel.state.messages[channel.state.messages.length - 1];
              newLastMessages[channel.id] = {
                text: lastMessage.text || 'Sent an attachment',
                senderId: lastMessage.user?.id,
                senderName: lastMessage.user?.name || lastMessage.user?.first_name,
                timestamp: lastMessage.created_at
              };
            }
          }
          
          setLastMessages(newLastMessages);
          setChannelMapping(newChannelMapping);
        } catch (error) {
          console.error('[ChatProvider] Error force refreshing:', error);
        }
      },
      refreshChannels: async () => {
        if (!chatClient) {
          return;
        }
        
        try {
          // Invalidate cache to force fresh data
          channelsCache.current = null;
          const channels = await getCachedChannels();
          return channels;
        } catch (error) {
          console.error('[ChatProvider] Error refreshing channels:', error);
        }
      },
      refreshUnreadCount: async () => {
        if (!chatClient) {
          return;
        }
        
        // Use the new recalculateUnreadCount function that properly handles muted channels
        await recalculateUnreadCount();
      },
      addMutedChannel,
      removeMutedChannel,
      isChannelMuted,
      channelMapping,
      muteUpdateTrigger,
      getChannelUnreadCount,
      updateChannelUnreadCounts,
      channelUnreadCounts
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatClient = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChatClient must be used within a ChatProvider");
  return context;
};


