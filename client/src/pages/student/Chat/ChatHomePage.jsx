import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon, BellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FriendCard from "@/components/chatUi/FriendCard";
import NoFriendsFound from "@/components/chatUi/NoFriendsFound";
import { useOutGoingFriendReqsQuery, useRecommendedUsersQuery, useUserFriendsQuery, useSendFriendRequestMutation, useFriendRequestsQuery, useGetUserCourseGroupChatsQuery } from "@/features/api/chatApi";
import NoGroupChatAvailable from "@/components/chatUi/NoGroupChatAvailable";
import GroupChatCard from "@/components/chatUi/GroupChatCard";


const ChatHomePage = () => {
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());

  const { data: friends = [], isLoading: loadingFriends } = useUserFriendsQuery();
  const { data: recommendedUsers = [], isLoading: loadingUsers } = useRecommendedUsersQuery();
  const { data: outgoingFriendReqs, refetch: refetchOutgoing } = useOutGoingFriendReqsQuery();
  const [sendFriendRequest, { isLoading: isPending }] = useSendFriendRequestMutation();
  const { data: friendRequests } = useFriendRequestsQuery();
  const incomingRequests = friendRequests?.incomingReqs || [];

  const { data: groupChatsData, isLoading: loadingGroupChats, refetch } = useGetUserCourseGroupChatsQuery();
  const allChannels = groupChatsData?.groupChats || [];

  // Defensive filter for group chats
  const groupChats = allChannels.filter(channel =>
    typeof channel.channelId === "string" &&
    channel.channelId.startsWith("course-") &&
    typeof channel.name === "string" &&
    channel.name.trim() !== ""
  );

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        if (req && req.recipient && req.recipient._id) {
          outgoingIds.add(req.recipient._id);
        }
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);

  const handleSendFriendRequest = async (userId) => {
    try {
      await sendFriendRequest(userId).unwrap();
      await refetchOutgoing(); // Refetch outgoing requests after sending
    } catch (error) {
      // Optionally handle error
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 overflow-x-hidden">
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-screen-xl mx-auto">
        <div className="space-y-12">
          {/* Friends Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2 animate-fade-in-down">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow">
              Your Friends
            </h2>
            <Button
              asChild
              variant="outline"
              size="default"
              className="flex items-center gap-2"
            >
              <Link to="/notification">
                <BellIcon className="mr-2 size-5" />
                Notification
              </Link>
            </Button>
          </div>
          {loadingFriends ? (
            <div className="flex justify-center py-12">
              {/* Animated skeletons */}
              <div className="flex gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-40 h-24 bg-zinc-200 dark:bg-zinc-700 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          ) : friends.length === 0 ? (
            <NoFriendsFound />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {friends.map((friend) => (
                <div
                  key={friend._id}
                  className="transition-transform hover:scale-105 hover:shadow-2xl duration-200"
                >
                  <FriendCard friend={friend} />
                </div>
              ))}
            </div>
          )}

          {/* Group Chats Section */}
          <section className="mb-10 mt-8 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow">
              Your Group Chats
            </h2>
            {loadingGroupChats ? (
              <div className="flex gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-40 h-24 bg-zinc-200 dark:bg-zinc-700 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : groupChats.length === 0 ? (
              <NoGroupChatAvailable />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {groupChats.map(channel => (
                  <div
                    key={channel.channelId}
                    className="transition-transform hover:scale-105 hover:shadow-2xl duration-200"
                  >
                    <GroupChatCard
                      group={{
                        channelId: channel.channelId,
                        name: channel.name,
                        courseThumbnail: channel.courseThumbnail,
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Meet New Learners Section */}
          <section className="animate-fade-in-up">
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent drop-shadow">
                  Meet New Learners
                </h2>
                <p className="opacity-70 text-base sm:text-lg">
                  Discover new friends to connect with!
                </p>
              </div>
            </div>
            {loadingUsers ? (
              <div className="flex gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-60 h-32 bg-zinc-200 dark:bg-zinc-700 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recommendedUsers.length === 0 ? (
              <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl shadow-lg p-6 text-center border border-primary/10">
                <h3 className="font-semibold text-lg mb-2">No recommendations available</h3>
                <p className="text-base-content opacity-70">
                  Check back later for new friends!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendedUsers.map((user) => {
                  const hasRequestBeenSent = outgoingRequestsIds.has(user._id);
                  const hasIncomingRequest = incomingRequests.some(
                    (req) => req.sender._id === user._id
                  );

                  let buttonText = "Send Friend Request";
                  let buttonIcon = <UserPlusIcon className="size-4 mr-2" />;
                  let buttonDisabled = false;
                  let buttonVariant = "default";

                  if (hasRequestBeenSent) {
                    buttonText = "Request Sent";
                    buttonIcon = <CheckCircleIcon className="size-4 mr-2" />;
                    buttonDisabled = true;
                    buttonVariant = "outline";
                  } else if (hasIncomingRequest) {
                    buttonText = "User sent you a request";
                    buttonIcon = <CheckCircleIcon className="size-4 mr-2" />;
                    buttonDisabled = true;
                    buttonVariant = "outline";
                  }

                  return (
                    <div
                      key={user._id}
                      className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 p-5 flex flex-col h-full group border border-primary/10"
                      style={{ minWidth: 0, maxWidth: 320 }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative w-14 aspect-square rounded-full overflow-hidden bg-muted border-4 border-primary/30 shadow-lg group-hover:scale-105 transition-transform animate-avatar-pulse">
                          <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="font-semibold truncate text-lg group-hover:text-primary transition-colors">{user.name}</h3>
                      </div>
                      {user.bio && <p className="text-xs opacity-70 mb-3">{user.bio}</p>}
                      <Button
                        className={`w-full mt-auto group-hover:scale-105 transition-transform ${
                          !buttonDisabled && !isPending
                            ? "hover:scale-105 hover:bg-primary/90"
                            : ""
                        }`}
                        variant={buttonVariant}
                        disabled={buttonDisabled || isPending}
                        onClick={() => handleSendFriendRequest(user._id)}
                      >
                        {buttonIcon}
                        {buttonText}
                      </Button>
                      <style>
                        {`
                          @keyframes avatar-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); } 50% { box-shadow: 0 0 0 8px rgba(99,102,241,0.1); } }
                          .animate-avatar-pulse { animation: avatar-pulse 2s infinite; }
                        `}
                      </style>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
      {/* Animations */}
      <style>
        {`
          @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px);} to { opacity: 1; transform: none; } }
          @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: none; } }
          @keyframes avatar-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); } 50% { box-shadow: 0 0 0 8px rgba(99,102,241,0.1); } }
          .animate-fade-in-down { animation: fade-in-down 0.8s cubic-bezier(.4,0,.2,1); }
          .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(.4,0,.2,1); }
          .animate-avatar-pulse { animation: avatar-pulse 2s infinite; }
        `}
      </style>
    </div>
  );
};

export default ChatHomePage;