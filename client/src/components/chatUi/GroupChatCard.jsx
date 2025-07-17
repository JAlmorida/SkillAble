import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const GroupChatCard = ({ group }) => {
  const thumbnail =
    group.course?.courseThumbnail ||
    group.courseThumbnail ||
    "/default-group.png";

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 p-5 flex flex-col h-full group border border-primary/10">
      {/* GROUP INFO */}
      <div className="flex items-center gap-4 mb-3">
        <div className="relative w-24 aspect-square rounded-full overflow-hidden bg-muted border-4 border-primary/30 shadow-lg group-hover:scale-105 transition-transform animate-avatar-pulse">
          <img
            src={thumbnail}
            alt={group.name}
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="font-semibold truncate text-lg group-hover:text-primary transition-colors">
          {group.name}
        </h3>
      </div>
      {/* If you want to show a group description, uncomment below: */}
      {/* {group.description && (
        <p className="text-xs opacity-70 mb-3">{group.description}</p>
      )} */}
      <Button
        asChild
        className="w-full mt-auto group-hover:scale-105 transition-transform"
      >
        <Link to={`/groupchat/${group.channelId}`}>Open Group Chat</Link>
      </Button>
      <style>
        {`
          @keyframes avatar-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); } 50% { box-shadow: 0 0 0 8px rgba(99,102,241,0.1); } }
          .animate-avatar-pulse { animation: avatar-pulse 2s infinite; }
        `}
      </style>
    </div>
  );
};

export default GroupChatCard;