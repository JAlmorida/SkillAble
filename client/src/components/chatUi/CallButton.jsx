import { VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

function CallButton({ handleVideoCall }) {
  return (
    <div className="p-3 border-b flex items-center justify-end max-w-9xl mx-auto w-full absolute top-0">
      <Button onClick={handleVideoCall} variant="success" size="sm" className="text-white dark:text-black">
        <VideoIcon className="size-6" />
      </Button>
    </div>
  );
}

export default CallButton;