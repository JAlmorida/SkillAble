import { createBrowserRouter, Navigate, RouterProvider, } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import MainLayout from "./layout/MainLayout.jsx";
import Login from "./pages/Login.jsx";
import HeroSection from "./pages/student/HeroSection.jsx";
import Courses from "./pages/student/Courses.jsx";
import MyCourses from "./pages/student/MyCourses.jsx";
import Profile from "./pages/student/Profile.jsx";
import Sidebar from "./pages/admin/Sidebar.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import CourseTable from "./pages/admin/course/CourseTable.jsx";
import AddCourse from "./pages/admin/course/AddCourse.jsx";
import EditCourse from "./pages/admin/course/EditCourse.jsx";
import CreateLecture from "./pages/admin/lecture/CreateLecture.jsx";
import EditLecture from "./pages/admin/lecture/EditLecture.jsx";
import CourseDetail from "./pages/student/CourseDetail.jsx";
import CourseProgress from "./pages/student/courseProgress.jsx";
import SearchPage from "./pages/student/searchPage.jsx";
import { AdminRoute, AuthenticatedUser, ProtectedRoute } from "./components/ProtectedRoutes.jsx";
import EnrollCourseProtectedRoute from "./components/EnrollCourseProtectedRoute.jsx";
import { ThemeProvider } from "./components/ThemeProvider.jsx";
import ChatPage from "./pages/student/ChatPage.jsx";
import Register from "./pages/Register.jsx";
import NotificationPage from "./pages/student/NotificationPage.jsx";


const appRouter = createBrowserRouter([
  {
    path: "/",
    element: (
        <MainLayout />
    ),
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <>
              <HeroSection/>
              <Courses />
            </>
          </ProtectedRoute>
        ),
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
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
            <ChatPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "notification",
        element: (
          <ProtectedRoute>
            <NotificationPage />
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
