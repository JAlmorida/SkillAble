import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StreamChat } from 'stream-chat';
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageList,
  MessageInput,
  Thread,
  Window,
} from 'stream-chat-react';
import PageLoader from '@/components/loadingUi/PageLoader';
import { useGetAuthUserQuery } from '@/features/api/authApi';
import { useStreamTokenQuery } from '@/features/api/chatApi';
import GroupchatCallButton from '@/components/chatUi/GroupchatCallButton';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const GroupChatPage = () => {
  const { channelId } = useParams();
  const { data: authUserData } = useGetAuthUserQuery();
  const authUser = authUserData?.user;
  const { data: tokenData } = useStreamTokenQuery(undefined, { skip: !authUser });

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const clientRef = useRef(null);

  useEffect(() => {
    if (!tokenData?.token || !authUser || !channelId) return;

    let isMounted = true;

    async function setup() {
      try {
        // Always create a new StreamChat instance for this page
        if (clientRef.current) {
          await clientRef.current.disconnectUser();
          clientRef.current = null;
        }
        clientRef.current = new StreamChat(STREAM_API_KEY);
        const client = clientRef.current;

        console.log("Connecting user with object:", {
          id: authUser._id.toString(),
          name: authUser.name,
          user_details: {
            email: authUser.email || "none@example.com",
            name: authUser.name || "Anonymous"
          }
        });

        await new Promise(res => setTimeout(res, 500)); // 500ms delay

        await client.connectUser(
          {
            id: authUser._id.toString(),
            name: authUser.name,
            user_details: {
              email: authUser.email || "none@example.com",
              name: authUser.name || "Anonymous"
            }
          },
          tokenData.token
        );
        const ch = client.channel('messaging', channelId);
        await ch.watch();

        if (isMounted) {
          setChatClient(client);
          setChannel(ch);
        }
      } catch (err) {
        console.error('Stream setup error:', err);
      }
    }

    setup();

    return () => {
      isMounted = false;
      if (clientRef.current) {
        clientRef.current.disconnectUser().catch(console.error);
        clientRef.current = null;
      }
    };
  }, [tokenData, authUser, channelId]);

  // Handler to send group video call link to the group chat
  const handleSendGroupVideoCallLink = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/groupcall/${channelId}`;
      channel.sendMessage({
        text: `I've started a group video call. Join here: ${callUrl}`,
      });
    }
  };

  if (!chatClient || !channel) {
    return (
      <div className="h-[93vh] flex items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <GroupchatCallButton handleVideoCall={handleSendGroupVideoCallLink} />
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

export default GroupChatPage;