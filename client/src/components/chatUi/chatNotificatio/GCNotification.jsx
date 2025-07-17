import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from "date-fns";

const GCNotificationCard = ({ group }) => {
  // Use the same thumbnail logic as GroupChatCard
  const thumbnail =
    group.course?.courseThumbnail ||
    group.courseThumbnail ||
    "/default-group.png";

  // Track if the image failed to load
  const [imageFailed, setImageFailed] = React.useState(false);

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 p-5 flex flex-col group border border-primary/10">
      <div className='flex items-center gap-4 mb-3'>
        <div className='relative w-24 aspect-square rounded-full overflow-hidden bg-muted border-4 border-primary/30 shadow-lg group-hover:scale-105 transition-transform animate-avatar-pulse flex items-center justify-center'>
          {!imageFailed && (
            <img
              src={thumbnail}
              alt={group.name}
              className="w-full h-full object-cover"
              onError={() => setImageFailed(true)}
            />
          )}
          {/* Only show initials if image fails */}
          {imageFailed && (
            <span className="absolute text-2xl text-gray-400 font-bold select-none pointer-events-none">
              {group.name ? group.name[0] : "?"}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className='font-semibold truncate text-lg group-hover:text-primary transition-colors'>{group.name}</h3>
            {group.unreadCount > 0 && (
              <span className='ml-2 text-xs text-red-600 font-bold'>
                {group.unreadCount} new
              </span>
            )}
          </div>
          {group.lastMessage && (
            <div className='text-xs text-muted-foreground mt-1 truncate'>
              <span className="font-semibold">{group.lastSender}:</span> {group.lastMessage}
            </div>
          )}
          <div className='text-xs text-gray-400 mt-1'>
            {group.createdAt && formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })}
          </div>
        </div>
      </div>
      <Button asChild variant="outline" className="w-full mt-auto group-hover:scale-105 transition-transform">
        <Link to={`/groupchat/${group.channelId}`}>Open Group Chat</Link>
      </Button>
      <style>
        {`
          @keyframes avatar-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); } 50% { box-shadow: 0 0 0 8px rgba(99,102,241,0.1); } }
          .animate-avatar-pulse { animation: avatar-pulse 2s infinite; }
        `}
      </style>
    </div>
  )
}

export default GCNotificationCard