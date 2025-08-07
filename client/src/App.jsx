import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import MainLayout from "./layout/MainLayout.jsx";
import Login from "./pages/auth/Login.jsx";
import HeroSection from "./pages/student/Course/HeroSection.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import CourseTable from "./pages/admin/course/CourseTable.jsx";
import AddCourse from "./pages/admin/course/AddCourse.jsx";
import EditCourse from "./pages/admin/course/EditCourse.jsx";
import CreateLecture from "./pages/admin/lecture/CreateLecture.jsx";
import EditLecture from "./pages/admin/lecture/EditLecture.jsx";
import CourseDetail from "./pages/student/Course/CourseDetail.jsx";
import CourseProgress from "./pages/student/Course/CourseProgress.jsx";
import SearchPage from "./pages/student/User/SearchPage.jsx";
import EnrollCourseProtectedRoute from "./components/courseUi/EnrollCourseProtectedRoute.jsx";
import Register from "./pages/auth/Register.jsx";
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
import ProgressHistory from "./pages/student/Course/ProgressHistory.jsx";
import { AdminRoute, AuthorRoute, AuthenticatedUser, ProtectedRoute } from "./components/context/ProtectedRoutes.jsx";
import { ThemeProvider } from "./components/context/ThemeProvider.jsx";
import { ColorBlindProvider } from "./components/context/ColorBlindContext.jsx";
import { ZoomProvider } from "./components/context/ZoomProvider.jsx";
import { ScreenReaderProvider } from "./components/context/ScreenReaderContext.jsx";
import { ZoomWrapper } from "./components/wrapper/ZoomWrapper.jsx";
import { FeedbackProvider } from "./components/context/FeedbackContext.jsx";
import { CaptionProvider } from "./components/context/CaptionContext.jsx";
import Settings from "./pages/student/User/Settings.jsx";
import { useSelector } from "react-redux";
import LoadingSpinner from "./components/loadingUi/LoadingSpinner.jsx";
import GroupChatPage from "./pages/student/Chat/GroupChatPage.jsx";
import GroupVideoCallPage from "./pages/student/Chat/GroupVideoCallPage.jsx";
import { ResizeProvider } from "./components/context/ResizeContext.jsx";
import { ChatProvider } from "./components/context/ChatProvider.jsx";
import { EnrollmentNotificationProvider } from "@/components/context/EnrollmentNotificationProvider";
import FloatingZoomPanel from "./components/controls/FloatingZoomPanel.jsx";
import { useZoom } from "./components/context/ZoomProvider";
import ResetPassword from "./pages/auth/ResetPasswordPage.jsx";
import './index.css';
import AuthorCoursesDashboard from "./pages/author/AuthorCoursesDashboard.jsx";

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
        path:"reset-password/:token", 
        element:(
          <AuthenticatedUser>
            <ResetPassword/>
          </AuthenticatedUser>
        )
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
        path: "groupchat/:channelId",
        element: (
          <ProtectedRoute>
            <GroupChatPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "groupchat/:channelId/videocall",
        element: (
          <ProtectedRoute>
            <GroupVideoCallPage />
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
        path: "groupcall/:id",
        element: (
          <GroupVideoCallPage/>
        )
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
        path: "course-progress/:courseId/history",
        element: (
          <ProtectedRoute>
            <EnrollCourseProtectedRoute>
              <ProgressHistory />
            </EnrollCourseProtectedRoute>
          </ProtectedRoute>
        )
      },
      {
        path: "course-progress/:courseId/lecture/:lectureId/lesson/:lessonId",
        element: (
          <ProtectedRoute>
            <EnrollCourseProtectedRoute>
              <LessonView />
            </EnrollCourseProtectedRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: "/student/quiz/:courseId/:quizId",
        element: (
          <ProtectedRoute>
            <EnrollCourseProtectedRoute>
              <AttemptQuiz />
            </EnrollCourseProtectedRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: "course-progress/:courseId/quiz/:quizId/quiz-results",
        element: (
          <ProtectedRoute>
            <EnrollCourseProtectedRoute>
              <QuizResults />
            </EnrollCourseProtectedRoute>
          </ProtectedRoute>
        )
      },
      // Admin routes (dashboard and user management ONLY)
      {
        path: "admin",
        element: (
          <AdminRoute>
            <Outlet />
          </AdminRoute>
        ),
        children: [
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "userDetails",
            element: <UserManagement />
          },
          {
            path: "users/:userId/enrollments",
            element: <UserEnrollmentDetails />
          }
        ],
      },
      // Author routes (course editing/creation ONLY)
      {
        path: "author",
        element: (
          <AuthorRoute>
            <Outlet />
          </AuthorRoute>
        ),
        children: [
          {
            path: "course",
            element: <CourseTable />,
          },
          {
            path: "author/dashboard", 
            element: <AuthorCoursesDashboard/>
          },
          {
            path: "course/create",
            element: <AddCourse />,
          },
          {
            path: "course/:courseId",
            element: <EditCourse />
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
          }
        ],
      },
    ],
  },
]);

function ZoomPanelWithContext() {
  const { isZoomEnabled, zoomLevel, updateZoomLevel } = useZoom();
  return isZoomEnabled ? (
    <FloatingZoomPanel
      zoomLevel={zoomLevel}
      updateZoomLevel={updateZoomLevel}
      // onClose logic if needed
    />
  ) : null;
}

function App() {
  const user = useSelector(state => state.auth.user);

  // Handle service worker messages for mute status
  React.useEffect(() => {
    const handleServiceWorkerMessage = async (event) => {
      if (event.data && event.data.type === 'CHECK_MUTE_STATUS' && event.data.channelId) {
        try {
          // Get mute status from localStorage
          const userId = user?._id;
          if (userId) {
            const stored = localStorage.getItem(`mutedChannels_${userId}`);
            if (stored) {
              const mutedChannels = new Set(JSON.parse(stored));
              const isMuted = mutedChannels.has(event.data.channelId);
              
              // Send response back to service worker
              event.ports[0]?.postMessage({
                isMuted: isMuted
              });
            } else {
              event.ports[0]?.postMessage({
                isMuted: false
              });
            }
          } else {
            event.ports[0]?.postMessage({
              isMuted: false
            });
          }
        } catch (error) {
          console.error('Error checking mute status for service worker:', error);
          event.ports[0]?.postMessage({
            isMuted: false
          });
        }
      }
    };

    // Listen for messages from service worker
    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, [user?._id]);

  if (user === undefined) {
    return <LoadingSpinner />;
  }

  return (
    <EnrollmentNotificationProvider>
      <ChatProvider user={user}>
        <ResizeProvider user={user}>
          <FeedbackProvider user={user}>
            <ColorBlindProvider user={user}>
              <ScreenReaderProvider user={user}>
                <ZoomProvider user={user}>
                  <ThemeProvider user={user}>
                    <CaptionProvider>
                      <ZoomWrapper>
                        <ZoomPanelWithContext />
                        <RouterProvider router={appRouter} />
                      </ZoomWrapper>
                    </CaptionProvider>
                  </ThemeProvider>
                </ZoomProvider>
              </ScreenReaderProvider>
            </ColorBlindProvider>
          </FeedbackProvider>
        </ResizeProvider>
      </ChatProvider>
    </EnrollmentNotificationProvider>
  );
}

export default App;
