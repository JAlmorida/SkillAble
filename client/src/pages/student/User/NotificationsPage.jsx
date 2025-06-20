import React from 'react'
import {
  useFriendRequestsQuery,
  useAcceptFriendRequestMutation,
} from "@/features/api/chatApi";
import { BellIcon, ClockIcon, MessageSquareIcon, UserCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NoNotificationsFound from '@/components/chatUi/NoNotificationFound';

const NotificationsPage = () => {
  const { data: friendRequests, isLoading, refetch } = useFriendRequestsQuery();
  const [acceptFriendRequest, { isLoading: isAccepting }] = useAcceptFriendRequestMutation();

  const incomingRequests = friendRequests?.incomingReqs || [];
  const acceptedRequests = friendRequests?.acceptedReqs || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Notifications</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {incomingRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <UserCheckIcon className="h-5 w-5 text-primary" />
                  Friend Requests
                  <Badge variant="default" className="ml-2">{incomingRequests.length}</Badge>
                </h2>
                <div className="space-y-3">
                  {incomingRequests.map((request) => (
                    <Card key={request._id} className="bg-muted shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full overflow-hidden w-14 h-14 bg-muted">
                            <img src={request.sender.photoUrl} alt={request.sender.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{request.sender.name}</h3>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={async () => {
                            await acceptFriendRequest(request._id);
                            refetch();
                          }}
                          disabled={isAccepting}
                        >
                          Accept
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {acceptedRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BellIcon className="h-5 w-5 text-success" />
                  New Connections
                </h2>
                <div className="space-y-3">
                  {acceptedRequests.map((notification) => {
                    if (!notification.recipient) return null; // Skip if recipient is missing
                    return (
                      <Card key={notification._id} className="bg-muted shadow-sm">
                        <CardContent className="p-4 flex items-start gap-3">
                          <div className="rounded-full overflow-hidden w-10 h-10 bg-muted mt-1">
                            <img
                              src={notification.recipient.photoUrl}
                              alt={notification.recipient.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{notification.recipient.name}</h3>
                            <p className="text-sm my-1">
                              {notification.recipient.name} accepted your friend request
                            </p>
                            <p className="text-xs flex items-center opacity-70">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              Recently
                            </p>
                          </div>
                          <Badge variant="success" className="flex items-center gap-1">
                            <MessageSquareIcon className="h-3 w-3" />
                            New Friend
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}

            {incomingRequests.length === 0 && acceptedRequests.length === 0 && (
              <NoNotificationsFound />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;