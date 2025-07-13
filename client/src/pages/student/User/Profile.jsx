import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Shuffle, Camera, BookOpen } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  useLoadUserQuery,
  useUpdateUserMutation,
} from "@/features/api/userApi";
import { toast } from "sonner";
import Course from "../Course/Course";
import Input from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import CourseProgressCard from "@/components/profileUI/CourseProgressCard";
import { useGetCourseProgressQuery } from "@/features/api/courseProgressApi";
import { useMemo } from "react";

// Helper to get progress percent for a course
function useCourseProgressPercent(courseId) {
  const { data, isLoading } = useGetCourseProgressQuery(courseId);
  let percent = 0;
  if (data?.data?.courseDetails?.lectures) {
    const lectures = data.data.courseDetails.lectures;
    const allLessons = lectures.flatMap(lec => lec.lessons);
    const total = allLessons.length;
    const completed = allLessons.filter(lesson => lesson.isCompleted).length;
    percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  }
  return { percent, isLoading };
}

const Profile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [bio, setBio] = useState("");

  const { data, isLoading, refetch } = useLoadUserQuery();
  const [
    updateUser,
    {
      data: updateUserData,
      isLoading: updateUserIsLoading,
      isError,
      error,
      isSuccess,
    },
  ] = useUpdateUserMutation();

  const onChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      setPhotoUrl(""); // Remove random avatar if uploading
    }
  };

  const updateUserHandler = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    if (profilePicture) {
      formData.append("profilePicture", profilePicture);
    } else if (photoUrl) {
      formData.append("photoUrl", photoUrl); 
    }
    if (bio) {
      formData.append("bio", bio);
    }
    await updateUser(formData);
  };

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (data?.user) {
      setName(data.user.name || "");
      setEmail(data.user.email || "");
      setPhotoUrl(data.user.photoUrl || "");
      setBio(data.user.bio || "");
    }
  }, [data]);

  useEffect(() => {
    if (isSuccess && updateUserData?.user) {
      setName(updateUserData.user.name || "");
      setEmail(updateUserData.user.email || "");
      setPhotoUrl(updateUserData.user.photoUrl || "");
      setBio(updateUserData.user.bio || "");
      refetch();
      toast.success(updateUserData?.message || "Profile updated.");
    }
    if (isError) {
      toast.error(error?.message || "Failed to update profile");
    }
  }, [error, updateUserData, isSuccess, isError, refetch]);

  if (isLoading) return <h1 className="text-center text-gray-700 dark:text-gray-200">Profile Loading...</h1>;
  if (!data?.user) return <h1 className="text-center text-gray-700 dark:text-gray-200">No profile data found</h1>;

  const user = data.user;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Profile Card */}
        <div className="flex flex-col md:col-span-1">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 w-full px-6 flex flex-col items-center self-start">
            <Avatar className="h-28 w-28 mb-4">
              <AvatarImage
                src={photoUrl || user?.photoUrl || `https://avatar.iran.liara.run/public/1.png`}
                alt={user?.name || "User"}
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="text-xl font-bold mb-1 text-gray-900 dark:text-gray-100">{user?.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{user?.role?.toUpperCase()}</div>
            <div className="text-xs text-gray-400 dark:text-gray-400 mb-2">{user?.email}</div>
            {user?.bio && <div className="text-xs text-gray-500 dark:text-gray-300 mb-2">{user.bio}</div>}
            <div className="text-xs text-gray-400 dark:text-gray-500 mb-2">{user?.friends?.length || 0} friend{user?.friends?.length === 1 ? '' : 's'}</div>
          </div>
          {/* Enrolled Courses List (left column, under profile card) */}
          <div className="w-full mt-6">
            <Label className="dark:text-gray-200 mb-1 block">Enrolled Courses</Label>
            <div className="w-full flex flex-col gap-2 px-6 py-4 rounded-xl border-2 border-dashed border-sky-400 dark:border-sky-600 bg-sky-50 dark:bg-zinc-800 mt-2">
              {user.enrolledCourses?.length ? (
                user.enrolledCourses.map((course) => (
                  <div key={course._id} className="flex items-center gap-3 text-base text-gray-900 dark:text-gray-100 w-full">
                    <BookOpen className="w-5 h-5 text-sky-500 dark:text-sky-400 flex-shrink-0" />
                    <span className="truncate flex-1">{course.title || course.name || course.courseTitle}</span>
                    {course.completed ? (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500 text-white whitespace-nowrap">Completed</span>
                    ) : (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500 text-white whitespace-nowrap">In Progress</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-400 dark:text-gray-500">You haven't enrolled in any courses yet.</div>
              )}
            </div>
          </div>
        </div>
        {/* Right: Edit Profile Form */}
        <div className="md:col-span-2 flex flex-col gap-8">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 flex flex-col gap-8">
            <h2 className="font-semibold text-2xl text-gray-900 dark:text-gray-100 mb-2">Edit Profile</h2>
            <form onSubmit={e => { e.preventDefault(); updateUserHandler(); }} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label className="dark:text-gray-200 mb-1 block">Full Name</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="dark:bg-zinc-800 dark:text-gray-100 mt-1 rounded-lg border border-gray-300 dark:border-zinc-700 px-4 py-2"
                  />
                </div>
                <div>
                  <Label className="dark:text-gray-200 mb-1 block">Bio</Label>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Enter your bio"
                    className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100 mt-1 px-4 py-2 min-h-[80px] resize-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <Label className="dark:text-gray-200 mb-1 block">Change Profile Photo</Label>
                  <label
                    htmlFor="profile-photo-upload"
                    className="w-full flex flex-row items-center gap-3 px-6 py-4 rounded-xl border-2 border-dashed border-sky-400 dark:border-sky-600 bg-sky-50 dark:bg-zinc-800 cursor-pointer transition hover:bg-sky-100 dark:hover:bg-zinc-700 mt-4"
                  >
                    <input
                      id="profile-photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={onChangeHandler}
                      className="hidden"
                    />
                    <span className="inline-block bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2 rounded-lg transition text-center">
                      Choose File
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex-1">
                      {profilePicture?.name || "No file chosen"}
                    </span>
                  </label> 
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="px-6 py-2 rounded-lg font-medium bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-800 shadow"
                  onClick={async () => {
                    const idx = Math.floor(Math.random() * 100) + 1;
                    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;
                    setPhotoUrl(randomAvatar);
                    setProfilePicture("");
                    const formData = new FormData();
                    formData.append("photoUrl", randomAvatar);
                    await updateUser(formData);
                    refetch();
                    toast.success("Random profile picture updated");
                  }}
                >
                  <Shuffle className="w-4 h-4 mr-2" /> Generate Random Avatar
                </Button>
                <Button
                  type="submit"
                  className="bg-sky-600 text-white dark:bg-sky-700 hover:bg-sky-700 dark:hover:bg-sky-800 px-8 py-2 rounded-lg text-base font-semibold shadow"
                >
                  {updateUserIsLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait</>
                  ) : (
                    "Update"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Course Progress Section at the very bottom, full width */}
      {user.enrolledCourses?.length > 0 && (
        <div className="mt-10 flex flex-col gap-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Your Course Progress</h3>
          {user.enrolledCourses.map((course) => (
            <CourseProgressWithFetch key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

function CourseProgressWithFetch({ course }) {
  const { data, isLoading } = useGetCourseProgressQuery(course._id);

  let percent = 0;
  if (data?.data?.courseDetails?.lectures) {
    const lectures = data.data.courseDetails.lectures;
    const allLessons = lectures.flatMap(lec => lec.lessons);
    const total = allLessons.length;
    const completed = allLessons.filter(lesson => lesson.isCompleted).length;
    percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  return (
    <CourseProgressCard
      course={course}
      percent={percent}
      isLoading={isLoading}
    />
  );
}

export default Profile;