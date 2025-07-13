import React, { useState } from 'react'
import {
  useFriendRequestsQuery,
  useAcceptFriendRequestMutation,
} from "@/features/api/chatApi";
import { BellIcon, ClockIcon, MessageSquareIcon, UserCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NoNotificationsFound from '@/components/chatUi/NoNotificationFound';
import { useChatClient } from "@/components/context/ChatProvider";
import GCNotificationCard from '@/components/chatUi/chatNotificatio/GCNotification';
import DMNotificationCard from '@/components/chatUi/chatNotificatio/DMNotificationCard';
import { useEnrollmentNotifications } from "@/components/context/EnrollmentNotificationProvider";
import EnrollmentNotificationCard from '@/components/notification/EnrollmentNotificationCard';

const NotificationsPage = () => {
  const { data: friendRequests, isLoading, refetch } = useFriendRequestsQuery();
  const [acceptFriendRequest, { isLoading: isAccepting }] = useAcceptFriendRequestMutation();

  const incomingRequests = friendRequests?.incomingReqs || [];
  const acceptedRequests = friendRequests?.acceptedReqs || [];

  const { chatNotifications, setChatNotifications, uniqueId } = useChatClient();
  const context = useEnrollmentNotifications();
  const enrollmentNotifications = context?.enrollmentNotifications || [];
  console.log("NotificationsPage context instance ID:", uniqueId);
  console.log("Enrollment notifications:", enrollmentNotifications);

  // Group DMs by userId
  const dmGroups = chatNotifications
    .filter(n => n.type !== "group")
    .reduce((acc, notif) => {
      acc[notif.sender] = acc[notif.sender] || [];
      acc[notif.sender].push(notif);
      return acc;
    }, {});

  // Group Group Chats by channelId
  const gcGroups = chatNotifications
    .filter(n => n.type === "group")
    .reduce((acc, notif) => {
      acc[notif.channelId] = acc[notif.channelId] || [];
      acc[notif.channelId].push(notif);
      return acc;
    }, {});

  // State to control open/close for each group
  const [openDM, setOpenDM] = useState({});
  const [openGC, setOpenGC] = useState({});

  const handleClearNotification = (id) => {
    setChatNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  console.log("Rendering chatNotifications:", chatNotifications);

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

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Chat Notifications</h1>

        {/* Group Chat Notifications */}
        {Object.keys(gcGroups).length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              Group Chat Notifications
            </h2>
            <div className="space-y-3">
              {Object.entries(gcGroups).map(([channelId, notifs]) => (
                <div key={channelId} className="border rounded mb-2">
                  <div
                    className="cursor-pointer p-2 bg-gray-100 flex justify-between items-center"
                    onClick={() => setOpenGC(prev => ({ ...prev, [channelId]: !prev[channelId] }))}
                  >
                    <span>
                      {notifs[0].groupName || "Group Chat"} ({notifs.length} message{notifs.length > 1 ? "s" : ""})
                    </span>
                    <span>{openGC[channelId] ? "▲" : "▼"}</span>
                  </div>
                  {openGC[channelId] && (
                    <div>
                      {notifs.map((notif, idx) => (
                        <GCNotificationCard
                          key={notif.id}
                          group={{
                            channelId: notif.channelId,
                            name: notif.groupName || "Group Chat",
                            courseThumbnail: notif.courseThumbnail || "/default-group.png",
                            unreadCount: 1,
                            lastMessage: notif.text,
                            lastSender: notif.sender,
                            createdAt: notif.createdAt,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* DM Notifications */}
        {Object.keys(dmGroups).length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              Direct Messages
            </h2>
            <div className="space-y-3">
              {Object.entries(dmGroups).map(([userId, notifs]) => (
                <div key={userId} className="border rounded mb-2">
                  <div
                    className="cursor-pointer p-2 bg-gray-100 flex justify-between items-center"
                    onClick={() => setOpenDM(prev => ({ ...prev, [userId]: !prev[userId] }))}
                  >
                    <span>
                      {notifs[0].sender} ({notifs.length} message{notifs.length > 1 ? "s" : ""})
                    </span>
                    <span>{openDM[userId] ? "▲" : "▼"}</span>
                  </div>
                  {openDM[userId] && (
                    <div>
                      {notifs.map((notif, idx) => (
                        <DMNotificationCard
                          key={notif.id}
                          dm={{
                            userId: notif.sender,
                            name: notif.sender,
                            avatar: notif.senderAvatar || "/default-user.png",
                            unreadCount: 1,
                            lastMessage: notif.text,
                            lastSender: notif.sender,
                            createdAt: notif.createdAt,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {enrollmentNotifications.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              Course Enrollments
            </h2>
            <div className="space-y-3">
              {enrollmentNotifications.map((notification) => (
                <EnrollmentNotificationCard
                  key={notification.id}
                  enrollment={notification}
                />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default NotificationsPage;