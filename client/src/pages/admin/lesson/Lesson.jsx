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
        navigate(`/author/course/${courseId}/lecture/${lectureId}/lesson/${lesson._id}/edit`);
    }
    
    return (
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
            {/* Lesson number indicator */}
            <div className="w-8 h-8 flex-shrink-0 rounded-full bg-green-600 dark:bg-green-500 text-white flex items-center justify-center font-semibold text-sm">
                {index + 1}
            </div>
            
            {/* Lesson info */}
            <div className="flex-1 min-w-0">
                <h3 className="font-medium text-base text-gray-900 dark:text-gray-100 truncate">
                    {lesson.lessonTitle}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Lesson {index + 1}
                </p>
            </div>

            {/* Edit button */}
            <div className="flex gap-2">
                <button
                    onClick={goToUpdateLesson}
                    className="p-2 rounded-full bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Edit lesson"
                >
                    <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400" />
                </button>
            </div>
        </div>
    )
}

export default Lesson