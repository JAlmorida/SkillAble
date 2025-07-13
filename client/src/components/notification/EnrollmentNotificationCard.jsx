import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow, format } from "date-fns";
import { BookOpen, Calendar, Clock } from "lucide-react";

const EnrollmentNotificationCard = ({ enrollment }) => {
  const { course, enrolledAt, expiresAt, isExpired } = enrollment;
  
  const formatExpiryDate = (date) => {
    if (!date) return null;
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const getTimeAgo = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <Card className="bg-base-200 hover:shadow-md transition-shadow"> 
      <CardContent className="p-4">
        <div className='flex items-center gap-3 mb-3'>
          <div className='rounded-full overflow-hidden w-12 h-12 bg-muted flex items-center justify-center'>
            {course?.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className='font-semibold truncate'>{course?.title || 'Course'}</h3>
              <Badge variant={isExpired ? "destructive" : "default"} className="text-xs">
                {isExpired ? "Expired" : "Enrolled"}
              </Badge>
            </div>
            <div className='text-xs text-muted-foreground mb-1'>
              You have successfully enrolled in this course
            </div>
            {expiresAt ? (
              <div className='text-xs text-gray-400 flex items-center gap-1'>
                <Calendar className="h-3 w-3" />
                Expires: {formatExpiryDate(expiresAt)}
                {isExpired && (
                  <span className="text-red-500 ml-1">(Expired)</span>
                )}
              </div>
            ) : (
              <div className='text-xs text-gray-400 flex items-center gap-1'>
                <Clock className="h-3 w-3" />
                No expiry date
              </div>
            )}
            <div className='text-xs text-gray-400 mt-1'>
              Enrolled {getTimeAgo(enrolledAt)}
            </div>
          </div>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link to={`/course-progress/${course?._id || course?.courseId}`}>
            {isExpired ? "View Course" : "Continue Learning"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default EnrollmentNotificationCard 