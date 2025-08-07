import React, { useEffect, useState, useRef } from "react";
import { useLogoutUserMutation } from "@/features/api/authApi";
import toast from "react-hot-toast";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetFooter, SheetClose, SheetTitle } from "../ui/sheet";
import { MessageCircle, Search, School, Settings, Bell, ChevronDown, ChevronUp, LayoutDashboard, BookOpen, Users, Download, Home, Check, UserCheck } from "lucide-react";
import Input from "../ui/input";
import { useSearchCoursesQuery } from "@/features/api/courseApi";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useChatClient } from "@/components/context/ChatProvider";
import { useFriendRequestsQuery } from "@/features/api/chatApi";
import { useEnrollmentNotifications } from "@/components/context/EnrollmentNotificationProvider";
import NotificationsPage from "@/pages/student/User/NotificationsPage";
// Import your chat drawer content (copy from desktop NavBar if needed)
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FriendCard from "@/components/chatUi/FriendCard";
import GroupChatCard from "@/components/chatUi/GroupChatCard";
import NoFriendsFound from "@/components/chatUi/NoFriendsFound";
import NoGroupChatAvailable from "@/components/chatUi/NoGroupChatAvailable";
import { useUserFriendsQuery, useRecommendedUsersQuery, useOutGoingFriendReqsQuery, useSendFriendRequestMutation, useFriendRequestsQuery as useFriendReqsQuery, useGetUserCourseGroupChatsQuery, useLeaveCourseGroupChatMutation } from "@/features/api/chatApi";
import { useGetAllUsersQuery } from "@/features/api/userApi";
import { UserPlus } from "lucide-react";
import Darkmode from "@/components/controls/Darkmode";
import FontSizeControls from "@/components/controls/FontSizeControls";
import ZoomControls from "@/components/controls/ZoomControls";
import ColorBlindFilter from "@/components/controls/ColorBlindFilter";
import ScreenReaderControls from "@/components/controls/ScreenReaderControls";
import FeedbackControls from "@/components/controls/FeedbackControls";
import { useZoom } from "@/components/context/ZoomProvider";
import { useColorBlind } from "@/components/context/ColorBlindContext";
import { useScreenReaderContext } from "@/components/context/ScreenReaderContext";
import { useFeedback } from "@/components/context/FeedbackContext";
import { useTheme } from "@/components/context/ThemeProvider";
import { useResize } from "@/components/context/ResizeContext";

