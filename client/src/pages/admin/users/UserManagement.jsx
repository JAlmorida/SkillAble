import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PageLoader from "@/components/loadingUi/PageLoader";
import { useGetAllUsersQuery, useChangeUserRoleMutation } from "@/features/api/userApi";
import { User, ChevronDown, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import toast from "react-hot-toast";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useSelector } from "react-redux";
import { useGetCategoriesQuery } from "@/features/api/categoryApi";

const UserManagement = () => {
  const { data, isLoading, error, refetch } = useGetAllUsersQuery();
  const { data: categoryData } = useGetCategoriesQuery();
  const users = data?.users || [];
  const [expandedUser, setExpandedUser] = useState(null);
  const navigate = useNavigate();
  const [changeUserRole, { isLoading: isChangingRole }] = useChangeUserRoleMutation();
  const { user } = useSelector((state) => state.auth);
  const currentUserId = user?._id;

  const getCategoryName = (categoryId) => {
    const categoriesList = categoryData?.categories || [];
    const category = categoriesList.find(cat => cat._id === categoryId);
    return category ? category.name : categoryId || "Unknown Category";
  };

  const toggleUserDetails = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  if (isLoading) return <PageLoader />;
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h1 className="text-xl font-medium text-red-600 dark:text-red-400">Error loading users</h1>
        <p className="text-gray-500 dark:text-gray-400">{error.message || "An error occurred while loading user data"}</p>
        <Button variant="outline" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  const adminCount = users.filter(u => u.role === "admin").length;

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Users</h1>
        <Button 
          variant="outline" 
          onClick={() => {
            refetch();
            toast.success("Refreshed");
          }}
        >
          Refresh
        </Button>
      </div>

      {/* Simple Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 dark:border-gray-700">
              <TableHead className="font-medium text-gray-700 dark:text-gray-300">User</TableHead>
              <TableHead className="font-medium text-gray-700 dark:text-gray-300">Role</TableHead>
              <TableHead className="font-medium text-gray-700 dark:text-gray-300">Courses</TableHead>
              <TableHead className="font-medium w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <React.Fragment key={user._id}>
                  <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                          {user.photoUrl ? (
                            <img 
                              src={user.photoUrl} 
                              alt={user.name} 
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Select
                        value={user.role}
                        onValueChange={async (newRole) => {
                          try {
                            await changeUserRole({ userId: user._id, newRole }).unwrap();
                            toast.success("Role updated");
                            refetch();
                          } catch (err) {
                            toast.error(err.data?.message || "Failed to update role");
                          }
                        }}
                        disabled={
                          isChangingRole ||
                          (user.role === "admin" && adminCount <= 1) ||
                          (user.role === "admin" && user._id === currentUserId)
                        }
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem
                            value="admin"
                            disabled={user.role !== "admin" && adminCount >= 15}
                          >
                            Admin
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="outline" className="text-xs">
                        {user.enrolledCourses?.length || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleUserDetails(user._id)}
                        className="h-8 w-8 p-0"
                      >
                        {expandedUser === user._id ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {expandedUser === user._id && (
                    <TableRow>
                      <TableCell colSpan={4} className="p-0">
                        <UserEnrollmentsPanel user={user} getCategoryName={getCategoryName} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-gray-500 dark:text-gray-400">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const UserEnrollmentsPanel = ({ user, getCategoryName }) => {
  const navigate = useNavigate();
  const enrolledCourses = user.enrolledCourses || [];
  
  if (enrolledCourses.length === 0) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-700 text-center">
        <p className="text-gray-500 dark:text-gray-400">No courses enrolled</p>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-700 space-y-4">
      {enrolledCourses.map((course) => {
        const courseProgress = course.progress || 0;
        
        return (
          <div key={course._id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{course.courseTitle}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                    {getCategoryName(course.category)}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                    {course.courseLevel}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{courseProgress}%</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Complete</div>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{courseProgress}%</span>
              </div>
              <Progress 
                value={courseProgress} 
                className="h-2"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate(`/admin/users/${user._id}/enrollments`)}
                className="flex-1"
              >
                View Details
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(`/course/${course._id}`)}
                className="flex-1"
              >
                Go to Course
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserManagement;