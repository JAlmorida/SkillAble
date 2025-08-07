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
import { Loader2, ArrowLeft, Plus, X, Trash2, BookOpen, Tag } from "lucide-react";
import { useCreateCourseMutation } from "@/features/api/courseApi";
import Input from "@/components/ui/input";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/features/api/categoryApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";

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
      toast.success(data?.message || "Course created successfully!");
      navigate("/author/course");
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
    if (!courseTitle.trim()) {
      toast.error("Course title is required");
      return;
    }
    
    const finalCategory = showCustomCategoryInput ? pendingCategory : category;
    if (!finalCategory.trim()) {
      toast.error("Category is required");
      return;
    }
    
    await createCourse({ courseTitle: courseTitle.trim(), category: finalCategory });
  };

  const handleCreateCategory = async () => {
    const trimmed = pendingCategory.trim();
    if (!trimmed) {
      toast.error("Category name is required");
      return;
    }
    
    if (categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Category already exists");
      return;
    }
    
    try {
      const res = await createCategory(trimmed).unwrap();
      setCategory(res.category._id);
      setShowCustomCategoryInput(false);
      setPendingCategory("");
      toast.success("Category created successfully!");
    } catch (error) {
      toast.error("Failed to create category");
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (window.confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) {
      try {
        await deleteCategory(categoryId).unwrap();
        toast.success("Category deleted successfully!");
        if (category === categoryId) {
          setCategory("");
        }
      } catch (error) {
        toast.error("Failed to delete category");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className=" mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/author/course")}
            className="mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create New Course
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Add a new course to your learning platform
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-6">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Course Information
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Course Title */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Course Title *
              </Label>
              <Input
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                type="text"
                placeholder="Enter course title"
                className="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Category *
              </Label>
              
              {!showCustomCategoryInput ? (
                <div className="space-y-3">
                  <Select
                    onValueChange={handleCategorySelect}
                    value={category}
                    disabled={loadingCategories}
                  >
                    <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white">
                      <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select a category"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      {categories.map(option => (
                        <SelectItem 
                          key={option._id} 
                          value={option._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <Tag className="w-3 h-3 text-gray-500" />
                              <span className="text-gray-900 dark:text-white">{option.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(option._id, option.name);
                              }}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </SelectItem>
                      ))}
                      <SelectItem value="__custom__" className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="flex items-center gap-2">
                          <Plus className="w-3 h-3 text-blue-500" />
                          <span className="text-blue-600 dark:text-blue-400">Add new category</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Enter new category name"
                        value={pendingCategory}
                        onChange={(e) => setPendingCategory(e.target.value)}
                        autoFocus
                        className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleCreateCategory();
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateCategory}
                      disabled={!pendingCategory.trim()}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Create Category
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowCustomCategoryInput(false);
                        setPendingCategory("");
                      }}
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => navigate("/author/course")}
                className="flex-1 sm:flex-none border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCourse}
                disabled={isLoading || !courseTitle.trim() || (!category && !pendingCategory.trim())}
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Course
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddCourse;
