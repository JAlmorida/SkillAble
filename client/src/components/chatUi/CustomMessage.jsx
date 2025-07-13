import { MessageSimple as DefaultMessage } from "stream-chat-react";
import { Button } from "@/components/ui/button";
import { VideoIcon } from "lucide-react";

const CustomMessage = (props) => (
  <div style={{ display: "flex", alignItems: "center" }}>
    <DefaultMessage {...props} />
    <Button
      size="sm"
      style={{ marginLeft: 8 }}
      onClick={() => alert("Action for message: " + props.message.id)}
    >
      <VideoIcon className="size-4" />
    </Button>
  </div>
);

export default CustomMessage;
