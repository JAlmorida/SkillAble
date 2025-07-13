import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetUserEnrollmentDetailsQuery } from '@/features/api/userApi';
import PageLoader from '@/components/loadingUi/PageLoader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Calendar, Award, Clock } from 'lucide-react';

const UserEnrollmentDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  // Redirect if no userId
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
  
  // Only fetch if userId exists
  const { data, isLoading, error } = useGetUserEnrollmentDetailsQuery(userId, { skip: !userId });

  const attempts = data?.attempts || [];

  // Group attempts by course and lecture
  const groupedAttempts = {};
  (attempts || []).forEach(attempt => {
    const courseTitle = attempt.quizId?.courseId?.courseTitle || "Unknown Course";
    const lectureTitle =
      attempt.quizId?.lesson?.lecture?.lectureTitle ||
      attempt.quizId?.lesson?.lessonTitle ||
      "No lecture assigned";
    if (!groupedAttempts[courseTitle]) groupedAttempts[courseTitle] = {};
    if (!groupedAttempts[courseTitle][lectureTitle]) groupedAttempts[courseTitle][lectureTitle] = [];
    groupedAttempts[courseTitle][lectureTitle].push(attempt);
  });

  // State for open/close dropdowns
  const [openCourse, setOpenCourse] = useState({});
  const [openLecture, setOpenLecture] = useState({});

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

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => navigate('/admin/userDetails')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      {/* User Profile Card */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200">
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-2xl">{user?.name}</CardTitle>
              <p className="text-muted-foreground">{user?.email}</p>
              <Badge className="mt-1">{user?.role}</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <h2 className="text-xl font-semibold mb-4">Enrollment Details</h2>

      {enrollmentDetails?.length > 0 ? (
        <Tabs defaultValue="courses">
          <TabsList className="mb-4">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <div className="grid gap-4 md:grid-cols-2">
              {enrollmentDetails.map((enrollment) => (
                <Card key={enrollment.course?._id || Math.random()} className="overflow-hidden">
                  <CardHeader className="bg-primary/5 pb-2">
                    <CardTitle>
                      {enrollment.course?.title || enrollment.course?.courseTitle || "Untitled Course"}
                    </CardTitle>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{enrollment.course?.category || "No Category"}</Badge>
                      <Badge variant="outline">{enrollment.course?.level || enrollment.course?.courseLevel || "No Level"}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="mb-4">
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Course Progress</span>
                        <span>{enrollment.progress.completionPercentage}%</span>
                      </div>
                      <Progress value={enrollment.progress.completionPercentage} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>
                          Last Activity: {enrollment.progress.lastActivity 
                            ? new Date(enrollment.progress.lastActivity).toLocaleDateString() 
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-gray-500" />
                        <span>Status: {enrollment.progress.completed ? 'Completed' : 'In Progress'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="quizzes">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {Object.keys(groupedAttempts).length > 0 ? (
                    Object.entries(groupedAttempts).map(([courseTitle, lectures]) => (
                      <div key={courseTitle} className="mb-4">
                        {/* Course Dropdown Trigger */}
                        <div
                          className="cursor-pointer font-bold text-lg mb-2"
                          onClick={() => setOpenCourse(prev => ({ ...prev, [courseTitle]: !prev[courseTitle] }))}
                        >
                          {courseTitle} {openCourse[courseTitle] ? "▲" : "▼"}
                        </div>
                        {openCourse[courseTitle] && (
                          <div className="ml-4">
                            {Object.entries(lectures).map(([lectureTitle, attempts]) => (
                              <div key={lectureTitle} className="mb-2">
                                {/* Lecture Dropdown Trigger */}
                                <div
                                  className="cursor-pointer font-semibold text-base mb-1"
                                  onClick={() => setOpenLecture(prev => ({ ...prev, [lectureTitle]: !prev[lectureTitle] }))}
                                >
                                  {lectureTitle !== "Unknown Lecture" ? lectureTitle : "No lecture assigned"} ({attempts.length}) {openLecture[lectureTitle] ? "▲" : "▼"}
                                </div>
                                {openLecture[lectureTitle] && (
                                  <div className="ml-4">
                                    {attempts.map((attempt, idx) => (
                                      <div key={idx} className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg mb-2">
                                        <div className="flex items-center gap-2 mt-1">
                                          <Badge className="bg-blue-600 text-white">
                                            Score: {attempt.score} / {attempt.total ?? "?"}
                                          </Badge>
                                          <Badge className="bg-blue-600 text-white">
                                            Attempted: {attempt.createdAt ? new Date(attempt.createdAt).toLocaleString() : "N/A"}
                                          </Badge>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-gray-500">No quiz attempts found for this user.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-500">This user is not enrolled in any courses.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserEnrollmentDetails;