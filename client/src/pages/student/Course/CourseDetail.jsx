import EnrollCourseButton from "@/components/courseUi/EnrollCourseButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import VideoWithCaption from "@/components/video/VideoWithCaption";
import { useGetCourseDetailWithStatusQuery, useEnrollCourseMutation } from "@/features/api/enrollApi";
import { BadgeInfo, Lock, PlayCircle } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import ReactPlayer from "react-player";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useGetAuthUserQuery } from "@/features/api/authApi";
import { useJoinCourseGroupChatMutation, useStreamTokenQuery } from "@/features/api/chatApi";
import { StreamChat } from "stream-chat";
import { Badge } from "@/components/ui/badge";
import { useGetUserCourseGroupChatsQuery } from "@/features/api/chatApi";
import CourseGroupChatButton from "@/components/chatUi/CourseGroupchatButton";

const CourseDetail = () => {
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();
  const location = useLocation();
  // Pass courseId to the query!
  const { data: courseStatus, isLoading, isError, refetch: refetchEnrollment, status: enrollmentStatus } =
    useGetCourseDetailWithStatusQuery(courseId);

  // Fallback to avoid destructuring undefined
  const { course, enrolled } = courseStatus || {};
  console.log(enrolled);

  const [isGroupMember, setIsGroupMember] = useState(false);
  const [checkingGroup, setCheckingGroup] = useState(true);
  const clientRef = useRef(null);

  const { data: authUserData } = useGetAuthUserQuery();
  const authUser = authUserData?.user;
  const { data: tokenData } = useStreamTokenQuery(undefined, { skip: !authUser });

  const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

  const { data: groupChatsData } = useGetUserCourseGroupChatsQuery(undefined, { skip: !authUser });
  const groupChatExists = groupChatsData?.groupChats?.some(
    (gc) => gc.channelId === `course-${courseId}`
  );

  const checkMembership = async () => {
    if (!authUser || !tokenData?.token || !courseId || !groupChatExists) {
      setIsGroupMember(false);
      setCheckingGroup(false);
      return;
    }
    setCheckingGroup(true);

    // Always create a new Stream client instance
    if (clientRef.current) {
      await clientRef.current.disconnectUser();
      clientRef.current = null;
    }
    clientRef.current = new StreamChat(STREAM_API_KEY);
    const client = clientRef.current;

    await new Promise(res => setTimeout(res, 500));

    await client.connectUser(
      {
        id: authUser._id,
        name: authUser.name,
        user_details: {
          email: authUser.email || "none@example.com",
          name: authUser.name || "Anonymous"
        }
      },
      tokenData.token
    );
    const channelId = `course-${courseId}`;
    const channel = client.channel("messaging", channelId);
    try {
      await channel.watch();
      setIsGroupMember(!!channel.state.members[authUser._id.toString()]);
    } catch (e) {
      setIsGroupMember(false);
    }
    setCheckingGroup(false);
  };

  useEffect(() => {
    checkMembership();
    // Cleanup on unmount
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnectUser();
        clientRef.current = null;
      }
    };
  // Add groupChatExists as a dependency!
  }, [authUser, tokenData, courseId, location.key, groupChatExists]);

  const [joinGroupChat, { isLoading: joining }] = useJoinCourseGroupChatMutation();

  const handleContinueCourse = () => {
    if(enrolled){
      navigate(`/course-progress/${courseId}`)
    }
  }  

  const [enrollCourse, { isLoading: enrolling }] = useEnrollCourseMutation();
  const isExpired = courseStatus?.isExpired;
  const expiresAt = courseStatus?.expiresAt;

  const [refreshKey, setRefreshKey] = useState(0);

  const handleAfterEnroll = async () => {
    setRefreshKey(prev => prev + 1);
  };

  const getTimeLeft = () => {
    if (!expiresAt) return null;
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires - now;

    if (diffMs <= 0) return "Expired";

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0) {
      return `${diffYears} year${diffYears > 1 ? "s" : ""} left`;
    } else if (diffMonths > 0) {
      return `${diffMonths} month${diffMonths > 1 ? "s" : ""} left`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} left`;
    }
  };

  if (isLoading) return <h1>Loading...</h1>;
  if (isError) return <h1>Failed to load course details</h1>;

  return (
    <div key={refreshKey} className="space-y-5">
      <div className="bg-[#2D2F31] text-white">
        <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 flex flex-col gap-2">
          <h1 className="font-bold text-2xl md:text-3xl flex items-center gap-2">
            {course?.courseTitle}
            {courseStatus?.completed && (
              <Badge className="bg-green-600 text-white ml-2">Completed</Badge>
            )}
            {course?.expiryEnabled && isExpired && (
              <Badge className="bg-red-600 text-white ml-2">Expired</Badge>
            )}
          </h1>
          <p className="text-base md:text-lg">{course?.subTitle || "Course Subtitle"}</p>
          <div className="flex items-center gap-2 text-sm">
            <BadgeInfo size={16} />
            <p>Last updated: {course?.createdAt.split("T")[0]}</p>
          </div>
          <p>Students Enrolled: {course?.enrolledStudents.length}</p>

          {/* Expiry Info */}
          {course?.expiryEnabled ? (
            expiresAt ? (
              <>
                <div className="text-gray-400">
                  Time left on this course: <span className="font-semibold">{getTimeLeft()}</span>
                </div>
                <div className="text-gray-400">
                  Your access expires on:{" "}
                  <span className="font-semibold">
                    {new Date(expiresAt).toLocaleString(undefined, {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-gray-400">
                <span className="font-semibold">Expiry date not set.</span>
              </div>
            )
          ) : (
            <div className="text-gray-400">
              <span className="font-semibold">No expiry (unlimited access)</span>
            </div>
          )}
          {isExpired && (
            <div className="text-red-500 font-bold">
              Course Expired
            </div>
          )}
        </div>
      </div>
      <div className="max-w-8xl mx-auto my-5 px-4 md:px-8 flex flex-col lg:flex-row justify-between gap-10">
        <div className="w-full lg:w-2/3 space-y-5">
          {/* Description Card */}
          <div className="bg-[#23232a] rounded-2xl shadow-lg border border-[#23232a] p-8 mb-10 w-full min-h-[16rem]">
            <h1 className="font-bold text-xl md:text-2xl text-white mb-3">What You'll Learn</h1>
            {course?.description && (
              <div
                className="text-base text-slate-200 leading-relaxed max-h-64 overflow-y-auto pr-2"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />
            )}
          </div>
        </div>
        <div className="w-full lg:w-1/3">
  <div className="bg-[#23232a] rounded-2xl shadow-lg border border-[#23232a] overflow-hidden flex flex-col">
    <div className="aspect-video bg-black mb-4">
      {course?.lectures?.[0]?.videoUrl ? (
        <VideoWithCaption videoUrl={course.lectures[0].videoUrl} />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-400">
          No Preview Available
        </div>
      )}
    </div>
    <div className="px-5 pb-2">
      <h2 className="text-base font-semibold text-white mb-2">
        {course?.lectures?.[0]?.lectureTitle || "Lecture title"}
      </h2>
    </div>
    <div className="px-5 pb-5 flex flex-col gap-3">
      {enrolled ? (
        <>
          <Button onClick={handleContinueCourse} className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold">
            Continue Course
          </Button>
          <CourseGroupChatButton key={refreshKey} courseId={courseId} enrolled={enrolled} />
        </>
      ) : (
        <EnrollCourseButton courseId={courseId} onEnrolled={handleAfterEnroll} />
      )}
    </div>
  </div>
</div>
      </div>
    </div>
  );
};

export default CourseDetail;
