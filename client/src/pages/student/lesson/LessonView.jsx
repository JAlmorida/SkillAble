import LessonQuiz from '@/components/quizUi/lessonquiz/LessonQuiz';
import { useGetLectureLessonsQuery } from '@/features/api/lessonApi';
import { removeColorStyles } from '@/utils/htmlSanitizer';
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';

const LessonView = () => {
  const params = useParams();
  const lectureId = params.lessonId; // This is actually a lecture ID
  const [activeLesson, setActiveLesson] = useState(null);
  
  
  // Get all lessons for this lecture
  const { data: lectureData, isLoading: lectureLoading } = useGetLectureLessonsQuery(lectureId);
  
  // Set the first lesson as active when data loads
  useEffect(() => {
    if (lectureData?.lessons && lectureData.lessons.length > 0) {
      setActiveLesson(lectureData.lessons[0]);
      console.log("Found lessons:", lectureData.lessons);
    }
  }, [lectureData]);

  return (    
    <div className='mt-4 w-full px-0'>
      {lectureLoading ? (
        <div className="text-center text-xl">Loading...</div>
      ) : activeLesson ? (
        <div className="w-full bg-slate-900 p-10 shadow">
          <h2 className="text-2xl font-bold mb-10">{activeLesson.lessonTitle}</h2>
          {activeLesson.videoUrl && (
            <div className="mb-10 w-full">
              <video 
                src={activeLesson.videoUrl}
                controls 
                className="w-full rounded-lg"
              />
            </div>
          )}
          {activeLesson.lessonDescription && (
            <div
              className="mb-4 text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: removeColorStyles(activeLesson.lessonDescription) }}
            />
          )}
          <LessonQuiz lessonId={activeLesson._id} />
          
          {/* Lesson navigation */}
          {lectureData?.lessons?.length > 1 && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">Other Lessons in this Lecture:</h3>
              <div className="flex flex-col space-y-2">
                {lectureData.lessons.map((lesson) => (
                  <button
                    key={lesson._id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`p-2 rounded-lg transition-all duration-200 
                    ${activeLesson._id === lesson._id ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    {lesson.lessonTitle}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-xl">Lesson not Found</div>
      )}
    </div>
  )
}

export default LessonView