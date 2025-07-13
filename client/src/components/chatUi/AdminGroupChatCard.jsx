import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AdminGroupChatCard = ({ group }) => {
  if (!group) return <div>No group chat data.</div>;

  // Always use course thumbnail if available
  const thumbnail =
    group.course?.courseThumbnail ||
    group.courseThumbnail ||
    "/default-thumbnail.png";

  return (
    <Card className="bg-base-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-full overflow-hidden w-12 h-12 bg-muted">
            <img
              src={thumbnail}
              alt="Course Thumbnail"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold truncate">{group.name}</h3>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="font-semibold">Members:</span>
              <ul className="list-disc ml-4">
                {group.members && group.members.length > 0 ? (
                  group.members.map((member) => (
                    <li key={member.id || member._id}>
                      {member.name || member.username || member.email}
                    </li>
                  ))
                ) : (
                  <li>No members</li>
                )}
              </ul>
            </div>
          </div>
        </div>
        <Button asChild className="w-full">
          <Link to={`/groupchat/${group.channelId}`}>Open Group Chat</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminGroupChatCard;
