import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FriendCard = ({ friend }) => {
  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 p-5 flex flex-col h-full group border border-primary/10">
      {/* USER INFO */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative rounded-full overflow-hidden w-14 h-14 bg-muted border-4 border-primary/30 shadow-lg group-hover:scale-105 transition-transform animate-avatar-pulse">
          <img src={friend.photoUrl} alt={friend.name} className="w-full h-full object-cover" />
        </div>
        <h3 className="font-semibold truncate text-lg group-hover:text-primary transition-colors">{friend.name}</h3>
      </div>
      {friend.bio && (
        <p className="text-xs opacity-70 mb-3">{friend.bio}</p>
      )}
      <Button asChild variant="outline" className="w-full mt-auto group-hover:scale-105 transition-transform">
        <Link to={`/message/${friend._id}`}>Message</Link>
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

export default FriendCard;
