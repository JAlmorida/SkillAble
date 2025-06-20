import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import MainLayout from "./layout/MainLayout.jsx";
import Login from "./pages/auth/Login.jsx";
import HeroSection from "./pages/student/Course/HeroSection.jsx";
import MyCourses from "./pages/student/Course/MyCourses.jsx";
import Sidebar from "./pages/admin/Sidebar.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import CourseTable from "./pages/admin/course/CourseTable.jsx";
import AddCourse from "./pages/admin/course/AddCourse.jsx";
import EditCourse from "./pages/admin/course/EditCourse.jsx";
import CreateLecture from "./pages/admin/lecture/CreateLecture.jsx";
import EditLecture from "./pages/admin/lecture/EditLecture.jsx";
import CourseDetail from "./pages/student/Course/CourseDetail.jsx";
import CourseProgress from "./pages/student/Course/CourseProgress.jsx";
import SearchPage from "./pages/student/User/SearchPage.jsx";
import {
  AdminRoute,
  AuthenticatedUser,
  OnboardingRoute,
  ProtectedRoute,
} from "./components/ProtectedRoutes.jsx";
import EnrollCourseProtectedRoute from "./components/courseUi/EnrollCourseProtectedRoute.jsx";
import { ThemeProvider } from "./components/ThemeProvider.jsx";
import ChatHomePage from "./pages/student/Chat/ChatHomePage.jsx";
import Register from "./pages/auth/Register.jsx";
import Onboarding from "./pages/auth/Onboarding.jsx";
import NotificationsPage from "./pages/student/User/NotificationsPage.jsx";
import ChatPage from "./pages/student/Chat/ChatPage.jsx";
import CallPage from "./pages/student/Chat/CallPage.jsx";
import Courses from "./pages/student/Course/Courses.jsx";
import Profile from "./pages/student/User/Profile.jsx";
import EditLesson from "./pages/admin/lesson/EditLesson.jsx";
import LessonView from "./pages/student/lesson/LessonView.jsx";
import CreateQuestion from "./pages/admin/question/CreateQuestion.jsx";
import AttemptQuiz from "./pages/student/quiz/AttemptQuiz.jsx";
import QuizResults from "./pages/student/quiz/QuizResults.jsx";
import UserEnrollmentDetails from "./pages/admin/users/UserEnrollmentDetails.jsx";
import UserManagement from "./pages/admin/users/UserManagement.jsx";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: (
          <>
            <HeroSection />
            <Courses />
          </>
        ),
      },
      {
        path: "login",
        element: (
          <AuthenticatedUser>
            <Login />
          </AuthenticatedUser>
        ),
      },
      {
        path: "register",
        element: (
          <AuthenticatedUser>
            <Register />
          </AuthenticatedUser>
        ),
      },
      {
        path: "onboarding",
        element: (
          <OnboardingRoute>
            <Onboarding />
          </OnboardingRoute>
        ),
      },
      {
        path: "my-courses",
        element: (
          <ProtectedRoute>
            <MyCourses />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "chat",
        element: (
          <ProtectedRoute>
            <ChatHomePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "notification",
        element: (
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "message/:userId",
        element: (
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "call/:id",
        element: (
          <ProtectedRoute>
            <CallPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "course/search",
        element: (
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "course-detail/:courseId",
        element: (
          <ProtectedRoute>
            <CourseDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "course-progress/:courseId",
        element: (
          <ProtectedRoute>
            <EnrollCourseProtectedRoute>
              <CourseProgress />
            </EnrollCourseProtectedRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: "/student/quiz/:id",
        element: (
          <ProtectedRoute>
            <EnrollCourseProtectedRoute>
              <AttemptQuiz />
            </EnrollCourseProtectedRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: "course-progress/:courseId/lesson/:lessonId",
        element: (
          <ProtectedRoute>
            <EnrollCourseProtectedRoute>
              <LessonView />
            </EnrollCourseProtectedRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: "/quiz-results", 
        element: (
          <ProtectedRoute>
            <EnrollCourseProtectedRoute>
              <QuizResults/>
            </EnrollCourseProtectedRoute>
          </ProtectedRoute>
        )
      },



      // Admin routes
      {
        path: "admin",
        element: (
          <AdminRoute>
            <Sidebar />
          </AdminRoute>
        ),
        children: [
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "course",
            element: <CourseTable />,
          },
          {
            path: "course/create",
            element: <AddCourse />,
          },
          {
            path: "course/:courseId",
            element: <EditCourse />,
          },
          {
            path: "course/:courseId/lecture",
            element: <CreateLecture />,
          },
          {
            path: "course/:courseId/lecture/:lectureId",
            element: <EditLecture />,
          },
          {
            path: "course/:courseId/lecture/:lectureId/lesson/:lessonId/edit",
            element: <EditLesson />
          },
          {
            path: "course/:courseId/lecture/:lectureId/lesson/:lessonId/quiz/:quizId",
            element: <CreateQuestion />
          },
          {
            path: "userDetails", 
            element: <UserManagement/>
          }, 
          {
            path: "users/:userId/enrollments",
            element: <UserEnrollmentDetails />
          }
        ],
      },
    ],
  },
]);

function App() {
  return (
    <main>
      <ThemeProvider>
        <RouterProvider router={appRouter} />
      </ThemeProvider>
    </main>
  );
}

export default App;
