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
import { useGetAllUsersQuery } from "@/features/api/userApi";
import { User, Mail, ChevronDown, ChevronRight, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const UserManagement = () => {
  const { data, isLoading, error, refetch } = useGetAllUsersQuery();
  const users = data?.users || [];
  const [expandedUser, setExpandedUser] = useState(null);
  const navigate = useNavigate();

  const toggleUserDetails = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  if (isLoading) return <PageLoader />;
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <h1 className="text-2xl font-bold text-red-600">Error loading users</h1>
        <p className="text-gray-600 mt-2">{error.message || "An error occurred while loading user data"}</p>
        <Button className="mt-4" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button 
          onClick={() => {
            refetch();
            toast("User data has been refreshed");
          }}
        >
          Refresh Data
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of all users in the system.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Enrolled Courses</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <React.Fragment key={user._id}>
                    <TableRow>
                      <TableCell className="font-medium flex items-center gap-2">
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
                        {user.name}
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.role === "admin" ? "default" : "secondary"}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {user.enrolledCourses?.length || 0} courses
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost" 
                          size="sm"
                          onClick={() => toggleUserDetails(user._id)}
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