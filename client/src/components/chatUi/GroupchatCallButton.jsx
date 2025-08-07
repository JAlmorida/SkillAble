import { VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

function GroupchatCallButton({ handleVideoCall }) {
  return (
    <Button
      onClick={handleVideoCall}
      variant="success"
      size="sm"
      className="text-white dark:text-black ml-2"
      title="Start Group Video Call"
    >
      <VideoIcon className="size-6" />
    </Button>
  );
}

export default GroupchatCallButton;
