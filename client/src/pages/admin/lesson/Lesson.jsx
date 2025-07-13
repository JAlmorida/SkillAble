import { Edit } from 'lucide-react';
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const Lesson = ({ lesson, lectureId, courseId, index }) => {
    const navigate = useNavigate();
    
    const goToUpdateLesson = () => {
        if (!lectureId) {
            alert("Lecture information is missing!");
            return;
        }
        navigate(`/admin/course/${courseId}/lecture/${lectureId}/lesson/${lesson._id}/edit`);
    }
    
    return (
        <div className="flex items-center justify-between bg-[#F7F9FA] dark:bg-[#1F1F1F] px-4 py-2 rounded-md my-2">
            <h1 className="font-bold text-gray-800 dark:text-gray-100">
                Lesson - {index + 1}: {lesson.lessonTitle}
            </h1>
            <Edit
                size={20}
                className="cursor-pointer text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                onClick={goToUpdateLesson}
            />
        </div>
    )
}

export default Lesson