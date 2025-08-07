import { BellIcon, MessageCircle, School, Settings, Search, ChevronDown, ChevronUp, LayoutDashboard, BookOpen, Users, Download, Home, UserPlus, X, Check, UserCheck } from "lucide-react";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLogoutUserMutation } from "@/features/api/authApi";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import Input from "../ui/input";
import MobileNavBar from "../MobileNavBars/MobileNavBar";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetFooter,
  SheetClose,
  SheetTitle,
} from "../ui/sheet";
import { useSearchCoursesQuery } from "@/features/api/courseApi";
import NotificationsPage from "@/pages/student/User/NotificationsPage";
import { useChatClient } from "@/components/context/ChatProvider";
import { useFriendRequestsQuery, useUserFriendsQuery, useRecommendedUsersQuery, useGetUserCourseGroupChatsQuery, useSendFriendRequestMutation, useOutGoingFriendReqsQuery, useLeaveCourseGroupChatMutation } from "@/features/api/chatApi";
import { useEnrollmentNotifications } from "@/components/context/EnrollmentNotificationProvider";
import { useGetAllUsersQuery } from "@/features/api/userApi";
import AccessibilityDrawer from "@/components/controls/AccessibilityDrawer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FriendCard from "@/components/chatUi/FriendCard";
import GroupChatCard from "@/components/chatUi/GroupChatCard";
import NoFriendsFound from "@/components/chatUi/NoFriendsFound";
import NoGroupChatAvailable from "@/components/chatUi/NoGroupChatAvailable";

