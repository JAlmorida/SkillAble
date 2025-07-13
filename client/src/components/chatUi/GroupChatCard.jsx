import React from 'react'
import { Card, CardContent } from '../ui/card'
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const GroupChatCard = ({ group }) => {
  // Always use course thumbnail if available
  const thumbnail =
    group.course?.courseThumbnail ||
    group.courseThumbnail ||
    '/default-group.png';

  return (
    <Card className="bg-base-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-full overflow-hidden w-12 h-12 bg-muted">
            <img 
              src={thumbnail}
              alt={group.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-semibold truncate">{group.name}</h3>
        </div>
        <Button asChild className="w-full">
          <Link to={`/groupchat/${group.channelId}`}>Open Group Chat</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default GroupChatCard