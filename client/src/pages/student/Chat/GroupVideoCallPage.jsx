import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetAuthUserQuery } from '@/features/api/authApi';
import { useStreamTokenQuery } from '@/features/api/chatApi';
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallParticipantsList,
  CallingState,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import PageLoader from '@/components/loadingUi/PageLoader';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const GroupVideoCallPage = () => {
  const { channelId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const { data: authUserData, isLoading: authUserLoading } = useGetAuthUserQuery();
  const authUser = authUserData?.user;
  const { data: tokenData, isLoading: tokenLoading } = useStreamTokenQuery(undefined, { skip: !authUser });

  // Use the same callId pattern as the link sent in chat
  const callId = `course-${channelId}`;

  useEffect(() => {
    let videoClient;
    let callInstance;

    const initCall = async () => {
      if (!tokenData?.token || !authUser || !callId) return;

      try {
        const user = {
          id: authUser._id,
          name: authUser.name,
          image: authUser.photoUrl,
        };

        videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        callInstance = videoClient.call('default', callId);
        await callInstance.join({ create: true });

        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.error('Error joining group call:', error);
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();

    // Cleanup: leave call and disconnect client on unmount
    return () => {
      if (callInstance) {
        callInstance.leave().catch(console.error);
      }
      if (videoClient) {
        videoClient.disconnectUser().catch(console.error);
      }
    };
    // eslint-disable-next-line
  }, [tokenData, authUser, callId]);

  if (authUserLoading || tokenLoading || isConnecting) return <PageLoader />;

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <GroupCallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Could not initialize group call. Please refresh or try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const GroupCallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();
  const { channelId } = useParams();
  const { data: authUserData } = useGetAuthUserQuery();
  const authUser = authUserData?.user;
  const callId = `course-${channelId}`; // or get from useParams if you route as /groupcall/:id

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      window.close();
    }
  }, [callingState]);

  return (
    <div className="overflow-hidden">
      <StreamTheme>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SpeakerLayout />
            <CallControls />
          </div>
          <div className="w-full md:w-1/4">
            <CallParticipantsList />
          </div>
        </div>
      </StreamTheme>
    </div>
  );
};

export default GroupVideoCallPage;