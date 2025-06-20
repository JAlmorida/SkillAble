import { Button } from '@/components/ui/button'
import React from 'react'
import { Link, useParams } from 'react-router-dom'
import LessonTab from './LessonTab'
import { ArrowLeft } from 'lucide-react'

const EditLesson = () => {
  const params = useParams();
  const courseId = params.courseId;
  const lectureId = params.lectureId;

  return (
    <div className="flex-1">
      <div className="flex items-center mb-5 gap-2">
        <Link to={`/admin/course/${courseId}/lecture/${lectureId}`}>
          <Button size="icon" variant="outline" className="rounded-full">
            <ArrowLeft size={16} />
          </Button>
        </Link>

        <h1 className="font-bold text-xl">Add detail information regarding on your Lectures</h1>
      </div>
      <LessonTab />
    </div>
  )
}

export default EditLesson