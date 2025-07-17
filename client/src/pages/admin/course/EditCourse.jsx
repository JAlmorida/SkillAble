import PageLoader from "@/components/loadingUi/PageLoader";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditCourseMutation, useGetCourseByIdQuery, useDeleteCourseMutation, usePublishCourseMutation } from "@/features/api/courseApi";
import { useGetCategoriesQuery, useCreateCategoryMutation, useDeleteCategoryMutation } from "@/features/api/categoryApi";
import { toast } from "sonner";
import { useCreateCourseGroupChatMutation, useGetUserCourseGroupChatsQuery } from "@/features/api/chatApi";
import AdminGroupChatCard from "@/components/chatUi/AdminGroupChatCard";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BookOpen, ArrowLeft, Edit, ChevronLeft } from "lucide-react";

const DashedUploadInput = ({ label, ...props }) => (
  <div>
    <Label className="mb-2">{label}</Label>
    <div
      className="border-2 border-dashed border-blue-400 dark:border-blue-300 rounded-lg bg-white dark:bg-[#23232a] px-4 py-2 flex items-center gap-4"
      style={{ minHeight: "48px" }}
    >
      <input
        {...props}
        className="file:bg-blue-600 file:text-white file:font-semibold file:px-4 file:py-2 file:rounded file:border-0 file:mr-4 file:cursor-pointer flex-1 text-black dark:text-white"
        style={{ minWidth: 0 }}
      />
    </div>
  </div>
);

