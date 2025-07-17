import React, { useState, useEffect } from 'react';
import { useGetCourseProgressHistoryQuery } from '@/features/api/courseProgressApi';
import { useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from "lucide-react";

const statusColor = (status) =>
  status === "completed" ? "bg-green-500 text-white" : "bg-yellow-500 text-white";

const ProgressHistory = ({ courseTitle: propCourseTitle }) => {
  const { courseId } = useParams();
  const { data, isLoading, error, refetch } = useGetCourseProgressHistoryQuery(courseId);

  // Refetch progress when this page loads
  useEffect(() => {
    refetch();
  }, [refetch]);

  const progressData = data?.lectures || data || [];
  const courseTitle =
    propCourseTitle ||
    data?.courseTitle ||
    (Array.isArray(data) && data[0]?.courseTitle) ||
    (progressData[0]?.courseTitle) ||
    "Course";

  const [openLecture, setOpenLecture] = useState(() =>
    progressData && progressData.length > 0 ? progressData[0].lectureId : null
  );

  useEffect(() => {
    if (progressData && progressData.length > 0 && !openLecture) {
      setOpenLecture(progressData[0].lectureId);
    }
  }, [progressData]);

  let totalCourseScore = 0;
  let totalCoursePossible = 0;

  const getLectureTotals = (lecture) => {
    let score = 0, possible = 0;
    lecture.lessons.forEach(lesson => {
      if (lesson.quiz) {
        score += lesson.quiz.score || 0;
        possible += lesson.quiz.total || 0;
      }
    });
    return { score, possible };
  };

  progressData.forEach(lecture => {
    const { score, possible } = getLectureTotals(lecture);
    totalCourseScore += score;
    totalCoursePossible += possible;
  });

  const totalPercentage = totalCoursePossible > 0
    ? Math.round((totalCourseScore / totalCoursePossible) * 100)
    : 0;

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">Error loading progress history.</div>;

  return (
    <div className="p-4 max-w-full h-full flex flex-col">
      <h2 className="text-xl font-bold mb-2">{courseTitle}</h2>
      <h3 className="text-lg font-semibold mb-3">Lectures</h3>
      <div className="flex-1 overflow-y-auto pr-1">
        {progressData.map((lecture) => {
          const { score: lectureScore, possible: lecturePossible } = getLectureTotals(lecture);
          const isOpen = openLecture === lecture.lectureId;
          return (
            <div key={lecture.lectureId} className="mb-2 border-b border-slate-700">
              <button
                className="w-full flex items-center justify-between px-2 py-2 bg-slate-800 hover:bg-slate-700 rounded transition"
                onClick={() => setOpenLecture(isOpen ? null : lecture.lectureId)}
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-left text-sm truncate">{lecture.lectureTitle}</span>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {isOpen && (
                <div className="py-2 px-1">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-300">
                        <th className="text-left font-semibold pb-1">Quiz</th>
                        <th className="text-left font-semibold pb-1">Quiz Status</th>
                        <th className="text-left font-semibold pb-1">Quiz Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lecture.lessons.map((lesson) => (
                        lesson.quiz && (
                          <tr key={lesson.lessonId} className="align-top">
                            <td className="py-1 pr-2 max-w-[120px] truncate">{lesson.quiz.quizTitle}</td>
                            <td className="py-1 pr-2">
                              <Badge className={statusColor(lesson.quiz.status)}>
                                {lesson.quiz.status === "completed" ? "Completed" : "In Progress"}
                              </Badge>
                            </td>
                            <td className="py-1 pr-2 whitespace-nowrap">
                              {`${lesson.quiz.score || 0} / ${lesson.quiz.total || 0}`}
                            </td>
                          </tr>
                        )
                      ))}
                      <tr>
                        <td colSpan={2} className="font-bold text-right bg-slate-100 dark:bg-slate-800 py-1 pr-2">
                          Total Quiz Grading:
                        </td>
                        <td className="font-bold bg-slate-100 dark:bg-slate-800 py-1 pr-2 whitespace-nowrap">
                          {lecturePossible > 0 ? Math.round((lectureScore / lecturePossible) * 100) : 0}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
        <div className="mt-4">
          <div className="flex justify-between items-center font-bold bg-slate-200 dark:bg-slate-900 px-2 py-2 rounded">
            <span>Total Course Grade:</span>
            <span>{totalPercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressHistory;