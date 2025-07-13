import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import React from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from "date-fns";

const DMNotificationCard = ({dm}) => {
  return (
    <Card className="bg-base-200 hover:shadow-md transition-shadow"> 
      <CardContent className="p-4">
        <div className='flex items-center gap-3 mb-3'>
          <div className='rounded-full overflow-hidden w-12 h-12 bg-muted'>
            <img
              src={dm.avatar || '/default-user.png'}
              alt={dm.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className='font-semibold truncate'>{dm.name}</h3>
            {dm.unreadCount > 0 && (
              <span className='ml-2 text-xs text-red-600 font-bold'>
                {dm.unreadCount} new
              </span>
            )}
            {dm.lastMessage && (
              <div className='text-xs text-muted-foreground mt-1'>
                {dm.lastMessage}
              </div>
            )}
            <div className='text-xs text-gray-400 mt-1'>
              {dm.createdAt && formatDistanceToNow(new Date(dm.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link to={`/message/${dm.userId}`}>Open Chat</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default DMNotificationCard