const MobileNavBar = ({ user }) => {
    const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
    const navigate = useNavigate();
    const location = useLocation();

    // Search bar state
    const [searchQuery, setSearchQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const searchBarRef = useRef(null);

    // Notification logic
    const { chatClient, unreadCount, getLastMessage, refreshChannels, addMutedChannel, removeMutedChannel, isChannelMuted, channelMapping, muteUpdateTrigger } = useChatClient();
    const [hasSeenNotifications, setHasSeenNotifications] = useState(false);

    // Notification queries
    const { data: friendRequests } = useFriendRequestsQuery();
    const context = useEnrollmentNotifications();
    const enrollmentNotifications = context?.enrollmentNotifications || [];

    // Get pending users count for admin badge
    const { data: usersData } = useGetAllUsersQuery(undefined, { 
        skip: user?.role !== "admin" 
    });
    const pendingUsersCount = usersData?.pendingUsersCount || 0;

    // Calculate if there are new notifications
    const hasNewNotifications =
        (friendRequests?.incomingReqs?.length || 0) > 0 ||
        (friendRequests?.acceptedReqs?.length || 0) > 0 ||
        enrollmentNotifications.length > 0;

    useEffect(() => {
        if (hasNewNotifications) {
            setHasSeenNotifications(false);
        }
    }, [friendRequests, enrollmentNotifications]);

    // Force re-render when messages update
    useEffect(() => {
        if (muteUpdateTrigger > 0) {
            setForceRerender(prev => prev + 1);
        }
    }, [muteUpdateTrigger]);

    const { data: searchData, isLoading: isSearchLoading } = useSearchCoursesQuery({ searchQuery });
    const suggestions = searchData?.courses || [];

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
        function handleClickOutside(event) {
            if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
                setShowSearch(false);
            }
        }
        if (showSearch) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showSearch]);

    useEffect(() => {
        if (isSuccess && data) {
            toast.success(data?.message || "User logged out successfully.");
            navigate("/login", { replace: true });
        }
    }, [isSuccess, data, navigate]);



    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallButton, setShowInstallButton] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallButton(true);
        };

        const handleAppInstalled = () => {
            setShowInstallButton(false);
            setDeferredPrompt(null);
            toast.success("App installed successfully!");
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", handleAppInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            if (/iphone|ipad|ipod/i.test(window.navigator.userAgent)) {
                toast.info("To install, tap Share and then 'Add to Home Screen'.");
            } else {
                toast.info("Install not available. Try using Chrome on Android.");
            }
            return;
        }
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            toast.success("Installing app...");
        } else {
            toast.info("Install cancelled");
        }
        setDeferredPrompt(null);
        setShowInstallButton(false);
    };

    // Chat drawer state
    const [showChatDrawer, setShowChatDrawer] = useState(false);

    // Chat drawer content (copy from desktop NavBar)
    // --- Chat Drawer State and Queries ---
      const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("friends");
  const [forceRerender, setForceRerender] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showAdminMenu, setShowAdminMenu] = useState(false); 
    const { data: friends = [] } = useUserFriendsQuery();
    const { data: groupChatsData } = useGetUserCourseGroupChatsQuery();
    const allChannels = groupChatsData?.groupChats || [];
    const [groupChats, setGroupChats] = useState([]);
    
    // Temporarily disable filtering to debug the issue
    const filteredFriends = friends; // Use all friends directly
    
    // Handle leaving a group chat
    const handleLeaveGroupChat = async (channelId) => {
      try {
        // Extract courseId from channelId (channelId format: "course-{courseId}")
        const courseId = channelId?.replace('course-', '');
        
        if (!courseId) {
          console.error('[MobileNavBar] Invalid channelId format:', channelId);
          return;
        }
        
        // Use backend API to leave the group chat
        await leaveCourseGroupChat(courseId).unwrap();
        
      setGroupChats(prev => prev.filter(chat => chat.channelId !== channelId));
      
      // Also refetch the data to ensure consistency
      if (groupChatsData?.refetch) {
        groupChatsData.refetch();
      }
      
      // Refresh channels in ChatProvider
      if (refreshChannels) {
        await refreshChannels();
      }
      
      // Close the chat drawer after leaving
      setIsChatDrawerOpen(false);
        
        toast.success("You have left the group chat.");
      } catch (error) {
        console.error("[MobileNavBar] Error leaving group chat:", error);
        toast.error("Failed to leave group chat.");
      }
    };
    
    // Initialize group chats from API data
    useEffect(() => {
      if (groupChatsData?.groupChats) {
        const filteredChats = groupChatsData.groupChats.filter(channel =>
          channel.channelId && channel.name
        );
        setGroupChats(filteredChats);
      }
    }, [groupChatsData]);
    const { data: recommendedUsersData } = useRecommendedUsersQuery();
    const recommendedUsers = recommendedUsersData?.users || [];
    const { data: outgoingFriendReqs, refetch: refetchOutgoing } = useOutGoingFriendReqsQuery();
    const { data: friendReqs } = useFriendReqsQuery();
    const incomingRequests = friendReqs?.incomingReqs || [];
    const [sendFriendRequest, { isLoading: isPending }] = useSendFriendRequestMutation();
    const [leaveCourseGroupChat] = useLeaveCourseGroupChatMutation();
    const outgoingRequestsIds = new Set((outgoingFriendReqs || []).map(req => req.recipient?._id));

    const handleSendFriendRequest = async (userId) => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            await sendFriendRequest(userId).unwrap();
            await refetchOutgoing();
        } catch (error) {
            console.error('Error sending friend request:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
    const [showAccessibilitySheet, setShowAccessibilitySheet] = useState(false);
    const [showAuthorMenu, setShowAuthorMenu] = useState(false);

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-[#020817] border-b border-gray-200 dark:border-gray-800 px-2 py-4 flex flex-col gap-2 md:hidden">
            {showSearch ? (
                <div ref={searchBarRef} className="w-full flex items-center justify-center">
                    <form
                        onSubmit={searchHandler}
                        className="relative flex items-center w-full max-w-3xl mx-auto"
                        autoComplete="off"
                    >
                        <Input
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowSuggestions(true);
                            }}
                            type="text"
                            className="w-full pr-14 pl-4 py-4 rounded-full border border-blue-400 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                            placeholder="Search for courses"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-400 hover:text-blue-500"
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
            ) : (
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                            <span className="text-lg font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                                Skill<span className="text-blue-600 dark:text-blue-400">Able</span>
                            </span>
                    </div>
                    <div className="flex items-center gap-0">
                        <Button
                            variant="ghost"
                            className="rounded-full p-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            onClick={() => setShowSearch((prev) => !prev)}
                            aria-label="Show search"
                        >
                            <Search style={{ width: 22, height: 22 }} />
                        </Button>
                        {/* Chat button with notification dot and Sheet */}
                        <Sheet>
                            <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            className="relative rounded-full p-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            aria-label="Chat"
                        >
                            <MessageCircle style={{ width: 22, height: 22 }} />
                                    {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#020817]" />
                            )}
                        </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[90vw] max-w-sm p-0">
                                <SheetTitle className="sr-only">Chat</SheetTitle>
                                {/* --- Chat Drawer UI (copy from desktop NavBar) --- */}
                                <div className="flex flex-col h-full bg-white dark:bg-[#18191a] text-black dark:text-white transition-all duration-300">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
                                        <h2 className="text-xl font-bold">Chats</h2>
                                    </div>
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
                                        <TabsContent value="friends" className="flex-1 overflow-y-auto p-4">
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold mb-3 text-zinc-700 dark:text-zinc-300">Friends</h3>
                                                {filteredFriends.length === 0 ? (
                                                    <NoFriendsFound />
                                                ) : (
                                                    <div className="space-y-2">
                                                        {filteredFriends.map((friend) => (
                                                            <div
                                                                key={`${friend._id}-${forceRerender}`}
                                                                onClick={() => {
                                                                    navigate(`/message/${friend._id}`);
                                                                }}
                                                                style={{ cursor: "pointer" }}
                                                            >
                                                                <FriendCard
                                                                    friend={friend}
                                                                    currentUserId={chatClient?.userID}
                                                                    lastMessage={getLastMessage(friend._id)}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="groupchats" className="flex-1 overflow-y-auto p-4">
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold mb-3 text-zinc-700 dark:text-zinc-300">Group Chats</h3>
                                                {groupChats.length === 0 ? (
                                                    <NoGroupChatAvailable />
                                                ) : (
                                                    <div className="space-y-2">
                                                        {groupChats.map(channel => (
                                                            <div
                                                                key={`${channel.channelId}-${forceRerender}`}
                                                                onClick={() => {
                                                                    navigate(`/groupchat/${channel.channelId}`);
                                                                }}
                                                                style={{ cursor: "pointer" }}
                                                            >
                                                                <GroupChatCard
                                                                    group={{
                                                                        channelId: channel.channelId,
                                                                        name: channel.name,
                                                                        courseThumbnail: channel.courseThumbnail,
                                                                    }}
                                                                    currentUserId={chatClient?.userID}
                                                                    lastMessage={getLastMessage(channel.channelId)}
                                                                    onLeave={handleLeaveGroupChat}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
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
                                                                    className={`rounded-full p-2 transition ${buttonDisabled || isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                                                                    disabled={buttonDisabled || isPending || isLoading}
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
                                {/* --- End Chat Drawer UI --- */}
                            </SheetContent>
                        </Sheet>
                        {/* Notification button with notification dot */}
                        <Button
                            variant="ghost"
                            className="relative rounded-full p-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            onClick={() => {
                                setHasSeenNotifications(true);
                                setShowNotificationDrawer(!showNotificationDrawer);
                            }}
                            aria-label="Notifications"
                        >
                            <Bell style={{ width: 22, height: 22 }} />
                            {hasNewNotifications && !hasSeenNotifications && (
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#020817]" />
                            )}
                        </Button>
                        {/* Accessibility Drawer */}
                        <Sheet open={showAccessibilitySheet} onOpenChange={setShowAccessibilitySheet}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="rounded-full p-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                    aria-label="Accessibility Settings"
                                >
                                    <Settings style={{ width: 22, height: 22 }} />
                                </Button>
                            </SheetTrigger>
                            <SheetContent 
                                side="right" 
                                className="w-[90vw] max-w-sm p-0"
                            >
                                <SheetTitle className="sr-only">Accessibility Settings</SheetTitle>
                                <div className="flex flex-col h-full bg-white dark:bg-[#18191a] text-black dark:text-white transition-all duration-300">
                                    <div className="flex flex-col gap-2 p-6 border-b border-border">
                                        <div className="flex items-center gap-3">
                                            <Settings className="w-6 h-6 text-blue-500" />
                                            <div>
                                                <div className="font-semibold text-lg">Accessibility</div>
                                                <div className="text-xs text-muted-foreground">Customize your experience</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4">
                                        <MobileAccessibilityContent />
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>

                        {/* Notification Drawer Popover */}
                        {showNotificationDrawer && (
                            <>
                                {/* Overlay */}
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowNotificationDrawer(false)}
                                    style={{ background: "transparent" }}
                                />
                                {/* Drawer */}
                                <div
                                    className="absolute right-0 z-50 animate-fade-in"
                                    style={{ top: "100%" }}
                                    onClick={e => e.stopPropagation()}
                                >
                                    <NotificationsPage />
                                </div>
                            </>
                        )}
                        {user ? (
                            <Sheet>
                                <SheetTrigger asChild>
                                    <div className="relative">
                                        <Avatar className="cursor-pointer w-8 h-8 ring-2 ring-primary ring-offset-2 transition">
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
                                <SheetContent side="right" className="w-[90vw] max-w-xs p-0">
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
                                            {/* Home link at the top */}
                                            <SheetClose asChild>
                                                <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition text-base">
                                                    <Home className="w-5 h-5" />
                                                    Home
                                                </Link>
                                            </SheetClose>
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
                                            {/* Author Menu */}
                                            {user?.role === "author" && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        className="justify-start w-full px-3 py-2 text-base flex items-center gap-2 rounded transition"
                                                        onClick={() => setShowAuthorMenu((prev) => !prev)}
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

                                            {/* Admin Menu */}
                                            {user?.role === "admin" && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        className="justify-start w-full px-3 py-2 text-base flex items-center gap-2 rounded transition"
                                                        onClick={() => setShowAdminMenu((prev) => !prev)}
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
                                                                    <Users className="w-4 h-4" /> User Management
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
                                        <SheetFooter className="mt-auto mb-4 px-6">
                                            {/* APK Download Button */}
                                            <a
                                                href="/app-release-signed.apk"
                                                download
                                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md py-2 transition"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download APK
                                            </a>
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
                                        </SheetFooter>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        ) : (
                            <Link to="/login">
                                <Button variant="outline" size="sm">Login</Button>
                            </Link>
                        )}

                    </div>
                </div>
            )}
        </nav>
    );
};

// Mobile-specific accessibility content without Sheet wrapper
const MobileAccessibilityContent = () => {
  const [expandedIdx, setExpandedIdx] = useState(null);
  
  // Prevent sheet from closing when interacting with controls
  const handleControlClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Get enabled states and selected values for each setting
  const zoomEnabled = useZoom().isZoomEnabled;
  const colorBlindEnabled = useColorBlind().isEnabled;
  const screenReaderEnabled = useScreenReaderContext().isEnabled;
  const feedbackEnabled = useFeedback().isEnabled;
  const { theme } = useTheme();
  const { currentScale, scaleOption } = useResize();

  const themeLabels = {
    light: "Light",
    dark: "Dark",
    system: "System",
  };

  const settings = [
    {
      title: "Dark Mode",
      control: <Darkmode />,
      value: themeLabels[theme] || "System",
      enabled: true,
    },
    {
      title: "Font Size",
      control: <FontSizeControls />,
      value: scaleOption[currentScale]?.name || "Default",
      enabled: true,
    },
    {
      title: "Zoom",
      control: <ZoomControls />,
      value: zoomEnabled ? "On" : "Off",
      enabled: zoomEnabled,
    },
    {
      title: "Colorblind Filter",
      control: <ColorBlindFilter />,
      value: colorBlindEnabled ? "On" : "Off",
      enabled: colorBlindEnabled,
    },
    {
      title: "Screen Reader",
      control: <ScreenReaderControls />,
      value: screenReaderEnabled ? "On" : "Off",
      enabled: screenReaderEnabled,
    },
    {
      title: "Haptic Feedback",
      control: <FeedbackControls />,
      value: feedbackEnabled ? "On" : "Off",
      enabled: feedbackEnabled,
    },
  ];

  return (
    <div className="space-y-3" role="listbox" aria-label="Accessibility settings">
      {settings.map((setting, idx) => (
        <div
          key={idx}
          className={`bg-background border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition
            ${expandedIdx === idx ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : "hover:bg-gray-50 dark:hover:bg-gray-800"}
            cursor-pointer group focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2`}
          tabIndex={0}
          role="option"
          aria-selected={expandedIdx === idx}
          aria-expanded={expandedIdx === idx}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpandedIdx(expandedIdx === idx ? null : idx);
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="font-medium text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  {setting.title}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {setting.value}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                setting.enabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
              }`} />
              {expandedIdx === idx ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </div>
          {expandedIdx === idx && (
            <div 
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
              onClick={handleControlClick}
              onMouseDown={handleControlClick}
              onTouchStart={handleControlClick}
            >
              <div onClick={handleControlClick} onMouseDown={handleControlClick}>
                {setting.control}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MobileNavBar;