import React from "react";
import { Button } from "../ui/button";
import { useGetUserCourseGroupChatsQuery, useJoinCourseGroupChatMutation } from "@/features/api/chatApi";
import { useNavigate } from "react-router-dom";

const CourseGroupChatButton = ({ courseId, enrolled }) => {
  const navigate = useNavigate();
  const { data: groupChatsData, refetch } = useGetUserCourseGroupChatsQuery();
  const [joinGroupChat, { isLoading: joining }] = useJoinCourseGroupChatMutation();

  const groupChatExists = groupChatsData?.groupChats?.some(
    (gc) => gc.channelId === `course-${courseId}`
  );

  const handleJoin = async () => {
    await joinGroupChat(courseId).unwrap();
    await refetch();
    navigate(`/groupchat/course-${courseId}`);
  };

  const handleGoTo = () => {
    navigate(`/groupchat/course-${courseId}`);
  };

  if (!enrolled) return null;

  if (groupChatExists) {
    // You can add logic to check if the user is a member, etc.
    return (
      <Button onClick={handleGoTo} className="w-full mt-2 bg-blue-600 text-white">
        Go to Group Chat
      </Button>
    );
  } else {
    return (
      <Button onClick={handleJoin} className="w-full mt-2 bg-blue-600 text-white" disabled={joining}>
        {joining ? "Joining..." : "Join Group Chat"}
      </Button>
    );
  }
};

export default CourseGroupChatButton;
