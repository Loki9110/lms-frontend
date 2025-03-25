import { lazy } from 'react';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';

// Lazy load components
const Home = lazy(() => import('../pages/Home'));
const Courses = lazy(() => import('../pages/student/Courses'));
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const CourseDetails = lazy(() => import('../pages/student/CourseDetails'));
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const EditCourse = lazy(() => import('../pages/admin/course/EditCourse'));

export const routes = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'courses',
        element: <Courses />,
      },
      {
        path: 'course/:courseId',
        element: <CourseDetails />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: 'course/edit/:courseId',
        element: <EditCourse />,
      },
    ],
  },
]; 