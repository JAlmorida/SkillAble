import { Menu, MessageCircle, School } from "lucide-react";
import React, { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import DarkMode from "@/DarkMode";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLogoutUserMutation } from "@/features/api/authApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
  const navigate = useNavigate();
  const location = useLocation();

  const logoutHandler = async () => {
    try {
      await logoutUser();
      // Clear any local storage or session data
      localStorage.clear();
      sessionStorage.clear();
      // Force a complete page reload to clear all state
      window.location.href = '/login';
    } catch (error) {
      toast.error("Failed to logout. Please try again.");
    }
  };

  useEffect(() => {
    if (isSuccess && data) {
      toast.success(data?.message || "User logged out successfully.");
      navigate("/login", { replace: true });
    }
  }, [isSuccess, data, navigate]);

  // Move the conditional check after all hooks
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  return (
    <div className="h-16 dark:bg-[#020817] bg-white border-b dark:border-b-gray-800 border-b-gray-200 fixed top-0 left-0 right-0 duration-300 z-10">
      {/* Desktop */}
      <div className="max-w-7xl mx-auto hidden md:flex justify-between items-center gap-10 h-full">
        <div className="flex items-center gap-2">
          <School size={"30"} />
          <Link to="/">
            <span className="text-xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              SkillAble
            </span>
          </Link>
        </div>
        {/* User icons and dark mode icon  */}
        <div className="flex items-center gap-8">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar>
                  <AvatarImage
                    src={user?.photoUrl || "https://github.com/shadcn.png"}
                    alt="@shadcn"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Link to="my-courses">My Courses</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    {" "}
                    <Link to="profile">Edit Profile</Link>{" "}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logoutHandler}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                {user?.role === "admin" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link to="/admin/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button onClick={() => navigate("/register")}>Signup</Button>
            </div>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/chat")}
          >
            <MessageCircle />
          </Button>
          <DarkMode />
        </div>
      </div>
      {/* Mobile device  */}
      <div className="flex md:hidden items-center justify-between px-4 h-full">
        <h1 className="font-extrabold text-2xl">SkillAble</h1>
        <MobileNavbar user={user} />
      </div>
    </div>
  );
};

export default Navbar;

const MobileNavbar = ({ user }) => {
  const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
  const navigate = useNavigate();
  const logoutHandler = async () => {
    try {
      await logoutUser();
      // Clear any local storage or session data
      localStorage.clear();
      sessionStorage.clear();
      // Force a complete page reload to clear all state
      window.location.href = '/login';
    } catch (error) {
      toast.error("Failed to logout. Please try again.");
    }
  };
  
  useEffect(() => {
    if (isSuccess && data) {
      toast.success(data?.message || "User logged out successfully.");
      navigate("/login", { replace: true });
    }
  }, [isSuccess, data, navigate]);



  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="rounded-full hover:bg-gray-200"
          variant="outline"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader className="flex flex-row items-center justify-between mt-10">
          <SheetTitle>
            {" "}
            <Link to="/">SkillAble</Link>
          </SheetTitle>
          <DarkMode />
        </SheetHeader>

        <Separator className="mr-2" />
        <nav className="flex flex-col space-y-4 ml-4 ">
          <Link to="/my-courses">My Courses</Link>
          <Link to="/profile">Edit Profile</Link>
          <Link onClick={logoutHandler}>Log out</Link>
        </nav>
        {user?.role === "admin" && (
          <SheetFooter>
            <SheetClose asChild>
              <Button
                type="submit"
                onClick={() => navigate("/admin/dashboard")}
              >
                Dashboard
              </Button>
            </SheetClose>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};
