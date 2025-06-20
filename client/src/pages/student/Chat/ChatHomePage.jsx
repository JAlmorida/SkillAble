import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FriendCard from "@/components/chatUi/FriendCard";
import NoFriendsFound from "@/components/chatUi/NoFriendsFound";
import { useOutGoingFriendReqsQuery, useRecommendedUsersQuery, useUserFriendsQuery, useSendFriendRequestMutation, useFriendRequestsQuery } from "@/features/api/chatApi";


const ChatHomePage = () => {
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());

  const { data: friends = [], isLoading: loadingFriends } = useUserFriendsQuery();
  const { data: recommendedUsers = [], isLoading: loadingUsers } = useRecommendedUsersQuery();
  const { data: outgoingFriendReqs, refetch: refetchOutgoing } = useOutGoingFriendReqsQuery();
  const [sendFriendRequest, { isLoading: isPending }] = useSendFriendRequestMutation();
  const { data: friendRequests } = useFriendRequestsQuery();
  const incomingRequests = friendRequests?.incomingReqs || [];

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
    <div className="min-h-screen flex-row">

      {/* Main Chat Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto space-y-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Friends</h2>
            <Button asChild variant="outline" size="sm">
              <Link to="/notification">
                <UsersIcon className="mr-2 size-4" />
                Friend Requests
              </Link>
            </Button>
          </div>

          {loadingFriends ? (
            <div className="flex justify-center py-12">
              <span className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : friends.length === 0 ? (
            <NoFriendsFound />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {friends.map((friend) => (
                <FriendCard key={friend._id} friend={friend} />
              ))}
            </div>
          )}

          <section>
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Meet New Learners</h2>
                  <p className="opacity-70">
                    Discover new friends to connect with!
                  </p>
                </div>
              </div>
            </div>

            {loadingUsers ? (
              <div className="flex justify-center py-12">
                <span className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : recommendedUsers.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-lg mb-2">No recommendations available</h3>
                  <p className="text-base-content opacity-70">
                    Check back later for new friends!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <Card key={user._id} className="hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full overflow-hidden w-16 h-16 bg-muted">
                            <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{user.name}</h3>
                            {user.location && (
                              <div className="flex items-center text-xs opacity-70 mt-1">
                                <MapPinIcon className="size-3 mr-1" />
                                {user.location}
                              </div>
                            )}
                          </div>
                        </div>
                        {user.bio && <p className="text-sm opacity-70">{user.bio}</p>}
                        <Button
                          className="w-full mt-2"
                          variant={buttonVariant}
                          disabled={buttonDisabled || isPending}
                          onClick={() => handleSendFriendRequest(user._id)}
                        >
                          {buttonIcon}
                          {buttonText}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ChatHomePage;