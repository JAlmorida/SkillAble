import React, { useState } from 'react'
import {
  useFriendRequestsQuery,
  useAcceptFriendRequestMutation,
} from "@/features/api/chatApi";
import { BellIcon, ClockIcon, MessageSquareIcon, UserCheckIcon, ChevronDown, ChevronUp } from "lucide-react";
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


  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="container mx-auto max-w-4xl space-y-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow">
          Notifications
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Friend Requests */}
            {incomingRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <UserCheckIcon className="h-6 w-6 text-primary" />
                  Friend Requests
                  <Badge variant="default" className="ml-2">{incomingRequests.length}</Badge>
                </h2>
                <div className="space-y-3">
                  {incomingRequests.map((request) => (
                    <div
                      key={request._id}
                      className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 p-5 flex items-center justify-between border border-primary/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-full overflow-hidden w-14 aspect-square bg-muted border-4 border-primary/30 shadow-lg">
                          <img src={request.sender.photoUrl} alt={request.sender.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{request.sender.name}</h3>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="ml-4"
                        onClick={async () => {
                          await acceptFriendRequest(request._id);
                          refetch();
                        }}
                        disabled={isAccepting}
                      >
                        Accept
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Accepted Requests */}
            {acceptedRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <BellIcon className="h-6 w-6 text-success" />
                  New Connections
                </h2>
                <div className="space-y-3">
                  {acceptedRequests.map((notification) => {
                    if (!notification.recipient) return null;
                    return (
                      <div
                        key={notification._id}
                        className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl shadow-lg p-5 flex items-start gap-3 border border-primary/10"
                      >
                        <div className="rounded-full overflow-hidden w-10 aspect-square bg-muted border-4 border-primary/30 shadow-lg mt-1">
                          <img
                            src={notification.recipient.photoUrl}
                            alt={notification.recipient.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{notification.recipient.name}</h3>
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
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* No Notifications */}
            {incomingRequests.length === 0 && acceptedRequests.length === 0 && (
              <NoNotificationsFound />
            )}
          </>
        )}

        {/* Chat Notifications */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow">
          Chat Notifications
        </h1>

        {/* Group Chat Notifications */}
        {Object.keys(gcGroups).length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Group Chat Notifications
            </h2>
            <div className="space-y-3">
              {Object.entries(gcGroups).map(([channelId, notifs]) => {
                const isOpen = openGC[channelId];
                const unreadCount = notifs.reduce((sum, n) => sum + (n.unreadCount || 0), 0);

                return (
                  <div key={channelId} className="rounded-2xl border border-primary/10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-lg mb-2">
                    {/* Trigger/Header */}
                    <div
                      className="cursor-pointer p-3 bg-gray-100 dark:bg-zinc-800 flex justify-between items-center rounded-t-2xl select-none"
                      onClick={() => setOpenGC(prev => ({ ...prev, [channelId]: !prev[channelId] }))}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary">
                          {notifs[0].groupName || "Group Chat"}
                        </span>
                        <span className="text-xs text-red-600 font-semibold">
                          ({notifs.length} message{notifs.length > 1 ? "s" : ""})
                        </span>
                        {unreadCount > 0 && (
                          <span className="ml-2 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-bold border border-red-200">
                            {unreadCount} new message{unreadCount > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-primary transition-transform duration-300" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-primary transition-transform duration-300" />
                      )}
                    </div>
                    {/* Dropdown Content with Animation */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      {isOpen && (
                        <div>
                          {notifs.map((notif) => (
                            <GCNotificationCard
                              key={notif.id}
                              group={{
                                channelId: notif.channelId,
                                name: notif.groupName || "Group Chat",
                                courseThumbnail: notif.courseThumbnail || "/default-group.png",
                                unreadCount: notif.unreadCount,
                                lastMessage: notif.text,
                                lastSender: notif.sender,
                                createdAt: notif.createdAt,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* DM Notifications */}
        {Object.keys(dmGroups).length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Direct Messages
            </h2>
            <div className="space-y-3">
              {Object.entries(dmGroups).map(([userId, notifs]) => {
                const isOpen = openDM[userId];
                const unreadCount = notifs.reduce((sum, n) => sum + (n.unreadCount || 0), 0);

                return (
                  <div key={userId} className="rounded-2xl border border-primary/10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-lg mb-2">
                    {/* Trigger/Header */}
                    <div
                      className="cursor-pointer p-3 bg-gray-100 dark:bg-zinc-800 flex justify-between items-center rounded-t-2xl select-none"
                      onClick={() => setOpenDM(prev => ({ ...prev, [userId]: !prev[userId] }))}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary">
                          {notifs[0].sender}
                        </span>
                        <span className="text-xs text-red-600 font-semibold">
                          ({notifs.length} message{notifs.length > 1 ? "s" : ""})
                        </span>
                        {unreadCount > 0 && (
                          <span className="ml-2 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-bold border border-red-200">
                            {unreadCount} new message{unreadCount > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-primary transition-transform duration-300" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-primary transition-transform duration-300" />
                      )}
                    </div>
                    {/* Dropdown Content with Animation */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      {isOpen && (
                        <div>
                          {notifs.map((notif) => (
                            <DMNotificationCard
                              key={notif.id}
                              dm={{
                                userId: notif.sender,
                                name: notif.sender,
                                avatar: notif.senderAvatar || "/default-user.png",
                                unreadCount: notif.unreadCount,
                                lastMessage: notif.text,
                                createdAt: notif.createdAt,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Enrollment Notifications */}
        {enrollmentNotifications.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
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