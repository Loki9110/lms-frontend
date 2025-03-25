import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import HeroSection from "./pages/student/HeroSection";
import MainLayout from "./layout/MainLayout";
import Courses from "./pages/student/Courses";
import MyLearning from "./pages/student/MyLearning";
import Profile from "./pages/student/Profile";
import Sidebar from "./pages/admin/Sidebar";
import Dashboard from "./pages/admin/Dashboard";
import CourseTable from "./pages/admin/course/CourseTable";
import CourseEditor from "./pages/admin/course/CourseEditor";
import EditLecture from "./pages/admin/lecture/EditLecture";
import CourseDetail from "./pages/student/CourseDetail";
import CourseProgress from "./pages/student/CourseProgress";
import SearchPage from "./pages/student/SearchPage";
import DummyPayment from "./pages/student/DummyPayment";
import {
  AdminRoute,
  AuthenticatedUser,
  ProtectedRoute,
} from "./components/ProtectedRoutes";
import PurchaseCourseProtectedRoute from "./components/PurchaseCourseProtectedRoute";
import { ThemeProvider } from "./components/ThemeProvider";
import PhoneVerification from "./pages/PhoneVerification";
import ErrorBoundary from "./components/ErrorBoundary";
import Users from "./pages/admin/Users";
import PurchaseRequests from "./pages/admin/PurchaseRequests";
import { Toaster } from "react-hot-toast";
import PaymentRequest from "./pages/student/PaymentRequest";

// Instructor Pages
import InstructorDashboard from "./pages/instructor/Dashboard";
import CreateCourse from "./pages/instructor/CreateCourse";
import EditCourse from "./pages/instructor/EditCourse";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorBoundary />,
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    },
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
        path: "verify-phone",
        element: <PhoneVerification />,
      },
      {
        path: "my-learning",
        element: (
          <ProtectedRoute>
            <MyLearning />
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
        errorElement: <ErrorBoundary />,
      },
      {
        path: "dummy-payment/:paymentId",
        element: (
          <ProtectedRoute>
            <DummyPayment />
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />,
      },
      {
        path: "student/dummy-payment/:courseId",
        element: (
          <ProtectedRoute>
            <DummyPayment />
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />,
      },
      {
        path: "course-progress/:courseId",
        element: (
          <ProtectedRoute>
            <PurchaseCourseProtectedRoute>
              <CourseProgress />
            </PurchaseCourseProtectedRoute>
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />,
      },
      {
        path: "payment-request/:courseId",
        element: (
          <ProtectedRoute>
            <PaymentRequest />
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />,
      },

      // Instructor routes
      {
        path: "instructor/dashboard",
        element: (
          <AdminRoute>
            <InstructorDashboard />
          </AdminRoute>
        ),
        errorElement: <ErrorBoundary />,
      },
      {
        path: "instructor/courses/create",
        element: (
          <AdminRoute>
            <CreateCourse />
          </AdminRoute>
        ),
        errorElement: <ErrorBoundary />,
      },
      {
        path: "instructor/courses/edit/:courseId",
        element: (
          <AdminRoute>
            <EditCourse />
          </AdminRoute>
        ),
        errorElement: <ErrorBoundary />,
      },

      // admin routes start from here
      {
        path: "admin",
        element: (
          <AdminRoute>
            <Sidebar />
          </AdminRoute>
        ),
        errorElement: <ErrorBoundary />,
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
            element: <CourseEditor />,
          },
          {
            path: "course/edit/:courseId",
            element: <CourseEditor />,
          },
          {
            path: "course/:courseId/lecture",
            element: <Navigate to="/admin/course/edit/:courseId" replace />,
          },
          {
            path: "course/:courseId/lecture/:lectureId",
            element: <EditLecture />,
          },
          {
            path: "users",
            element: <Users />,
          },
          {
            path: "allow-access",
            element: <Navigate to="/admin/purchase-requests" replace />,
          },
          {
            path: "purchase-requests",
            element: <PurchaseRequests />,
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
      <Toaster position="top-right" />
    </main>
  );
}

export default App;

// // xmofxzxhksdvkcnd