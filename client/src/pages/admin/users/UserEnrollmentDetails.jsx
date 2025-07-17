import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetUserEnrollmentDetailsQuery } from '@/features/api/userApi';
import PageLoader from '@/components/loadingUi/PageLoader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Calendar, Award, BookOpen, Target, TrendingUp, Clock, ChevronDown, ChevronUp, PlayCircle, Users, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { useGetCategoriesQuery } from "@/features/api/categoryApi";

const UserEnrollmentDetails = () => {
  // All hooks at the top!
  const { userId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetUserEnrollmentDetailsQuery(userId, { skip: !userId });
  const { data: categoryData } = useGetCategoriesQuery();
  const [openCourse, setOpenCourse] = useState({});
  const [openQuiz, setOpenQuiz] = useState({});

  // Group attempts by course and then by quiz
  const groupedAttempts = {};
  (data?.attempts || []).forEach(attempt => {
    const courseTitle = attempt.quizId?.courseId?.courseTitle || "Unknown Course";
    const quizTitle = attempt.quizId?.quizTitle || "Unknown Quiz";
    if (!groupedAttempts[courseTitle]) groupedAttempts[courseTitle] = {};
    if (!groupedAttempts[courseTitle][quizTitle]) groupedAttempts[courseTitle][quizTitle] = [];
    groupedAttempts[courseTitle][quizTitle].push(attempt);
  });

  // Now you can use conditional returns
  if (!userId) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-red-500 mb-4">No user selected</p>
        <Button onClick={() => navigate('/admin/users')}>
          Back to User List
        </Button>
      </div>
    );
  }

  if (isLoading) return <PageLoader />;

  if (error) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading User Data</h1>
        <p className="text-gray-600 mb-6">{error.message || "There was an error loading the user's enrollment details."}</p>
        <Button onClick={() => navigate('/admin/userDetails')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to User Management
        </Button>
      </div>
    );
  }

  const { user, enrollmentDetails } = data;

  const categoriesList = categoryData?.categories || [];

  const getCategoryName = (categoryData) => {
    // Handle case where categoryData might be an object or a string ID
    let categoryId;
    
    if (typeof categoryData === 'object' && categoryData !== null) {
      // If it's already a category object, return its name
      if (categoryData.name) {
        return categoryData.name;
      }
      // If it's an object with _id, use the _id
      categoryId = categoryData._id;
    } else {
      // If it's a string ID
      categoryId = categoryData;
    }
    
    console.log('Looking for category:', categoryId);
    console.log('Available categories:', categoriesList);
    
    const cat = categoriesList.find(c => c._id === categoryId);
    console.log('Found category:', cat);
    
    // Always return a string
    return cat ? cat.name : (typeof categoryId === 'string' ? categoryId : "No Category");
  };

  const getProgressIcon = (percentage) => {
    if (percentage === 100) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (percentage > 0) return <PlayCircle className="w-4 h-4 text-blue-500" />;
    return <AlertCircle className="w-4 h-4 text-gray-400" />;
  };

  const getProgressColor = (percentage) => {
    if (percentage === 100) return "bg-green-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500";
    if (percentage >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => navigate('/admin/userDetails')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      {/* User Profile Card */}
      <Card className="mb-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-semibold text-xl">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-2xl text-gray-900 dark:text-white">{user?.name}</CardTitle>
              <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
              <Badge className="mt-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {user?.role}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Enrollment Details</h2>

      {enrollmentDetails?.length > 0 ? (
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="mb-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Quizzes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {enrollmentDetails.map((enrollment) => (
                <Card key={enrollment.course?._id || Math.random()} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                          {enrollment.course?.title || enrollment.course?.courseTitle || "Untitled Course"}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-800">
                            {getCategoryName(enrollment.course?.category)}
                          </Badge>
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                            {enrollment.course?.level || enrollment.course?.courseLevel || "No Level"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* Progress Section */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getProgressIcon(enrollment.progress.completionPercentage)}
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Progress
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {enrollment.progress.completionPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(enrollment.progress.completionPercentage)}`}
                          style={{ width: `${enrollment.progress.completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Course Stats */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Last Activity: {enrollment.progress.lastActivity 
                            ? new Date(enrollment.progress.lastActivity).toLocaleDateString() 
                            : 'N/A'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        {enrollment.progress.completed ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              Completed
                            </span>
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-4 h-4 text-blue-500" />
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              In Progress
                            </span>
                          </>
                        )}
                      </div>

                      {enrollment.course?.enrolledStudents?.length && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {enrollment.course.enrolledStudents.length} students enrolled
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Enrollment Date */}
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span>
                          Enrolled on {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="quizzes">
            <div className="space-y-4">
              {Object.keys(groupedAttempts).length > 0 ? (
                Object.entries(groupedAttempts).map(([courseTitle, quizzes]) => (
                  <Card key={courseTitle} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <CardHeader className="pb-3">
                      <div
                        className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 -mx-6 -my-3 px-6 py-3 rounded-lg transition-colors"
                        onClick={() => setOpenCourse(prev => ({ ...prev, [courseTitle]: !prev[courseTitle] }))}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{courseTitle}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {Object.keys(quizzes).length} quiz{Object.keys(quizzes).length !== 1 ? 'es' : ''}
                          </Badge>
                          {openCourse[courseTitle] ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    {openCourse[courseTitle] && (
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {Object.entries(quizzes).map(([quizTitle, attempts]) => {
                            // Find the highest scoring attempt
                            const highestAttempt = attempts.reduce((max, curr) => curr.score > max.score ? curr : max, attempts[0]);
                            const total = highestAttempt?.totalQuestions ?? "?";
                            const percentage = total !== "?" ? Math.round((highestAttempt.score / total) * 100) : 0;
                            
                            return (
                              <div key={quizTitle} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                      <Target className="w-3 h-3 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-gray-900 dark:text-white">{quizTitle}</h4>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Last attempt: {new Date(highestAttempt.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                      <TrendingUp className="w-4 h-4 text-blue-500" />
                                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        Best: {highestAttempt.score}/{total}
                                      </span>
                                      <span className="text-sm text-gray-500">({percentage}%)</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-gray-500" />
                                      <span className="text-sm text-gray-500">
                                        {attempts.length} attempt{attempts.length !== 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Attempts History */}
                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                  <div className="grid gap-2">
                                    {attempts.map((attempt, idx) => (
                                      <div key={idx} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                          <span className="text-gray-600 dark:text-gray-400">
                                            Attempt {idx + 1}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <span className="font-medium text-gray-900 dark:text-white">
                                            {attempt.score}/{attempt.totalQuestions ?? "?"}
                                          </span>
                                          <span className="text-gray-500 text-xs">
                                            {new Date(attempt.createdAt).toLocaleString()}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))
              ) : (
                <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
                  <CardContent className="py-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Quiz Attempts</h3>
                    <p className="text-gray-500 dark:text-gray-400">This user hasn't attempted any quizzes yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Enrollments</h3>
            <p className="text-gray-500 dark:text-gray-400">This user is not enrolled in any courses.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserEnrollmentDetails;