import { BellIcon, MessageCircle, School, Settings, Search, ChevronDown, ChevronUp, LayoutDashboard, BookOpen, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLogoutUserMutation } from "@/features/api/authApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import Input from "../ui/input";
import MobileNavBar from "../MobileNavBars/MobileNavBar";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetClose,
} from "../ui/sheet";
import { useSearchCoursesQuery } from "@/features/api/courseApi";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 500);

  // Search bar state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Move these hooks to the top, before any conditional returns
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const { data: suggestions = [] } = useSearchCoursesQuery(searchQuery, {
    skip: !searchQuery,
  });

  const searchHandler = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate(`/course/search?query=${searchQuery}`);
    }
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (course) => {
    navigate(`/course-detail/${course._id}`);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  useEffect(() => {
    if (isSuccess && data) {
      toast.success(data?.message || "User logged out successfully.");
      navigate("/login", { replace: true });
    }
  }, [isSuccess, data, navigate]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 500);
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

  // --- Enhancement: Scroll to #our-courses from any page ---
  const handleExploreClick = (e) => {
    if (location.pathname !== "/") {
      e.preventDefault();
      navigate("/");
      // Wait for navigation, then scroll
      setTimeout(() => {
        const el = document.getElementById("our-courses");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
    // If already on home, let the anchor work as normal
  };

  // Helper: is the user on an admin page?
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="h-20 dark:bg-[#020817] bg-white border-b dark:border-b-gray-800 border-b-gray-200 fixed top-0 left-0 right-0 duration-300 z-10">
      {/* Desktop */}
      {!isMobile && (
        <div className="max-w-7xl mx-auto flex items-center h-full justify-between">
          {/* Left: Logo only */}
          <div className="flex items-center gap-2">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1">
              <School size={28} />
              <span className="text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                Skill<span className="text-blue-400">Able</span>
              </span>
            </Link>
          </div>
          {/* Center: Explore + Search bar */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            {/* Explore anchor link */}
            <a
              href="#our-courses"
              className="text-blue-400 font-semibold text-lg hover:underline transition"
              onClick={e => {
                e.preventDefault();
                if (location.pathname !== "/") {
                  navigate("/");
                  // Wait for navigation, then scroll smoothly
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
            {/* Search bar */}
            <form
              onSubmit={searchHandler}
              className="relative flex items-center w-[800px] max-w-3xl ml-2"
              autoComplete="off"
            >
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                type="text"
                className="w-full pr-14 pl-4 py-2 rounded-full border border-blue-400 bg-white shadow-sm text-foreground dark:bg-zinc-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                placeholder="Search for courses"
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-400 hover:text-blue-500"
                tabIndex={-1}
              >
                <Search className="w-5 h-5" />
              </button>
              {showSuggestions && searchQuery && (
                <ul className="absolute left-0 right-0 top-12 z-50 bg-zinc-900 border border-zinc-800 rounded-b-xl shadow-lg max-h-96 overflow-y-auto">
                  <li className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 tracking-widest select-none">SUGGESTIONS</li>
                  <li
                    className="flex items-center gap-3 px-4 py-2 cursor-pointer bg-zinc-800 hover:bg-zinc-700 rounded-t-lg"
                    onMouseDown={() => {
                      navigate(`/course/search?query=${searchQuery}`);
                      setSearchQuery("");
                      setShowSuggestions(false);
                    }}
                  >
                    <Search className="w-5 h-5 text-blue-400" />
                    <span className="font-bold text-white text-base">{searchQuery}</span>
                  </li>
                  {suggestions.length > 0 && (
                    <li className="px-4 pt-4 pb-1 text-xs font-semibold text-gray-400 tracking-widest select-none">COURSES</li>
                  )}
                  {suggestions.length > 0 ? (
                    suggestions.map((course) => (
                      <li
                        key={course._id}
                        className="flex items-center gap-3 px-4 py-2 cursor-pointer bg-zinc-900 hover:bg-zinc-800 rounded-lg mb-1"
                        onMouseDown={() => handleSuggestionClick(course)}
                      >
                        <img src={course.courseThumbnail} alt={course.title || course.name || course.courseTitle} className="w-10 h-10 rounded object-cover border border-zinc-700" />
                        <span className="font-bold text-white text-base truncate ml-2">
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
          {/* Right: Chat icon, then Avatar/Sheet */}
          <div className="flex items-center gap-4">
            {/* Chat icon */}
            <Button
            variant="ghost"
              className="rounded-full p-2 text-blue-400 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-500"
              onClick={() => navigate("/chat")}
              aria-label="Chat"
            >
              <MessageCircle style={{ width: 25, height: 25 }} />
            </Button>
            {/* Avatar/Sheet */}
            {user ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Avatar className="cursor-pointer ring-2 ring-primary ring-offset-2 transition">
                    <AvatarImage
                      src={user?.photoUrl || user?.photoUrl}
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback>
                      {user?.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </SheetTrigger>
                <SheetContent side="right" className="w-[320px] p-0">
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
                      {/* Profile link at the top */}
                      <SheetClose asChild>
                        <Link to="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition text-base">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={user?.photoUrl || user?.photoUrl} alt={user?.name || 'User'} />
                            <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          Profile
                        </Link>
                      </SheetClose>
                      {/* Settings link */}
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
                      {/* Notifications link */}
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          className="justify-start w-full px-3 py-2 text-base"
                          onClick={() => navigate("/notification")}
                        >
                          <BellIcon className="w-5 h-5 mr-2" />
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
                              to="/admin/course"
                              className="py-2 flex items-center gap-2 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <BookOpen className="w-4 h-4" /> Courses
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link
                              to="/admin/userDetails"
                              className="py-2 flex items-center gap-2 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <Users className="w-4 h-4" /> Users
                            </Link>
                          </SheetClose>
                        </div>
                      )}
                    </>
                  )}
                    </div>
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
      {/* Mobile device  */}
      {isMobile && (
        <>
          <MobileNavBar user={user} />
        </>
      )}
    </div>
  );
};

export default Navbar;
