import React, { createContext, useContext, useEffect, useState } from "react";
import {
  useGetChatNotificationsQuery,
  useMarkAllChatNotificationsReadMutation,
} from "@/features/api/chatNotificationApi";

const ChatNotificationContext = createContext();

export const useChatNotification = () => useContext(ChatNotificationContext);

export const ChatNotificationProvider = ({ children }) => {
  const { data, refetch } = useGetChatNotificationsQuery();
  const [markAllRead] = useMarkAllChatNotificationsReadMutation();

  const unreadCount = data?.unreadCount || 0;
  const notifications = data?.notifications || [];

  const markAllAsRead = async () => {
    await markAllRead();
    refetch();
  };

  return (
    <ChatNotificationContext.Provider value={{
      unreadCount,
      notifications,
      markAllAsRead,
      refetch,
    }}>
      {children}
    </ChatNotificationContext.Provider>
  );
};
