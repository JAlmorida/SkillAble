import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Accessibility, Paintbrush } from "lucide-react";

const SettingsSidebar = () => {
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);

  return (
    <aside className="sticky top-20 w-80 h-[calc(100vh-5rem)] bg-background border-r">
      <nav className="flex flex-col">
        <div className="p-3">
          <Link
            to="/profile"
            className={`py-2 px-4 rounded transition block flex items-center gap-3 min-w-0 ${location.pathname === "/settings/account"
                ? "bg-blue-100 dark:bg-gray-800 font-bold"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
          >
            <Avatar className="w-16 h-16">
              <AvatarImage
                src={user?.photoUrl || "https://github.com/shadcn.png"}
                alt={user?.name || "User"}
              />
              <AvatarFallback>
                {user?.name
                  ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">
                {user?.name || "Unknown User"}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email || ""}
              </span>
            </div>
          </Link>
        </div>
        <div className="flex flex-1">
          <Link
            className={`py-2 px-4 rounded transition block flex items-center gap-2 w-full ${
              location.pathname === "/settings/notifications"
                ? "bg-blue-100 dark:bg-gray-800 font-bold"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Accessibility className="w-5 h-5" />
            <span>Accessibility</span>

          </Link>
        </div>
      </nav>
    </aside>
  );
};

export default SettingsSidebar;