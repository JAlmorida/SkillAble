import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PageLoader from "@/components/loadingUi/PageLoader";
import { useGetAllUsersQuery, useChangeUserRoleMutation } from "@/features/api/userApi";
import { User, Mail, ChevronDown, ChevronRight, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useSelector } from "react-redux";

const UserManagement = () => {
  const { data, isLoading, error, refetch } = useGetAllUsersQuery();
  const users = data?.users || [];
  const [expandedUser, setExpandedUser] = useState(null);
  const navigate = useNavigate();
  const [changeUserRole, { isLoading: isChangingRole }] = useChangeUserRoleMutation();
  const { user } = useSelector((state) => state.auth);
  const currentUserId = user?._id;

  const toggleUserDetails = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  if (isLoading) return <PageLoader />;
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-600">Error loading users</h1>
        <p className="text-gray-600 mt-2">{error.message || "An error occurred while loading user data"}</p>
        <Button className="mt-4" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  // Helper to count current admins
  const adminCount = users.filter(u => u.role === "admin").length;

  return (
    <div className="w-full mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6 mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-xl sm:text-2xl font-bold">User Management</h1>
        <Button 
          onClick={() => {
            refetch();
            toast("User data has been refreshed");
          }}
          className="w-full sm:w-auto"
        >
          Refresh Data
        </Button>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto w-full">
            <div className="hidden sm:block">
              {/* Table for desktop/tablet */}
              <Table className="w-full">
                <TableCaption>A list of all users in the system.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="hidden xs:table-cell">Enrolled Courses</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <React.Fragment key={user._id}>
                        <TableRow>
                          <TableCell className="py-2 px-1 sm:py-3 sm:px-4 font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                {user.photoUrl ? (
                                  <img 
                                    src={user.photoUrl} 
                                    alt={user.name} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-4 h-4 text-gray-500" />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span>{user.name}</span>
                                <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                                  <Mail className="w-3 h-3" />
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2 px-1 sm:py-3 sm:px-4">
                            <div
                              title={
                                isChangingRole
                                  ? "Role change in progress"
                                  : user.role === "admin" && adminCount <= 1
                                  ? "At least one admin is required"
                                  : ""
                              }
                            >
                              <Select
                                value={user.role}
                                onValueChange={async (newRole) => {
                                  try {
                                    await changeUserRole({ userId: user._id, newRole }).unwrap();
                                    toast.success("Role updated!");
                                    refetch();
                                  } catch (err) {
                                    toast.error(err.data?.message || "Failed to update role");
                                  }
                                }}
                                disabled={
                                  isChangingRole ||
                                  (user.role === "admin" && adminCount <= 1) ||
                                  (user.role === "admin" && user._id === currentUserId) // Prevent self-demotion
                                }
                                className="min-h-[40px]"
                              >
                                <SelectTrigger className="w-[120px] min-h-[40px]">
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
                            </div>
                          </TableCell>
                          <TableCell className="hidden xs:table-cell">
                            <Badge variant="outline">
                              {user.enrolledCourses?.length || 0} courses
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2 px-1 sm:py-3 sm:px-4">
                            <Button
                              variant="ghost" 
                              size="sm"
                              onClick={() => toggleUserDetails(user._id)}
                              className="min-h-[40px]"
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
                            <TableCell colSpan={5} className="p-0">
                              <UserEnrollmentsPanel user={user} />
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="block sm:hidden space-y-2">
              {/* Cards for mobile */}
              {users.map((user) => (
                <div key={user._id} className="bg-card rounded-lg p-3 flex items-center gap-3 shadow w-full">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {user.photoUrl ? (
                      <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                    <div className="flex gap-2 mt-1">
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                      <Badge variant="outline">{user.enrolledCourses?.length || 0} courses</Badge>
                    </div>
                  </div>
                  <div>
                    <Select
                      value={user.role}
                      onValueChange={async (newRole) => {
                        try {
                          await changeUserRole({ userId: user._id, newRole }).unwrap();
                          toast.success("Role updated!");
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
                      <SelectTrigger className="w-[100px]">
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const UserEnrollmentsPanel = ({ user }) => {
  const navigate = useNavigate();
  const enrolledCourses = user.enrolledCourses || [];
  
  if (enrolledCourses.length === 0) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-slate-900">
        <p className="text-center text-gray-500 dark:text-gray-400">This user is not enrolled in any courses.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 p-4 dark:bg-slate-900">
      <Accordion type="single" collapsible className="w-full">
        {enrolledCourses.map((course) => {
          // Use the progress value from the API
          const courseProgress = course.progress || 0;
          
          return (
            <AccordionItem key={course._id} value={course._id}>
              <AccordionTrigger className="px-4 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md">
                <div className="flex items-center gap-2 text-left">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  <span>{course.courseTitle}</span>
                  <Badge variant="outline" className="ml-2">
                    {course.category}
                  </Badge>
                  <Badge variant="outline" className="ml-2">
                    {course.courseLevel}
                  </Badge>
                  {courseProgress > 0 && (
                    <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {courseProgress}% Complete
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Course Progress</span>
                      <span>Completed: {courseProgress}%</span>
                    </div>
                    <Progress value={courseProgress} className="h-2" />
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Course Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex flex-col">
                        <span className="text-gray-500">Category</span>
                        <span>{course.category}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500">Level</span>
                        <span>{course.courseLevel}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(`/admin/users/${user._id}/enrollments`)}
                    className="w-full"
                  >
                    View Detailed Progress
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default UserManagement;