const Navbar = () => {
  // All hooks at the top!
  const { chatClient, unreadCount, getLastMessage, refreshChannels, addMutedChannel, removeMutedChannel, isChannelMuted, channelMapping, muteUpdateTrigger } = useChatClient();
  const prevUnreadCount = useRef(0);
  
  // Force re-render when unread count changes
  useEffect(() => {
    if (unreadCount !== prevUnreadCount.current) {
      setForceRerender(prev => prev + 1);
      prevUnreadCount.current = unreadCount;
    }
  }, [unreadCount]);

  // Force re-render when messages update
  useEffect(() => {
    if (muteUpdateTrigger > 0) {
      setForceRerender(prev => prev + 1);
    }
  }, [muteUpdateTrigger]);
  const { user } = useSelector((store) => store.auth);
  const location = useLocation();
  const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768; // Match md:hidden breakpoint
    }
    return false;
  });

  // Search bar state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [showAccessibilityDrawer, setShowAccessibilityDrawer] = useState(false);
  const [showAuthorMenu, setShowAuthorMenu] = useState(false);

  // PWA Install state
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(true);

  // Chat drawer state
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("friends");
  const [forceRerender, setForceRerender] = useState(0);

  // Friend request state
  const [isLoading, setIsLoading] = useState(false);

  const { data: searchData, isLoading: isSearchLoading } = useSearchCoursesQuery({ searchQuery });
  const suggestions = searchData?.courses || [];

  // Chat data queries
  const { data: friendsData, refetch: refetchFriends } = useUserFriendsQuery(undefined, { skip: !user?._id });
  const { data: groupChatsData, refetch: refetchGroupChats } = useGetUserCourseGroupChatsQuery(undefined, { skip: !user?._id });
  const { data: recommendedUsersData } = useRecommendedUsersQuery(undefined, { skip: !user?._id });
  const { data: friendRequests } = useFriendRequestsQuery(undefined, { skip: !user?._id });
  const { data: outgoingRequestsData, refetch: refetchOutgoingRequests } = useOutGoingFriendReqsQuery(undefined, { skip: !user?._id });
  const [sendFriendRequest] = useSendFriendRequestMutation();
  const [leaveCourseGroupChat] = useLeaveCourseGroupChatMutation();

  // Extract data
  const friends = friendsData || [];
  const groupChats = groupChatsData?.groupChats || [];
  const availableGroupChats = groupChatsData?.groupChats || [];
  const recommendedUsers = recommendedUsersData?.users || [];
  const incomingRequests = friendRequests?.incomingReqs || [];
  const outgoingRequests = outgoingRequestsData || [];
  const outgoingRequestsIds = new Set((outgoingRequests || []).map(req => req.recipient?._id));
  
  // Temporarily disable filtering to debug the issue
  const filteredFriends = friends; // Use all friends directly
  

  // Enhanced logging for debugging
  useEffect(() => {
  }, [chatClient, unreadCount, location, muteUpdateTrigger]);

  // Debug friends data
  useEffect(() => {
  }, [user, friendsData, friends, chatClient]);

  // Force re-render when mute status changes
  useEffect(() => {
    // Force re-render of chat components when mute status changes
    if (muteUpdateTrigger > 0) {
      console.log('[NavBar] Mute status changed, forcing re-render');
      // Refetch data to ensure UI is updated
      refetchFriends();
      refetchGroupChats();
      // Force re-render of chat components
      setForceRerender(prev => prev + 1);
    }
  }, [muteUpdateTrigger, refetchFriends, refetchGroupChats]);

  const searchHandler = (e) => {
    e.preventDefault();
    navigate(`/course/search?query=${searchQuery}`);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (course) => {
    navigate(`/course-detail/${course._id}`);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    const handleAppInstalled = () => {
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if ('serviceWorker' in navigator) {
        toast.info('To install this app, look for the install button in your browser\'s address bar or use the browser menu.');
      }
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      toast.success('App installed successfully!');
    }
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  useEffect(() => {
    if (isSuccess && data) {
      toast.success(data?.message || "User logged out successfully.");
      navigate("/login", { replace: true });
    }
  }, [isSuccess, data, navigate]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Match md:hidden breakpoint
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (
    location.pathname === "/login" ||
    location.pathname === "/register"
  ) {
    return null;
  }

  const handleExploreClick = (e) => {
    if (location.pathname !== "/") {
      e.preventDefault();
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById("our-courses");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  };

  const isAdminPage = location.pathname.startsWith("/admin");
  // Get chat data
  // Minimal unread detection
  const hasUnread = unreadCount > 0;

  // Handle leaving a group chat
  const handleLeaveGroupChat = async (channelId) => {
    try {
      // Use the full channelId directly since we're now using Stream's actual channel IDs
      if (!channelId) {
        return;
      }
      
      // Use backend API to leave the group chat
      await leaveCourseGroupChat(channelId).unwrap();
      
      // Filter out the left group from local state
      const updatedGroupChats = groupChats.filter(chat => chat.channelId !== channelId);
      
      // Refetch data to ensure consistency
      await refetchGroupChats();
      await refreshChannels();
      
      // Close the chat drawer after leaving
      setIsChatDrawerOpen(false);
      
      toast.success("You have left the group chat.");
    } catch (error) {
      console.error("[NavBar] Error leaving group chat:", error);
      toast.error("Failed to leave group chat.");
    }
  };

  // Mark as read logic
  const markAsRead = (friendId, isGroup = false) => {
    if (!chatClient) return;
    
    try {
      const channel = chatClient.channel("messaging", friendId);
      
      // Always initialize the channel first, then mark as read
      channel.watch().then(() => {
        if (channel.state) {
          channel.markRead().catch((err) => {
            console.error("[NavBar] Error marking initialized channel as read:", err);
          });
        }
      }).catch((err) => {
        console.error("[NavBar] Error initializing channel for markAsRead:", err);
      });
    } catch (error) {
      console.error("[NavBar] Error in markAsRead:", error);
    }
  };

  const handleSendFriendRequest = async (userId) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await sendFriendRequest(userId).unwrap();
      // Refetch outgoing requests to update the UI
      await refetchOutgoingRequests();
    } catch (error) {
      console.error('Error sending friend request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatIconClick = () => {
    // Chat icon click handler
  };

  const handleOpenChat = (chat) => {
    if (chat.type === "user") {
      navigate(`/message/${chat.id}`);
    } else {
      navigate(`/groupchat/${chat.id}`);
    }
  };

  const handleCloseChat = () => {
    // Close chat handler
  };

  const context = useEnrollmentNotifications();
  const enrollmentNotifications = context?.enrollmentNotifications || [];
  const hasNewNotifications =
    (friendRequests?.incomingReqs?.length || 0) > 0 ||
    (friendRequests?.acceptedReqs?.length || 0) > 0 ||
    enrollmentNotifications.length > 0;
  const [hasSeenNotifications, setHasSeenNotifications] = useState(false);

  useEffect(() => {
    if (hasNewNotifications) {
      setHasSeenNotifications(false);
    }
  }, [friendRequests, enrollmentNotifications]);

  // Get pending users count for admin badge
  const { data: usersData } = useGetAllUsersQuery(undefined, { 
    skip: user?.role !== "admin" 
  });
  const pendingUsersCount = usersData?.pendingUsersCount || 0;

  return (
    <div className="h-20 dark:bg-[#020817] bg-white border-b dark:border-b-gray-800 border-b-gray-200 fixed top-0 left-0 right-0 w-full z-10 md:">
      {/* Desktop NavBar */}
      {!isMobile && (
        <div className="max-w-7xl mx-auto flex items-center h-full justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Link to="/">
              <span className="text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                Skill<span className="text-blue-400">Able</span>
              </span>
              </Link>
            </div>
            <form
              onSubmit={searchHandler}
              className="relative flex items-center w-64 md:w-80 ml-2"
              autoComplete="off"
            >
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                type="text"
                className="w-full pr-12 pl-4 py-2 rounded-full border border-blue-400 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                placeholder="Search for courses"
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              />
              <button
                type="submit"
                className="absolute right-4 text-blue-400 dark:text-blue-400 hover:text-blue-500"
                tabIndex={-1}
              >
                <Search className="w-5 h-5" />
              </button>
              {showSuggestions && searchQuery && (
                <ul className="absolute left-0 right-0 top-12 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-b-xl shadow-lg max-h-96 overflow-y-auto">
                  <li className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 tracking-widest select-none">SUGGESTIONS</li>
                  <li
                    className="flex items-center gap-3 px-4 py-2 cursor-pointer bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-t-lg"
                    onMouseDown={() => {
                      navigate(`/course/search?query=${searchQuery}`);
                      setSearchQuery("");
                      setShowSuggestions(false);
                    }}
                  >
                    <Search className="w-5 h-5 text-blue-400" />
                    <span className="font-bold text-gray-900 dark:text-white text-base">{searchQuery}</span>
                  </li>
                  {suggestions.length > 0 && (
                    <li className="px-4 pt-4 pb-1 text-xs font-semibold text-gray-400 tracking-widest select-none">COURSES</li>
                  )}
                  {suggestions.length > 0 ? (
                    suggestions.map((course) => (
                      <li
                        key={course._id}
                        className="flex items-center gap-3 px-4 py-2 cursor-pointer bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg mb-1"
                        onMouseDown={() => handleSuggestionClick(course)}
                      >
                        <img src={course.courseThumbnail} alt={course.title || course.name || course.courseTitle} className="w-10 h-10 rounded object-cover border border-zinc-700" />
                        <span className="font-bold text-gray-900 dark:text-white text-base truncate ml-2">
                          {course.title || course.name || course.courseTitle || "Untitled"}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-2 text-gray-400">No courses found.</li>
                  )}
                </ul>
              )}
            </form>
          </div>
          {/* Right: Chat + Accessibility + Avatar */}
          <div className="flex items-center gap-4">
            {/* Chat Icon with Real-time Badge */}
            <Sheet>
              <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="relative rounded-full p-2 text-blue-400 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-500"
              >
                <MessageCircle style={{ width: 25, height: 25 }} />
                {unreadCount > 0 && (
                  <span 
                    key={`badge-${unreadCount}`}
                    className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#18191a] z-10" 
                    title={`${unreadCount} unread messages`}
                  />
                )}
              </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[400px] p-0">
                <SheetTitle className="sr-only">Chat</SheetTitle>
                {/* --- Chat Drawer UI directly here --- */}
                <div className="flex flex-col h-full bg-white dark:bg-[#18191a] text-black dark:text-white transition-all duration-300">
                  <div className="border-b border-zinc-800 bg-zinc-900/95 px-4 py-5 flex items-center">
                    <span className="text-xl font-bold text-white">Chats</span>
                  </div>
                  <div className="px-4 pt-2 pb-1">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
                      <TabsList className="w-full flex justify-center gap-2 bg-transparent p-2">
                        <TabsTrigger
                          value="friends"
                          className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-zinc-300"
                        >
                          Friends
                        </TabsTrigger>
                        <TabsTrigger
                          value="groupchats"
                          className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-zinc-300"
                        >
                          Group Chats
                        </TabsTrigger>
                        <TabsTrigger
                          value="recommended"
                          className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-zinc-300"
                        >
                          Recommended
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="friends" className="flex-1 overflow-y-auto">
                        <div className="flex flex-col gap-2">
                          {!friendsData ? (
                            <div className="text-center py-4">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                              <p className="text-zinc-400">Loading friends...</p>
                            </div>
                          ) : filteredFriends.length === 0 ? (
                            <div className="text-center py-4 text-zinc-400">No friends yet.</div>
                          ) : (
                            filteredFriends.map(friend => (
                              <div
                                key={`${friend._id}-${forceRerender}-${muteUpdateTrigger}`}
                                onClick={() => {
                                  markAsRead(friend._id, false);
                                  navigate(`/message/${friend._id}`);
                                  document.activeElement?.blur();
                                }}
                                style={{ cursor: "pointer" }}
                              >
                                <FriendCard
                                  friend={friend}
                                  currentUserId={chatClient?.userID}
                                  isMuted={isChannelMuted(chatClient?.userID && friend?._id ? [chatClient.userID, friend._id].sort().join('-') : null)}
                                  onToggleMute={async (channelId, newMuteStatus) => {
                                    if (newMuteStatus) {
                                      await addMutedChannel(channelId);
                                      toast.success("Chat muted");
                                    } else {
                                      await removeMutedChannel(channelId);
                                      toast.success("Chat unmuted");
                                    }
                                  }}
                                />
                              </div>
                            ))
                          )}
                        </div>
                      </TabsContent>
                      <TabsContent value="groupchats" className="flex-1 overflow-y-auto">
                        <div className="flex flex-col gap-2">
                          {!groupChatsData ? (
                            <div className="text-center py-4">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                              <p className="text-zinc-400">Loading group chats...</p>
                            </div>
                          ) : groupChats.length === 0 ? (
                            <div className="text-center py-4 text-zinc-400">No group chats yet.</div>
                          ) : (
                            groupChats.map(group => (
                              <div
                                key={`${group.channelId}-${forceRerender}-${muteUpdateTrigger}`}
                                onClick={() => {
                                  markAsRead(group.channelId, true);
                                  navigate(`/groupchat/${group.channelId}`);
                                  document.activeElement?.blur();
                                }}
                                style={{ cursor: "pointer" }}
                              >
                                <GroupChatCard
                                  group={{
                                    channelId: group.channelId,
                                    name: group.name,
                                    courseThumbnail: group.courseThumbnail,
                                  }}
                                  currentUserId={chatClient?.userID}
                                  onLeave={handleLeaveGroupChat}
                                  isMuted={isChannelMuted(group.channelId || null)}
                                  onToggleMute={async (channelId, newMuteStatus) => {
                                    if (newMuteStatus) {
                                      await addMutedChannel(channelId);
                                      toast.success("Group chat muted");
                                    } else {
                                      await removeMutedChannel(channelId);
                                      toast.success("Group chat unmuted");
                                    }
                                  }}
                                />
                              </div>
                            ))
                          )}
                        </div>
                      </TabsContent>
                      <TabsContent value="recommended" className="flex-1 overflow-y-auto p-4">
                        {(recommendedUsers || []).length === 0 ? (
                          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl shadow-lg p-6 text-center border border-primary/10">
                            <h3 className="font-semibold text-lg mb-2">No recommendations available</h3>
                            <p className="text-base-content opacity-70">
                              Check back later for new friends!
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {(recommendedUsers || []).map((user) => {
                              const hasRequestBeenSent = outgoingRequestsIds.has(user._id);
                              const hasIncomingRequest = incomingRequests.some(
                                (req) => req.sender?._id === user._id
                              );

                              let buttonText = "Send Friend Request";
                              let buttonDisabled = false;
                              let buttonVariant = "default";

                              if (hasRequestBeenSent) {
                                buttonText = "Request Sent";
                                buttonDisabled = true;
                                buttonVariant = "secondary";
                              } else if (hasIncomingRequest) {
                                buttonText = "User sent you a request";
                                buttonDisabled = true;
                                buttonVariant = "secondary";
                              }

                              return (
                                <div
                                  key={user._id}
                                  className="flex items-center gap-3 p-4 rounded-xl bg-[#232323] border border-zinc-800 shadow-sm"
                                >
                                  <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden">
                                    {user.photoUrl ? (
                                      <img
                                        src={user.photoUrl}
                                        alt={`${user.firstName} ${user.lastName}`}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-white text-lg font-bold">
                                        {user.firstName?.[0] || ""}{user.lastName?.[0] || ""}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold truncate">{user.firstName} {user.lastName}</div>
                                    {user.bio && <div className="text-sm opacity-70 mt-1">{user.bio}</div>}
                                  </div>
                                  <Button
                                    size="sm"
                                    variant={buttonVariant}
                                    className={`rounded-full p-2 transition ${buttonDisabled || isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    disabled={buttonDisabled || isLoading}
                                    onClick={() => handleSendFriendRequest(user._id)}
                                    title={buttonText}
                                  >
                                    {hasRequestBeenSent ? (
                                      <Check className="w-4 h-4 text-green-500" />
                                    ) : hasIncomingRequest ? (
                                      <UserCheck className="w-4 h-4 text-blue-500" />
                                    ) : (
                                      <UserPlus className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
                {/* --- End Chat Drawer UI --- */}
              </SheetContent>
            </Sheet>
            {/* Accessibility Drawer */}
            <AccessibilityDrawer />
            {/* Notification icon */}
            <Button
              variant="ghost"
              className="relative rounded-full p-2 text-blue-400 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-500"
              onClick={() => {
                setShowNotificationDrawer((prev) => !prev);
                setHasSeenNotifications(true);
              }}
              aria-label="Notifications"
            >
              <BellIcon style={{ width: 25, height: 25 }} />
              {hasNewNotifications && !hasSeenNotifications && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#18191a] z-10" />
              )}
            </Button>
            {/* Notification Drawer Popover */}
            {showNotificationDrawer && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotificationDrawer(false)}
                  style={{ background: "transparent" }}
                />
                <div
                  className="
                    absolute right-14
                    z-50
                    animate-fade-in
                  "
                  style={{ top: "100%" }}
                  onClick={e => e.stopPropagation()}
                >
                  <NotificationsPage />
                </div>
              </>
            )}
            {/* Avatar/Sheet */}
            {user ? (
              <Sheet>
                <SheetTrigger asChild>
                  <div className="relative">
                    <Avatar className="cursor-pointer ring-2 ring-primary ring-offset-2 transition">
                      <AvatarImage
                        src={user?.photoUrl || user?.photoUrl}
                        alt={user?.name || "User"}
                      />
                      <AvatarFallback>
                        {user?.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {user?.role === "admin" && pendingUsersCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {pendingUsersCount > 99 ? '99+' : pendingUsersCount}
                      </span>
                    )}
                  </div>
                </SheetTrigger>
                <SheetContent side="right" className="w-[320px] p-0">
                  <SheetTitle className="sr-only">User Menu</SheetTitle>
                  <div className="flex flex-col h-full">
                    <div className="flex flex-col gap-2 p-6 border-b border-border">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user?.photoUrl || user?.photoUrl} alt={user?.name || "User"} />
                          <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-lg">{user?.firstName} {user?.lastName}</div>
                          <div className="text-xs text-muted-foreground">{user?.email}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-1 p-4">
                      {/* Profile link */}
                      <SheetClose asChild>
                        <Link to="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition text-base">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={user?.photoUrl || user?.photoUrl} alt={user?.name || 'User'} />
                            <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          Profile
                        </Link>
                      </SheetClose>
                      
                      {user?.role === "author" && (
                        <>
                          <Button
                            variant="ghost"
                            className="justify-start w-full px-3 py-2 text-base flex items-center gap-2 rounded transition"
                            onClick={() => setShowAuthorMenu((prev) => !prev)}
                            aria-label="Author navigation"
                          >
                            <BookOpen className="w-5 h-5 mr-2" />
                            <span className="font-semibold text-base text-blue-700 dark:text-blue-300">Author</span>
                            <span className="ml-auto flex items-center">
                              {showAuthorMenu ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </span>
                          </Button>
                          {showAuthorMenu && (
                            <div className="pl-8 flex flex-col gap-1 mt-2">
                              <SheetClose asChild>
                                <Link
                                  to="/author/author/dashboard"
                                  className="py-2 flex items-center gap-2 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                  <BookOpen className="w-4 h-4" /> My Courses
                                </Link>
                              </SheetClose>
                              <SheetClose asChild>
                                <Link
                                  to="/author/course"
                                  className="py-2 flex items-center gap-2 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                  <BookOpen className="w-4 h-4" /> Create Course
                                </Link>
                              </SheetClose>
                            </div>
                          )}
                        </>
                      )}
                      {user?.role === "admin" && (
                        <>
                          <Button
                            variant="ghost"
                            className="justify-start w-full px-3 py-2 text-base flex items-center gap-2 rounded transition"
                            onClick={() => setShowAdminMenu((prev) => !prev)}
                            aria-label="Admin navigation"
                          >
                            <LayoutDashboard className="w-5 h-5 mr-2" />
                            <span className="font-semibold text-base text-blue-700 dark:text-blue-300">Admin</span>
                            <span className="ml-auto flex items-center">
                              {showAdminMenu ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </span>
                          </Button>
                          {showAdminMenu && (
                            <div className="pl-8 flex flex-col gap-1 mt-2">
                              <SheetClose asChild>
                                <Link
                                  to="/admin/dashboard"
                                  className="py-2 flex items-center gap-2 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                                </Link>
                              </SheetClose>
                              <SheetClose asChild>
                                <Link
                                  to="/admin/userDetails"
                                  className="py-2 flex items-center gap-2 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 relative"
                                >
                                  <Users className="w-4 h-4" /> 
                                  <span>User Management</span>
                                  {pendingUsersCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                      {pendingUsersCount > 99 ? '99+' : pendingUsersCount}
                                    </span>
                                  )}
                                </Link>
                              </SheetClose>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <SheetFooter className="mt-auto mb-4 px-6">
                    <div className="flex flex-col gap-2 w-full">
                      {/* Log out button */}
                      <SheetClose asChild>
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={async () => {
                            await logoutUser();
                            localStorage.clear();
                            sessionStorage.clear();
                            window.location.href = "/login";
                          }}
                        >
                          Log out
                        </Button>
                      </SheetClose>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            ) : (
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
            )}
          </div>
        </div>
      )}
      {/* Mobile NavBar */}
      {isMobile && (
        <MobileNavBar user={user} />
      )}
    </div>
  );
};

export default Navbar;