const EditCourse = () => {
  const [input, setInput] = useState({
    courseTitle: "",
    subTitle: "",
    description: "",
    category: "",
    courseLevel: "",
    courseThumbnail: "",
    expiryMode: "duration",
    expiryDuration: 365,
    expiryUnit: "days",
    fixedExpiryDate: "",
    expiryEnabled: false,
    expiryDays: null, // Start as null
  });
  const params = useParams();
  const courseId = params.courseId;
  const { data: courseByIdData, isLoading: courseByIdLoading, refetch } = useGetCourseByIdQuery(courseId, { refetchOnMountOrArgChange: true });
  const [editCourse, { isLoading, isSuccess }] = useEditCourseMutation();
  const [deleteCourse, { isLoading: removing }] = useDeleteCourseMutation();
  const [publishCourse, { isLoading: publishing }] = usePublishCourseMutation();
  const navigate = useNavigate();

  // Category logic (keep as in your current EditCourse)
  const { data: categoryData, isLoading: loadingCategories } = useGetCategoriesQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const categories = categoryData?.categories || [];
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const [pendingCategory, setPendingCategory] = useState("");

  const [showCard, setShowCard] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [createGroupChat] = useCreateCourseGroupChatMutation();
  const { data: groupChatsData, refetch: refetchGroupChats } = useGetUserCourseGroupChatsQuery();
  const allGroupChats = groupChatsData?.groupChats || [];
  const thisCourseGroupChat = allGroupChats.find(gc => gc.channelId === `course-${courseId}`);

  useEffect(() => {
    if (courseByIdData?.course) {
      const course = courseByIdData.course;
      setInput({
        courseTitle: course.courseTitle,
        subTitle: course.subTitle,
        description: course.description,
        category: course.category?._id || course.category, 
        courseLevel: course.courseLevel,
        courseThumbnail: "",
        expiryMode: course.expiryMode,
        expiryDuration: course.expiryDuration,
        expiryUnit: course.expiryUnit,
        fixedExpiryDate: course.fixedExpiryDate,
        expiryEnabled: course.expiryEnabled,
        expiryDays: course.expiryDays, // Set expiryDays from course data
      });
    }
  }, [courseByIdData]);

  useEffect(() => {
    if (isSuccess) toast.success("Course updated.");
  }, [isSuccess]);

  if (courseByIdLoading) return <PageLoader />;

  const handleChange = (e) => setInput({ ...input, [e.target.name]: e.target.value });

  const selectCourseLevel = (value) => setInput({ ...input, courseLevel: value });

  const selectThumbnail = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput({ ...input, courseThumbnail: file });
    }
  };

  const updateCourseHandler = async () => {
    const formData = new FormData();
    Object.entries(input).forEach(([key, value]) => formData.append(key, value));
    await editCourse({ formData, courseId });
    refetch();
    await refetchGroupChats();
  };

  const handleRemoveCourse = async () => {
    if (!window.confirm("Are you sure you want to remove this course?")) return;
    await deleteCourse(courseId).unwrap();
    toast.success("Course removed!");
    navigate("/admin/course");
  };

  const handleCreateGroupChat = async (courseId) => {
    try {
      const courseThumbnail = courseByIdData?.course?.courseThumbnail || "";
      await createGroupChat({ courseId, name: groupName, courseThumbnail }).unwrap();
      setShowCard(false);
      setGroupName("");
      toast.success("Group chat created!");
      await refetchGroupChats();
    } catch (e) {
      toast.error(e.data?.message || "Failed to create group chat");
    }
  };

  let expiryDateString = "";
  if (input.expiryEnabled && input.expiryDays && !isNaN(input.expiryDays)) {
    const now = new Date();
    const expiryDate = new Date(now.getTime() + Number(input.expiryDays) * 24 * 60 * 60 * 1000);
    expiryDateString = expiryDate.toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return (
    <div className="w-full py-4 px-2 sm:py-8">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <button
            onClick={() => navigate("/admin/course")}
            className="flex items-center gap-2 px-3 py-2 sm:px-4 rounded-full bg-transparent text-blue-600 font-semibold focus:outline-none active:bg-transparent text-sm sm:text-base"
            title="Back to Course Table"
            type="button"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Back to Courses</span>
          </button>
          
          <div className="flex flex-row gap-2 sm:gap-3 justify-end">
            <Link to="lecture">
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700 text-sm"
                variant="secondary"
                type="button"
              >
                Add Lectures
              </Button>
            </Link>
            
            <Button
              type="button"
              variant={courseByIdData?.course?.isPublished ? "outline" : "default"}
              className={
                (courseByIdData?.course?.isPublished
                  ? "border-green-600 text-green-600"
                  : "bg-yellow-500 text-white") +
                " min-w-[120px] text-sm"
              }
              disabled={publishing}
              onClick={async () => {
                try {
                  const publish = !courseByIdData?.course?.isPublished;
                  const res = await publishCourse({ courseId, query: publish }).unwrap();
                  toast.success(res.message);
                  refetch();
                } catch (error) {
                  toast.error("Failed to update publish status");
                }
              }}
            >
              {publishing
                ? "Updating..."
                : courseByIdData?.course?.isPublished
                ? "Unpublish"
                : "Publish"}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col xl:flex-row gap-4 sm:gap-8 min-h-[500px] items-stretch">
        {/* Left Section */}
        <div className="w-full xl:w-1/3 space-y-4 sm:space-y-6 h-full flex flex-col">
          {/* Card 1: Inputs */}
          <div className="bg-background border border-border rounded-xl shadow p-4 sm:p-6 space-y-3 sm:space-y-4">
            {/* Title field - simplified */}
            <div>
              <h1 className="font-semibold text-sm mb-2">Title</h1>
              <Input
                name="courseTitle"
                value={input.courseTitle}
                onChange={handleChange}
                placeholder="Course title"
                className="text-sm"
              />
            </div>
            
            <div>
              <h1 className="font-semibold text-sm mb-2">Subtitle</h1>
              <Input
                name="subTitle"
                value={input.subTitle}
                onChange={handleChange}
                placeholder="Subtitle"
                className="text-sm"
              />
            </div>
            
            {/* Rest of the form fields remain the same */}
            <div>
              <h1 className="font-semibold text-sm mb-2">Category</h1>
              <Select
                onValueChange={val => {
                  if (val === "__custom__") {
                    setShowCustomCategoryInput(true);
                    setPendingCategory("");
                  } else {
                    setShowCustomCategoryInput(false);
                    setInput({ ...input, category: val });
                  }
                }}
                value={showCustomCategoryInput ? "__custom__" : input.category}
                disabled={loadingCategories}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select or add category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(option => (
                    <SelectItem key={option._id} value={option._id}>
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm">{option.name}</span>
                        <button
                          type="button"
                          className="ml-2 text-xs text-red-500 hover:underline"
                          onClick={e => {
                            e.stopPropagation();
                            if (window.confirm("Delete this category?")) {
                              deleteCategory(option._id);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom__">Add new category</SelectItem>
                </SelectContent>
              </Select>
              {showCustomCategoryInput && (
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    placeholder="Enter new category"
                    value={pendingCategory}
                    onChange={e => setPendingCategory(e.target.value)}
                    autoFocus
                    className="text-sm flex-1"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={async () => {
                        const trimmed = pendingCategory.trim();
                        if (trimmed && !categories.some(c => c.name === trimmed)) {
                          const res = await createCategory(trimmed).unwrap();
                          setInput({ ...input, category: res.category._id });
                          setShowCustomCategoryInput(false);
                          setPendingCategory("");
                        }
                      }}
                      disabled={!pendingCategory.trim()}
                      className="text-sm"
                      size="sm"
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCustomCategoryInput(false);
                        setPendingCategory("");
                      }}
                      className="text-sm"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h1 className="font-semibold text-sm mb-2">Level</h1>
              <Select onValueChange={selectCourseLevel} value={input.courseLevel}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Expiry Section */}
            <div className="mb-4">
              <label className="font-semibold flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={input.expiryEnabled}
                  onChange={e => setInput({ ...input, expiryEnabled: e.target.checked, expiryDays: null })}
                  className="mr-2 accent-blue-600 dark:accent-blue-400"
                />
                Enable Course Expiry
              </label>
              {input.expiryEnabled && (
                <div className="mt-2 flex flex-col gap-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <Label htmlFor="expiryDays" className="text-sm text-gray-700 dark:text-gray-300">
                      Access Duration:
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="expiryDays"
                        type="number"
                        min={1}
                        max={365}
                        placeholder="Enter days"
                        value={input.expiryDays === null ? "" : input.expiryDays}
                        onChange={e => {
                          let val = e.target.value === "" ? null : Number(e.target.value);
                          if (val !== null) {
                            if (val < 1) val = 1;
                            if (val > 365) val = 365;
                          }
                          setInput({ ...input, expiryDays: val });
                        }}
                        className="w-20 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded px-2 py-1 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                      />
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">days (max 1 year)</span>
                    </div>
                  </div>
                  {input.expiryDays && !isNaN(input.expiryDays) && (
                    <div className="text-xs text-blue-400 mt-1">
                      The course will expire on: <span className="font-semibold">{expiryDateString}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <h1 className="font-semibold text-sm mb-2">Thumbnail</h1>
              <DashedUploadInput
                type="file"
                accept="image/*"
                onChange={selectThumbnail}
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full xl:w-2/3 bg-background border border-border rounded-xl shadow p-4 sm:p-6 flex flex-col h-full">
          {/* Description header - simplified */}
          <div className="mb-4">
            <Label className="text-xl sm:text-2xl font-bold">Description</Label>
          </div>
          
          {/* RICH TEXT EDITOR */}
          <div className="flex-1 min-h-[250px] sm:min-h-[300px] mb-4">
            <RichTextEditor input={input} setInput={setInput} />
          </div>
        </div>
      </div>

      {/* Course Group Chat section at the bottom */}
      <div className="mt-6 sm:mt-8">
        <div className="bg-background border border-border rounded-xl shadow p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="font-semibold text-lg">Course Group Chat</h2>
          </div>
          {thisCourseGroupChat ? (
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {/* Course thumbnail */}
              <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                {courseByIdData?.course?.courseThumbnail ? (
                  <img 
                    src={courseByIdData.course.courseThumbnail} 
                    alt="Course thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Group chat info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-base truncate">{thisCourseGroupChat.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {thisCourseGroupChat.members?.length || 0} members
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-sm"
                  onClick={() => navigate(`/groupchat/${thisCourseGroupChat.channelId}`)}
                >
                  Go to Chat
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <Button
                onClick={() => setShowCard(true)}
                className="bg-blue-600 text-white mt-2 w-full sm:w-auto text-sm"
              >
                Create Group Chat
              </Button>
              {showCard && (
                <div className="w-full mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow space-y-4">
                  <Input
                    type="text"
                    placeholder="Group Chat Name"
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    className="text-sm"
                  />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={() => handleCreateGroupChat(courseId)}
                      disabled={!groupName}
                      className="text-sm"
                    >
                      Create
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCard(false)}
                      className="text-sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Fixed Save and Delete buttons */}
      <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 flex flex-row gap-2">
        <Button
          onClick={updateCourseHandler}
          disabled={isLoading}
          className="bg-blue-600 text-white shadow-lg hover:bg-blue-700 text-sm"
          size="sm"
        >
          {isLoading ? "Saving..." : "Save"}
        </Button>
        <Button
          onClick={handleRemoveCourse}
          disabled={removing}
          className="bg-red-600 text-white shadow-lg hover:bg-red-700 text-sm"
          size="sm"
          variant="destructive"
        >
          {removing ? "Removing..." : "Delete"}
        </Button>
      </div>
    </div>
  );
};

export default EditCourse;
