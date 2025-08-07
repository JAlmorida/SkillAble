import React, { useState } from 'react'
import {
  useFriendRequestsQuery,
  useAcceptFriendRequestMutation,
  useDeleteAcceptedFriendRequestMutation,
} from "@/features/api/chatApi";
import { ClockIcon, UserCheckIcon, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NoNotificationsFound from '@/components/chatUi/NoNotificationFound';
import { useEnrollmentNotifications } from "@/components/context/EnrollmentNotificationProvider";
import EnrollmentNotificationCard from '@/components/notification/EnrollmentNotificationCard';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const { data: friendRequests, isLoading, refetch } = useFriendRequestsQuery();
  const [acceptFriendRequest, { isLoading: isAccepting }] = useAcceptFriendRequestMutation();
  const [deleteAcceptedFriendRequest, { isLoading: isDeleting }] = useDeleteAcceptedFriendRequestMutation();

  const incomingRequests = friendRequests?.incomingReqs || [];
  const acceptedRequests = friendRequests?.acceptedReqs || [];

  const context = useEnrollmentNotifications();
  const enrollmentNotifications = context?.enrollmentNotifications || [];

  const handleClearAccepted = async (id) => {
    try {
      await deleteAcceptedFriendRequest(id).unwrap();
      toast.success("Notification cleared successfully");
      refetch();
    } catch (err) {
      console.error("Error clearing notification:", err);
      toast.error("Failed to clear notification");
    }
  };

  const handleClearAll = async () => {
    try {
      // Clear all accepted friend requests
      const clearPromises = acceptedRequests.map(request => 
        deleteAcceptedFriendRequest(request._id).unwrap()
      );
      
      // Clear enrollment notifications
      if (context?.clearEnrollmentNotifications) {
        context.clearEnrollmentNotifications();
      }
      
      // Wait for all deletions to complete
      await Promise.all(clearPromises);
      
      toast.success("All notifications cleared successfully");
      refetch();
    } catch (err) {
      console.error("Error clearing all notifications:", err);
      toast.error("Failed to clear some notifications");
    }
  };

  const hasAnyNotifications = incomingRequests.length > 0 || 
                            acceptedRequests.length > 0 || 
                            enrollmentNotifications.length > 0;

  return (
    <div className="w-[350px] max-w-[90vw] h-[500px] bg-white dark:bg-[#18191a] text-black dark:text-white rounded-2xl shadow-2xl border border-zinc-800 flex flex-col overflow-y-auto p-4 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Notifications</h1>
        {hasAnyNotifications && (
        <Button
          variant="outline"
          size="sm"
            onClick={handleClearAll}
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
          Clear All
        </Button>
        )}
      </div>

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
                        <h3 className="font-semibold text-lg">
                          {request.sender.name
                            ? request.sender.name
                            : `${request.sender.firstName || ""} ${request.sender.lastName || ""}`}
                        </h3>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="ml-4"
                      onClick={async () => {
                        try {
                          await acceptFriendRequest(request._id).unwrap();
                          toast.success("Friend request accepted!");
                        refetch();
                        } catch (err) {
                          console.error("Error accepting friend request:", err);
                          toast.error("Failed to accept friend request");
                        }
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
                <UserCheckIcon className="h-6 w-6 text-primary" />
                Accepted Requests
                <Badge variant="default" className="ml-2">{acceptedRequests.length}</Badge>
              </h2>
              <div className="space-y-3">
                {acceptedRequests.map((notification) => {
                  if (!notification.recipient) return null;
                  return (
                    <div
                      key={notification._id}
                      className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl shadow-lg p-5 flex items-start gap-3 border border-primary/10 relative"
                    >
                      <button
                        className="absolute top-2 right-2 text-zinc-400 hover:text-red-500 transition-colors"
                        onClick={() => handleClearAccepted(notification._id)}
                        title="Clear notification"
                        disabled={isDeleting}
                    >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="rounded-full overflow-hidden w-10 aspect-square bg-muted border-4 border-primary/30 shadow-lg mt-1">
                        <img
                          src={notification.recipient.photoUrl}
                          alt={notification.recipient.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {notification.recipient.name
                            ? notification.recipient.name
                            : `${notification.recipient.firstName || ""} ${notification.recipient.lastName || ""}`}
                        </h3>
                        <p className="text-sm my-1">
                          {(notification.recipient.name
                            ? notification.recipient.name
                            : `${notification.recipient.firstName || ""} ${notification.recipient.lastName || ""}`)} accepted your friend request
                        </p>
                        <p className="text-xs flex items-center opacity-70">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          Recently
                        </p>
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
                <Badge variant="default" className="ml-2">{enrollmentNotifications.length}</Badge>
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

          {/* No Notifications */}
          {!hasAnyNotifications && (
            <NoNotificationsFound />
          )}
        </>
      )}
    </div>
  );
};

export default NotificationsPage;