import { VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

function CallButton({ onCall }) {
  return (
    <Button
      onClick={onCall}
      variant="success"
      size="sm"
      className="text-white dark:text-black"
      title="Start Video Call"
    >
      <VideoIcon className="size-6" />
    </Button>
  );
}

export default CallButton;