import React, { useEffect, useState, useRef } from "react";
import { useLogoutUserMutation } from "@/features/api/authApi";
import { toast } from "sonner";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetFooter, SheetClose } from "../ui/sheet";
import { MessageCircle, Search, School, Settings, Bell, ChevronDown, ChevronUp, LayoutDashboard, BookOpen, Users } from "lucide-react";
import Input from "../ui/input";
import { useSearchCoursesQuery } from "@/features/api/courseApi";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const MobileNavBar = ({ user }) => {
    const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
    const navigate = useNavigate();
    const location = useLocation();

    // Search bar state
    const [searchQuery, setSearchQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const searchBarRef = useRef(null);

    const { data: searchData, isLoading } = useSearchCoursesQuery({ searchQuery });
    const suggestions = searchData?.courses || [];

    const searchHandler = (e) => {
        e.preventDefault();
        // Always navigate, even if searchQuery is empty
        navigate(`/course/search?query=${searchQuery}`);
        setSearchQuery("");
        setShowSuggestions(false);
    };

    const handleSuggestionClick = (course) => {
        navigate(`/course-detail/${course._id}`);
        setSearchQuery("");
        setShowSuggestions(false);
    };

    // Close search bar when clicking outside
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

    const [showAdminMenu, setShowAdminMenu] = useState(false);

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-[#020817] border-b border-gray-200 dark:border-gray-800 px-2 py-4 flex flex-col gap-2 md:hidden">
            {showSearch ? (
                // Only show the search bar when showSearch is true
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
                // Normal navbar content here
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <Link to="/" className="flex items-center gap-1">
                            <School size={22} className="text-gray-900 dark:text-white" />
                            <span className="text-lg font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                                Skill<span className="text-blue-600 dark:text-blue-400">Able</span>
                            </span>
                        </Link>
                        <a
                            href="#our-courses"
                            className="text-blue-600 dark:text-blue-400 font-semibold text-base hover:underline transition ml-2"
                            onClick={e => {
                                e.preventDefault();
                                if (location.pathname !== "/") {
                                    navigate("/");
                                    setTimeout(() => {
                                        const el = document.getElementById("our-courses");
                                        if (el) el.scrollIntoView({ behavior: "smooth" });
                                    }, 300);
                                } else {
                                    const el = document.getElementById("our-courses");
                                    if (el) el.scrollIntoView({ behavior: "smooth" });
                                }
                            }}
                        >
                            Explore
                        </a>
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
                        <Button
                            variant="ghost"
                            className="rounded-full p-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            onClick={() => navigate("/chat")}
                            aria-label="Chat"
                        >
                            <MessageCircle style={{ width: 22, height: 22 }} />
                        </Button>
                        {user ? (
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Avatar className="cursor-pointer w-8 h-8 ring-2 ring-primary ring-offset-2 transition">
                                        <AvatarImage
                                            src={user?.photoUrl || user?.photoUrl}
                                            alt={user?.name || "User"}
                                        />
                                        <AvatarFallback>
                                            {user?.name?.[0] || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-[90vw] max-w-xs p-0">
                                    <div className="flex flex-col h-full">
                                        <div className="flex flex-col gap-2 p-6 border-b border-border">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-12 h-12">
                                                    <AvatarImage src={user?.photoUrl || user?.photoUrl} alt={user?.name || "User"} />
                                                    <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-semibold text-lg">{user?.name}</div>
                                                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-1 flex flex-col gap-1 p-4">
                                            <SheetClose asChild>
                                                <Link to="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition text-base">
                                                    <Avatar className="w-5 h-5">
                                                        <AvatarImage src={user?.photoUrl || user?.photoUrl} alt={user?.name || 'User'} />
                                                        <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
                                                    </Avatar>
                                                    Profile
                                                </Link>
                                            </SheetClose>
                                            <SheetClose asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="justify-start w-full px-3 py-2 text-base"
                                                    onClick={() => navigate("/settings")}
                                                >
                                                    <Settings className="w-5 h-5 mr-2" />
                                                    Settings
                                                </Button>
                                            </SheetClose>
                                            <SheetClose asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="justify-start w-full px-3 py-2 text-base"
                                                    onClick={() => navigate("/notification")}
                                                >
                                                    <Bell className="w-5 h-5 mr-2" />
                                                    Notifications
                                                </Button>
                                            </SheetClose>
                                            {user?.role === "admin" && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        className="justify-start w-full px-3 py-2 text-base flex items-center gap-2 rounded transition"
                                                        onClick={() => setShowAdminMenu((prev) => !prev)}
                                                        aria-label="Admin navigation"
                                                    >
                                                        <School className="w-5 h-5 mr-2" />
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
                                                            <Link
                                                                to="/admin/dashboard"
                                                                className="py-2 flex items-center gap-2 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                                                            >
                                                                <LayoutDashboard className="w-4 h-4" /> Dashboard
                                                            </Link>
                                                            <Link
                                                                to="/admin/course"
                                                                className="py-2 flex items-center gap-2 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                                                            >
                                                                <BookOpen className="w-4 h-4" /> Courses
                                                            </Link>
                                                            <Link
                                                                to="/admin/userDetails"
                                                                className="py-2 flex items-center gap-2 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                                                            >
                                                                <Users className="w-4 h-4" /> Users
                                                            </Link>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        <SheetFooter className="mt-auto mb-4 px-6">
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

export default MobileNavBar;