import React from 'react';
import { useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

// RTK Query hooks
import { useGetQuizByIdQuery } from '@/features/api/quizApi';
import { useGetQuizQuestionsQuery } from '@/features/api/questionApi';

// shadcn UI components
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';

// Your components
import QuizQuestion from '@/components/quizUi/attemptQuiz/QuizQuestion';

const AttemptQuiz = () => {
    const { id: quizId } = useParams();
    
    // Use RTK Query hooks
    const { data: quizDetails, isLoading: detailsLoading } = useGetQuizByIdQuery(quizId);
    const { data: quizQuestionsData, isLoading: questionsLoading } = useGetQuizQuestionsQuery(quizId);
    
    // Extract questions from response data structure
    const quizQuestions = quizQuestionsData?.data || [];
    
    return (
        <section className="min-h-[90vh] py-10 container max-w-5xl mx-auto px-4">
            <Card className="border-slate-600 bg-slate-900 mb-8">
                <CardHeader>
                    {detailsLoading ? (
                        <Skeleton className="h-8 w-3/4" />
                    ) : (
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <CardTitle className="text-xl md:text-2xl line-clamp-2">
                                {quizDetails?.data?.quizTitle || quizDetails?.data?.title}
                            </CardTitle>
                            <Badge variant="outline" className="flex items-center gap-2 px-3 py-1.5">
                                <Clock className="h-4 w-4" />
                                <span>{quizDetails?.data?.quizTimer || quizDetails?.data?.timer} minutes</span>
                            </Badge>
                        </div>
                    )}
                </CardHeader>
                
                <CardContent>
                    {detailsLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <CardDescription className="text-slate-300 line-clamp-2 text-base">
                                {quizDetails?.data?.description}
                            </CardDescription>
                            <div className="flex items-center gap-3 text-slate-300 text-sm whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                    <User className="h-3.5 w-3.5" />
                                    <span>{quizDetails?.data?.createdBy?.username}</span>
                                </div>
                                <span>•</span>
                                <span>
                                    {quizDetails?.data?.createdAt && 
                                     formatDistanceToNow(new Date(quizDetails.data.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {detailsLoading || questionsLoading ? (
                <Card className="border-slate-600 bg-slate-900">
                    <CardContent className="p-8">
                        <div className="flex justify-center items-center min-h-[40vh]">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 rounded-full border-4 border-slate-600 border-t-slate-300 animate-spin" />
                                <p>Loading quiz...</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <QuizQuestion 
                    quizDetails={quizDetails?.data} 
                    quizQuestions={quizQuestions} 
                />
            )}
        </section>
    );
};

export default AttemptQuiz;