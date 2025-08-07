import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
    <Card className="bg-base-200 hover:shadow-md transition-shadow p-2">
      <CardContent className="p-2">
        <div className='flex items-center gap-2 mb-2'>
          <div className='rounded-full overflow-hidden w-8 h-8 bg-muted flex items-center justify-center'>
            {course?.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className='font-semibold break-words text-sm'>{course?.title || 'Course'}</h3>
              <Badge variant={isExpired ? "destructive" : "default"} className="text-[10px] px-1 py-0.5">
                {isExpired ? "Expired" : "Enrolled"}
              </Badge>
            </div>
            <div className='text-xs text-muted-foreground mb-0.5'>
              You have successfully enrolled in this course
            </div>
            {expiresAt ? (
              <div className='text-[10px] text-gray-400 flex items-center gap-1'>
                <Calendar className="h-3 w-3" />
                Expires: {formatExpiryDate(expiresAt)}
                {isExpired && (
                  <span className="text-red-500 ml-1">(Expired)</span>
                )}
              </div>
            ) : (
              <div className='text-[10px] text-gray-400 flex items-center gap-1'>
                <Clock className="h-3 w-3" />
                No expiry date
              </div>
            )}
            <div className='text-[10px] text-gray-400 mt-0.5'>
              Enrolled {getTimeAgo(enrolledAt)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default EnrollmentNotificationCard 