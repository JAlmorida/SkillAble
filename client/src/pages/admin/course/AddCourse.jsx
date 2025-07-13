import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useCreateCourseMutation } from "@/features/api/courseApi";
import { toast } from "sonner";
import Input from "@/components/ui/input";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/features/api/categoryApi";

const AddCourse = () => {
  const [courseTitle, setCourseTitle] = useState("");
  const [category, setCategory] = useState("");
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const [pendingCategory, setPendingCategory] = useState("");

  const [createCourse, { data, isLoading, error, isSuccess }] = useCreateCourseMutation();
  const { data: categoryData, isLoading: loadingCategories } = useGetCategoriesQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const categories = categoryData?.categories || [];

  const navigate = useNavigate();

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "Course created.");
      navigate("/admin/course");
    }
  }, [isSuccess, error, data, navigate]);

  const handleCategorySelect = (val) => {
    if (val === "__custom__") {
      setShowCustomCategoryInput(true);
      setPendingCategory("");
    } else {
      setShowCustomCategoryInput(false);
      setCategory(val);
    }
  };

  const handleCreateCourse = async () => {
    const finalCategory = showCustomCategoryInput ? pendingCategory : category;
    await createCourse({ courseTitle, category: finalCategory });
  };

  return (
    <div className="flex-1 mx-10">
      <div className="mb-4">
        <h1 className="font-bold text-xl">
          Let's add a course. Add some basic course details for your new course.
        </h1>
      </div>
      <div className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            type="text"
            name="courseTitle"
            placeholder="Please enter your course title here"
          />
        </div>
        <div>
          <Label>Category</Label>
          <Select
            onValueChange={handleCategorySelect}
            value={showCustomCategoryInput ? "__custom__" : category}
            disabled={loadingCategories}
          >
            <SelectTrigger className="w-[240px]">
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
                    setCategory(res.category._id);
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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/course")}>
            Back
          </Button>
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={handleCreateCourse}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;
