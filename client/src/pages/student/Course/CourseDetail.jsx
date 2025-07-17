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

  // Alternative modern approach
  return (
    <div key={refreshKey} className="min-h-screen bg-slate-50 dark:bg-background">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                {course?.courseTitle}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
                {course?.subTitle || "Course Subtitle"}
              </p>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {courseStatus?.completed && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    ✅ Completed
                  </span>
                )}
                {course?.expiryEnabled && isExpired && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    ⏰ Expired
                  </span>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                <span>Updated: {course?.createdAt.split("T")[0]}</span>
                <span>{course?.enrolledStudents.length} Students</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <div className="space-y-4">
                {enrolled ? (
                  <>
                    <Button 
                      onClick={handleContinueCourse}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-medium transition-colors"
                    >
                      Continue Course
                    </Button>
                    <CourseGroupChatButton key={refreshKey} courseId={courseId} enrolled={enrolled} />
                  </>
                ) : (
                  <EnrollCourseButton courseId={courseId} onEnrolled={handleAfterEnroll} />
                )}
              </div>
            </div>

            {/* Video */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="aspect-video bg-slate-900">
                {course?.lectures?.[0]?.videoUrl ? (
                  <VideoWithCaption videoUrl={course.lectures[0].videoUrl} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <PlayCircle size={48} className="mx-auto mb-2 opacity-50" />
                      <p>No Preview Available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                What You'll Learn
              </h2>
              {course?.description && (
                <div
                  className="text-slate-700 dark:text-slate-300 leading-relaxed prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: course.description }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;