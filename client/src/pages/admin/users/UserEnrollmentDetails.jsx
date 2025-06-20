import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetUserEnrollmentsQuery } from '@/features/api/userApi';
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
  const { data, isLoading, error } = useGetUserEnrollmentsQuery(userId, {
    skip: !userId // Skip query if userId doesn't exist
  });

  if (isLoading) return <PageLoader />;

  if (error) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading User Data</h1>
        <p className="text-gray-600 mb-6">{error.message || "There was an error loading the user's enrollment details."}</p>
        <Button onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to User Management
        </Button>
      </div>
    );
  }

  const { user, enrollmentDetails } = data;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => navigate('/admin/users')}>
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
                  {enrollmentDetails.map((enrollment) => (
                    Array.isArray(enrollment.quizzes) && enrollment.quizzes.length > 0 ? (
                      <div key={enrollment.course._id} className="space-y-2">
                        <h3 className="font-medium border-b pb-2">{enrollment.course.title}</h3>
                        <div className="grid gap-2">
                          {enrollment.quizzes.map((quiz, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium">{quiz.quizTitle}</p>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      {new Date(quiz.completedAt).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <Badge className={
                                    quiz.score / quiz.total >= 0.7 ? 'bg-green-500' :
                                    quiz.score / quiz.total >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                                  }>
                                    {quiz.score}/{quiz.total} ({Math.round(quiz.score / quiz.total * 100)}%)
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null
                  ))}

                  {enrollmentDetails.every(enrollment => (enrollment.quizzes?.length ?? 0) === 0) && (
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