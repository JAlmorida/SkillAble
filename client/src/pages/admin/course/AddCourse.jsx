import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Navigate, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useCreateCourseMutation } from "@/features/api/courseApi";
import { toast } from "sonner";
import Input from "@/components/ui/input";

const AddCourse = () => {
  const [courseTitle, setCourseTitle] = useState("");
  const [category, setCategory] = useState("");

  const [createCourse, { data, isLoading, error, isSuccess }] =
    useCreateCourseMutation();

  const navigate = useNavigate();

  const getSelectedCategory = (value) => {
    setCategory(value);
  };

  const createCourseHandler = async () => {
    await createCourse({ courseTitle, category });
  };

  //for displaying toast
  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "Course created.");
      navigate("/admin/course");
    }
  }, [isSuccess, error]);

  return (
    <div className="flex-1 mx-10">
      <div className="mb-4">
        <h1 className="font-bold text-xl">
          Lets add course, add some basic course details for your new course
        </h1>
        <p className="text-sm"></p>
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
          <Select onValueChange={getSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Category</SelectLabel>
                <SelectItem value="Business & Entrepreneurship">
                  Business & Entrepreneurship
                </SelectItem>
                <SelectItem value="Agriculture & Farming">
                  {" "}
                  Agriculture & Farming
                </SelectItem>
                <SelectItem value="Data science & analysis">
                  Data science & analysis
                </SelectItem>
                <SelectItem value="Communication & Media Studies">
                  Communication & Media Studies
                </SelectItem>
                <SelectItem value="Culinary arts & Food Science">
                  Culinary arts & Food Science
                </SelectItem>
                <SelectItem value="Cyber Security & data protection">
                  Cyber Security & data protection
                </SelectItem>
                <SelectItem value="Digital Marketing & social media">
                  Digital Marketing & social media
                </SelectItem>
                <SelectItem value="Electrical & Electronic Engineering">
                  Electrical & Electronic Engineering
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/course")}>
            Back
          </Button>
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={createCourseHandler}
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
