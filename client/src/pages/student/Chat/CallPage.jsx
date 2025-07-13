import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useStreamTokenQuery } from '@/features/api/chatApi'
import { useGetAuthUserQuery } from '@/features/api/authApi'
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from '@stream-io/video-react-sdk'
import '@stream-io/video-react-sdk/dist/css/styles.css'
import PageLoader from '@/components/loadingUi/PageLoader'

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY

const CallPage = () => {
  const { id: callId } = useParams()
  const [client, setClient] = useState(null)
  const [call, setCall] = useState(null)
  const [isConnecting, setIsConnecting] = useState(true)

  // Use RTK Query for auth user (matches your user model)
  const { data: authUserData, isLoading: authUserLoading } = useGetAuthUserQuery()
  const authUser = authUserData?.user

  // Use RTK Query for the token
  const { data: tokenData, isLoading: tokenLoading } = useStreamTokenQuery(undefined, {
    skip: !authUser,
  })

  useEffect(() => {
    const initCall = async () => {
      if (!tokenData?.token || !authUser || !callId) return

      try {
        const user = {
          id: authUser._id,         // from your user model
          name: authUser.name,      // from your user model
          image: authUser.photoUrl, // from your user model
        }

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        })

        const callInstance = videoClient.call('default', callId)

        await callInstance.join({ create: true })

        setClient(videoClient)
        setCall(callInstance)
      } catch (error) {
        console.error('Error joining call:', error)
        toast.error('Could not join the call. Please try again.')
      } finally {
        setIsConnecting(false)
      }
    }

    initCall()
    // eslint-disable-next-line
  }, [tokenData, authUser, callId])

  if (authUserLoading || tokenLoading || isConnecting) return <PageLoader />

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Could not initialize call. Please refresh or try again later.</p>
          </div>
        )}
      </div>
    </div>
  )
}

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks()
  const callingState = useCallCallingState()

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      window.close();
    }
  }, [callingState]);

  return (
    <div className='overflow-hidden'>
      <StreamTheme>
        <SpeakerLayout />
        <CallControls />
      </StreamTheme>
    </div>
  );
};

export default CallPage