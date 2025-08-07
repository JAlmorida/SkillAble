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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { useGetCreatorCourseQuery } from "@/features/api/courseApi";
import { useGetAllUsersQuery } from "@/features/api/userApi";
import { useGetCategoriesQuery } from "@/features/api/categoryApi";
import PageLoader from "@/components/loadingUi/PageLoader";
import { User, ChevronDown, ChevronRight, Users, BookOpen, GraduationCap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import toast from "react-hot-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSelector } from "react-redux";

const AuthorCoursesDashboard = () => {
  const { data: courseData, isLoading: courseLoading } = useGetCreatorCourseQuery();
  const { data: userData, isLoading: userLoading } = useGetAllUsersQuery();
  const { data: categoryData } = useGetCategoriesQuery();
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const currentAuthorId = user?._id;

  const getCategoryName = (categoryId) => {
    const categoriesList = categoryData?.categories || [];
    const category = categoriesList.find(cat => cat._id === categoryId);
    return category ? category.name : categoryId || "Unknown Category";
  };

  const toggleCourseDetails = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  const toggleUserDetails = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  if (courseLoading || userLoading) return <PageLoader />;

  const publishedCourses = (courseData?.courses || []).filter(course => course.isPublished);
  const allUsers = userData?.users || [];
  
  // Filter users who are enrolled in the current author's courses
  const enrolledUsers = allUsers.filter(user => 
    user.enrolledCourses?.some(enrollment => 
      publishedCourses.some(course => course._id === enrollment._id)
    )
  );

  return (
    <div className="w-full max-w-8xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Author Dashboard</h1>
      
      <Tabs defaultValue="courses" className="w-full">
        <TabsList>
          <TabsTrigger value="courses">Published Courses</TabsTrigger>
          <TabsTrigger value="users">Student Management</TabsTrigger>
        </TabsList>

        {/* Published Courses Tab */}
        <TabsContent value="courses">
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{publishedCourses.length}</div>
                  <p className="text-xs text-muted-foreground">Published courses</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {publishedCourses.reduce((total, course) => total + (course.enrolledStudents?.length || 0), 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Enrolled students</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{enrolledUsers.length}</div>
                  <p className="text-xs text-muted-foreground">Currently enrolled</p>
                </CardContent>
              </Card>
            </div>

            {/* Courses Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200 dark:border-gray-700">
                    <TableHead className="font-medium text-gray-700 dark:text-gray-300">Course</TableHead>
                    <TableHead className="font-medium text-gray-700 dark:text-gray-300">Category</TableHead>
                    <TableHead className="font-medium text-gray-700 dark:text-gray-300">Students</TableHead>
                    <TableHead className="font-medium text-gray-700 dark:text-gray-300">Avg Progress</TableHead>
                    <TableHead className="font-medium w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publishedCourses.length > 0 ? (
                    publishedCourses.map((course) => (
                      <React.Fragment key={course._id}>
                        <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <TableCell className="py-4">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {course.courseTitle}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {course.courseLevel} • {course.courseDuration}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge variant="outline" className="text-xs">
                              {getCategoryName(course.category)}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">
                                {course.enrolledStudents?.length || 0}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-sm font-medium">
                              {course.enrolledStudents?.length > 0 
                                ? Math.round(course.enrolledStudents.reduce((sum, student) => 
                                    sum + (student.progress || 0), 0) / course.enrolledStudents.length
                                  )
                                : 0}%
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCourseDetails(course._id)}
                              className="h-8 w-8 p-0"
                            >
                              {expandedCourse === course._id ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                                                 {expandedCourse === course._id && (
                           <TableRow>
                             <TableCell colSpan={5} className="p-0">
                               <CourseStudentsPanel course={course} allUsers={allUsers} />
                             </TableCell>
                           </TableRow>
                         )}
                      </React.Fragment>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-gray-500 dark:text-gray-400">
                        No published courses found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Student Management Tab */}
        <TabsContent value="users">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 dark:border-gray-700">
                  <TableHead className="font-medium text-gray-700 dark:text-gray-300">Student</TableHead>
                  <TableHead className="font-medium text-gray-700 dark:text-gray-300">Enrolled Courses</TableHead>
                  <TableHead className="font-medium text-gray-700 dark:text-gray-300">Avg Progress</TableHead>
                  <TableHead className="font-medium w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrolledUsers.length > 0 ? (
                  enrolledUsers.map((user) => (
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
                              <div className="font-medium text-gray-900 dark:text-white">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge variant="outline" className="text-xs">
                            {user.enrolledCourses?.filter(enrollment => 
                              publishedCourses.some(course => course._id === enrollment._id)
                            ).length || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm font-medium">
                            {(() => {
                              const authorCourses = user.enrolledCourses?.filter(enrollment => 
                                publishedCourses.some(course => course._id === enrollment._id)
                              ) || [];
                              return authorCourses.length > 0 
                                ? Math.round(authorCourses.reduce((sum, course) => 
                                    sum + (course.progress || 0), 0) / authorCourses.length
                                  )
                                : 0;
                            })()}%
                          </div>
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
                            <UserEnrollmentsPanel user={user} publishedCourses={publishedCourses} getCategoryName={getCategoryName} />
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-gray-500 dark:text-gray-400">
                      No students enrolled in your courses
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const CourseStudentsPanel = ({ course, allUsers }) => {
  // Try different possible field names for enrolled students
  const enrolledStudents = course.enrolledStudents || course.students || course.enrollments || [];
  
  if (enrolledStudents.length === 0) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-700 text-center">
        <p className="text-gray-500 dark:text-gray-400">No students enrolled in this course</p>
      </div>
    );
  }
  
  // Match enrolled students with full user data
  const studentsWithDetails = enrolledStudents.map(enrollment => {
    // Check if enrollment is a direct user object
    if (enrollment.firstName && enrollment.lastName) {
      return {
        ...enrollment,
        progress: enrollment.progress || 0
      };
    }
    
    if (typeof enrollment === 'string') {
      const fullUser = allUsers.find(user => user._id === enrollment);
      
      if (fullUser) {
        return {
          ...fullUser,
          progress: 0 
        };
      }
    }
    
    // Try to extract student ID from different possible structures
    let studentId = null;
    let progress = 0;
    
    if (enrollment.studentId) studentId = enrollment.studentId;
    else if (enrollment.userId) studentId = enrollment.userId;
    else if (enrollment.student?._id) studentId = enrollment.student._id;
    else if (enrollment._id) studentId = enrollment._id;
    else if (enrollment.user?._id) studentId = enrollment.user._id;
    
    // Try to extract progress
    if (enrollment.progress !== undefined) progress = enrollment.progress;
    else if (enrollment.completionPercentage !== undefined) progress = enrollment.completionPercentage;
    
    const fullUser = allUsers.find(user => user._id === studentId);
    
    if (fullUser) {
      return {
        ...fullUser,
        progress: progress
      };
    } else {

      return {
        ...enrollment,
        progress: progress
      };
    }
  }).filter(student => student.firstName || student.name); // Show students with any name field
  
  if (studentsWithDetails.length === 0) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-700 text-center">
        <p className="text-gray-500 dark:text-gray-400">No student details available</p>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-700 space-y-4">
      <h4 className="font-medium text-gray-900 dark:text-white mb-4">
        Students enrolled in "{course.courseTitle}"
      </h4>
      {studentsWithDetails.map((student) => {
        const progress = student.progress || 0;
        
        return (
          <div key={student._id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                  {student.photoUrl ? (
                    <img 
                      src={student.photoUrl} 
                      alt={student.name} 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <User className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {student.firstName} {student.lastName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{student.email}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{progress}%</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Complete</div>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{progress}%</span>
              </div>
              <Progress 
                value={progress} 
                className="h-2"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const UserEnrollmentsPanel = ({ user, publishedCourses, getCategoryName }) => {
  const navigate = useNavigate();
  const enrolledCourses = user.enrolledCourses || [];
  
  // Filter only courses published by the current author
  const authorCourses = enrolledCourses.filter(enrollment => 
    publishedCourses.some(course => course._id === enrollment._id)
  );
  
  if (authorCourses.length === 0) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-700 text-center">
        <p className="text-gray-500 dark:text-gray-400">No courses enrolled from this author</p>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-700 space-y-4">
      <h4 className="font-medium text-gray-900 dark:text-white mb-4">
        Courses enrolled by {user.firstName} {user.lastName}
      </h4>
      {authorCourses.map((course) => {
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
                onClick={() => navigate(`/course/${course._id}`)}
                className="flex-1"
              >
                View Course
              </Button>
        </div>
        </div>
        );
      })}
    </div>
  );
};

export default AuthorCoursesDashboard;
