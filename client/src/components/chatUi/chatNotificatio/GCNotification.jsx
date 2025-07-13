import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from "date-fns";

const GCNotificationCard = ({ group }) => {
  console.log("GCNotificationCard group prop:", group);

  return (
    <Card className="bg-base-200 hover:shadow-md transition-shadow"> 
      <CardContent className="p-4">
        <div className='flex items-center gap-3 mb-3'>
          <div className='rounded-full overflow-hidden w-12 h-12 bg-muted'>
            <img
              src={group.courseThumbnail || '/default-group.png'}
              alt={group.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className='font-semibold truncate'>{group.name}</h3>
            {group.unreadCount > 0 && (
              <span className='ml-2 text-xs text-red-600 font-bold'>
                {group.unreadCount} new
              </span>
            )}
            {group.lastMessage && (
              <div className='text-xs text-muted-foreground mt-1'>
                <span className="font-semibold">{group.lastSender}:</span> {group.lastMessage}
              </div>
            )}
            <div className='text-xs text-gray-400 mt-1'>
              {group.createdAt && formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link to={`/groupchat/${group.channelId}`}>Open Group Chat</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default GCNotificationCard