import PageLoader from "@/components/loadingUi/PageLoader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetCreatorCourseQuery } from "@/features/api/courseApi";
import { Edit } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const CourseTable = () => {
  const { data, isLoading } = useGetCreatorCourseQuery();
  const navigate = useNavigate();

  if (isLoading) return <PageLoader />;

  return (
    <div className="w-full mx-auto px-2 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">My Courses</h1>
        <Button
          onClick={() => navigate("create")}
          className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow"
        >
          Create a new course
        </Button>
      </div>
      <div className="bg-background rounded-lg shadow overflow-x-auto w-full">
        <Table className="w-full">
          <TableCaption className="text-gray-500 dark:text-gray-400">A list of your recent courses.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-gray-700 dark:text-gray-200">Status</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-200">Title</TableHead>
              <TableHead className="text-right text-gray-700 dark:text-gray-200">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.courses?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-500 dark:text-gray-400">
                  No courses found.
                </TableCell>
              </TableRow>
            ) : (
              data?.courses?.map((course) => (
                <TableRow
                  key={course._id}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <TableCell>
                    <Badge className={course.isPublished ? "bg-blue-600 text-white" : "bg-gray-500 text-white"}>
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">{course.courseTitle}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`${course._id}`)}
                      className="hover:bg-blue-900"
                    >
                      <Edit />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CourseTable;
