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
    <div className="w-full py-8 px-2">
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/course")}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-transparent text-blue-600 font-semibold focus:outline-none active:bg-transparent"
          title="Back to Course Table"
          type="button"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Courses</span>
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-8 min-h-[500px] items-stretch">
        {/* Left Section */}
        <div className="w-full md:w-1/3 space-y-6 h-full flex flex-col">
          {/* Card 1: Inputs */}
          <div className="bg-background border border-border rounded-xl shadow p-6 space-y-4">
            <div>
              <h1 className="font-semibold text-sm mb-2">Title</h1>
              <Input
                name="courseTitle"
                value={input.courseTitle}
                onChange={handleChange}
                placeholder="Course title"
              />
            </div>
            <div>
              <h1 className="font-semibold text-sm mb-2">Subtitle</h1>
              <Input
                name="subTitle"
                value={input.subTitle}
                onChange={handleChange}
                placeholder="Subtitle"
              />
            </div>
            <div>
              <h1 className="font-semibold text-sm mb-2">Category</h1>
              <Select
                onValueChange={val => {
                  if (val === "__custom__") {
                    setShowCustomCategoryInput(true);
                    setPendingCategory("");
                  } else {
                    setShowCustomCategoryInput(false);
                    setInput({ ...input, category: val }); // val is now the ObjectId
                  }
                }}
                value={showCustomCategoryInput ? "__custom__" : input.category}
                disabled={loadingCategories}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select or add category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(option => (
                    <SelectItem key={option._id} value={option._id}>
                      <div className="flex items-center justify-between">
                        <span>{option.name}</span>
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
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Enter new category"
                    value={pendingCategory}
                    onChange={e => setPendingCategory(e.target.value)}
                    autoFocus
                  />
                  <Button
                    onClick={async () => {
                      const trimmed = pendingCategory.trim();
                      if (trimmed && !categories.some(c => c.name === trimmed)) {
                        const res = await createCategory(trimmed).unwrap();
                        setInput({ ...input, category: res.category._id }); // Use the new ObjectId
                        setShowCustomCategoryInput(false);
                        setPendingCategory("");
                      }
                    }}
                    disabled={!pendingCategory.trim()}
                  >
                    Save Category
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCustomCategoryInput(false);
                      setPendingCategory("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
            <div>
              <h1 className="font-semibold text-sm mb-2">Level</h1>
              <Select onValueChange={selectCourseLevel} value={input.courseLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* --- Expiry Section (below Level) --- */}
            <div className="mb-4">
              <label className="font-semibold flex items-center gap-2">
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
                  <div className="flex items-center gap-3">
                    <Label htmlFor="expiryDays" className="text-sm text-gray-700 dark:text-gray-300">
                      Access Duration:
                    </Label>
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
                      className="w-20 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded px-2 py-1 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">days (max 1 year)</span>
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
            {/* --- MOVE BUTTONS HERE --- */}
            {/* --- END BUTTONS --- */}
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full md:w-2/3 bg-background border border-border rounded-xl shadow p-6 flex flex-col h-full">
          {/* BUTTONS ON TOP */}
          <div className="flex justify-between mb-4">
            <Label className="mb-2 text-2xl font-bold">Description</Label>
            <div className="flex flex-row gap-2 items-center">
              <Button
                type="button"
                variant={courseByIdData?.course?.isPublished ? "outline" : "default"}
                className={courseByIdData?.course?.isPublished ? "border-green-600 text-green-600" : "bg-yellow-500 text-white"}
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
              <Link to="lecture">
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  variant="secondary"
                  type="button"
                >
                  Add Lectures
                </Button>
              </Link>
            </div>
          </div>
          {/* RICH TEXT EDITOR */}
          <div className="flex-1 min-h-[300px] mb-4">
            <RichTextEditor input={input} setInput={setInput} />
          </div>
        </div>
      </div>

      {/* Course Group Chat section at the bottom */}
      <div className="mt-8">
        <div className="bg-background border border-border rounded-xl shadow p-6 space-y-4">
          <h2 className="font-semibold text-lg mb-2">Course Group Chat</h2>
          {thisCourseGroupChat ? (
            <AdminGroupChatCard group={thisCourseGroupChat} />
          ) : (
            <div>
              <Button
                onClick={() => setShowCard(true)}
                className="bg-blue-600 text-white mt-2"
              >
                Create Group Chat
              </Button>
              {showCard && (
                <div className="w-full mt-4 p-4 bg-[#23232a] rounded-lg shadow space-y-4">
                  <Input
                    type="text"
                    placeholder="Group Chat Name"
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleCreateGroupChat(courseId)}
                      disabled={!groupName}
                    >
                      Create
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCard(false)}
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
      <div className="fixed bottom-8 right-8 z-50 flex gap-2">
        <Button
          onClick={updateCourseHandler}
          disabled={isLoading}
          className="bg-blue-600 text-white shadow-lg hover:bg-blue-700"
          size="lg"
        >
          {isLoading ? "Saving..." : "Save"}
        </Button>
        <Button
          onClick={handleRemoveCourse}
          disabled={removing}
          className="bg-red-600 text-white shadow-lg hover:bg-red-700"
          size="lg"
          variant="destructive"
        >
          {removing ? "Removing..." : "Delete"}
        </Button>
      </div>
    </div>
  );
};

export default EditCourse;
