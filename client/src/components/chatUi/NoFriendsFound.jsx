import React from 'react'
import { Card, CardContent } from "@/components/ui/card";

const NoFriendsFound = () => {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <h3 className="font-semibold text-lg mb-2">No friends yet</h3>
        <p className="text-muted-foreground">
          Connect with new friends below to start chatting!
        </p>
      </CardContent>
    </Card>
  );
}

export default NoFriendsFound