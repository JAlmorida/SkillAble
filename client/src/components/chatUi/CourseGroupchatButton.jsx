import React from "react";
import { Button } from "../ui/button";
import { useGetUserCourseGroupChatsQuery, useCheckGroupChatMembershipQuery, useRejoinCourseGroupChatMutation } from "@/features/api/chatApi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const CourseGroupChatButton = ({ courseId, enrolled }) => {
  const navigate = useNavigate();
  const { data: groupChatsData, refetch } = useGetUserCourseGroupChatsQuery();
  const { data: membershipData } = useCheckGroupChatMembershipQuery(courseId, { skip: !enrolled });
  const [rejoinGroupChat, { isLoading: rejoining }] = useRejoinCourseGroupChatMutation();

  const groupChatExists = groupChatsData?.groupChats?.some(
    (gc) => {
      // Check if this is a course group chat by looking for course-related metadata
      // Course group chats have courseThumbnail or courseTitle in their data
      return gc.courseThumbnail || gc.name?.includes('Course') || gc.name?.includes('Group');
    }
  );

  const handleGoTo = () => {
    navigate(`/groupchat/course-${courseId}`);
  };

  const handleRejoin = async () => {
    try {
      await rejoinGroupChat(courseId).unwrap();
      toast.success("Successfully rejoined group chat!");
      refetch(); // Refresh the group chats data
    } catch (error) {
      console.error("Error rejoining group chat:", error);
      toast.error("Failed to rejoin group chat");
    }
  };

  if (!enrolled) return null;

  // Check if user is a member of the group chat
  const isMember = membershipData?.isMember;

  // If user is a member, show "Go to Group Chat"
  if (isMember) {
    return (
      <Button onClick={handleGoTo} className="w-full mt-2 bg-blue-600 text-white">
        Go to Group Chat
      </Button>
    );
  } 
  // If user is not a member but group chat exists, show "Rejoin Group Chat"
  else if (groupChatExists) {
    return (
      <Button 
        onClick={handleRejoin} 
        className="w-full mt-2 bg-green-600 text-white"
        disabled={rejoining}
      >
        {rejoining ? "Rejoining..." : "Rejoin Group Chat"}
      </Button>
    );
  } 
  // If group chat doesn't exist, show disabled button
  else {
    return (
      <Button 
        onClick={() => navigate(`/groupchat/course-${courseId}`)} 
        className="w-full mt-2 bg-blue-600 text-white"
        disabled
      >
        Group Chat Not Available
      </Button>
    );
  }
};

export default CourseGroupChatButton;
