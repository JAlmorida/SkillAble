import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FriendCard = ({ friend }) => {
  return (
    <Card className="bg-base-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-full overflow-hidden w-12 h-12 bg-muted">
            <img src={friend.photoUrl} alt={friend.name} className="w-full h-full object-cover" />
          </div>
          <h3 className="font-semibold truncate">{friend.name}</h3>
        </div>
        {friend.bio && (
          <p className="text-xs opacity-70 mb-3">{friend.bio}</p>
        )}
        <Button asChild variant="outline" className="w-full">
          <Link to={`/message/${friend._id}`}>Message</Link>
        </Button>
      </CardContent>
    </Card>
  );
};
export default FriendCard;
