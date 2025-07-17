import React from 'react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from "date-fns";

const DMNotificationCard = ({ dm }) => {
  // Fallback for broken/missing avatar
  const [imageFailed, setImageFailed] = React.useState(false);

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 p-5 flex flex-col border border-primary/10">
      <div className='flex items-center gap-4 mb-3'>
        <div className='relative w-16 aspect-square rounded-full overflow-hidden bg-muted border-4 border-primary/30 shadow-lg flex items-center justify-center'>
          {!imageFailed && (
            <img
              src={dm.avatar || '/default-user.png'}
              alt={dm.name}
              className="w-full h-full object-cover"
              onError={() => setImageFailed(true)}
            />
          )}
          {imageFailed && (
            <span className="absolute text-2xl text-gray-400 font-bold select-none pointer-events-none">
              {dm.name ? dm.name[0] : "?"}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className='font-semibold truncate text-lg group-hover:text-primary transition-colors'>{dm.name}</h3>
            {dm.unreadCount > 0 && (
              <span className='ml-2 text-xs text-red-600 font-bold'>
                {dm.unreadCount} new
              </span>
            )}
          </div>
          {dm.lastMessage && (
            <div className='text-xs text-muted-foreground mt-1 truncate'>
              {dm.lastMessage}
            </div>
          )}
          <div className='text-xs text-gray-400 mt-1'>
            {dm.createdAt && formatDistanceToNow(new Date(dm.createdAt), { addSuffix: true })}
          </div>
        </div>
      </div>
      <Button asChild variant="outline" className="w-full mt-auto group-hover:scale-105 transition-transform">
        <Link to={`/message/${dm.userId}`}>Open Chat</Link>
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

export default DMNotificationCard