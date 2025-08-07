import { Home } from "lucide-react";
import { useNavigate, useLocation, matchPath } from "react-router-dom";

const FloatingHomeButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // List of routes where the button should be hidden
  const hiddenRoutes = [
    "/login",
    "/register",
    "/reset-password",
    "/reset-password/:token",
    "/author/*",
    "/student/quiz/:courseId/:quizId",
    "/course-progress/:courseId/quiz/:quizId/quiz-results",
    // Chat-related routes
    "/chat",
    "/groupchat/:channelId",
    "/groupchat/:channelId/videocall",
    "/message/:userId",
    "/call/:id",
    "/groupcall/:id",
  ];

  // Exception: show on /author/course (CourseTable)
  const courseTablePath = "/author/course";
  const isAuthorCourseTable = matchPath({ path: courseTablePath, end: true }, location.pathname);

  const shouldHide = hiddenRoutes.some(pattern => {
    // Don't hide if it's the course table
    if (pattern === "/author/*" && isAuthorCourseTable) return false;
    return matchPath({ path: pattern, end: pattern.indexOf(":") === -1 }, location.pathname);
  });

  if (shouldHide) {
    return null;
  }

  return (
    <button
      onClick={() => navigate("/")}
      className="
        fixed bottom-6 right-6 z-50
        bg-blue-600 hover:bg-blue-700
        text-white rounded-full shadow-lg
        w-14 h-14 flex items-center justify-center
        transition-all duration-200
        border-4 border-white
      "
      aria-label="Go to Home"
    >
      <Home size={28} />
    </button>
  );
};

export default FloatingHomeButton;
