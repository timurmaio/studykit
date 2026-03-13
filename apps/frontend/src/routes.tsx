import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  redirect,
  useLoaderData,
} from "react-router-dom";
import { apiGet } from "./config";
import { AuthProvider } from "./contexts/AuthContext";
import { App } from "./containers/App";
import { Courses } from "./containers/Courses";
import { Learning } from "./containers/Learning";
import { SignIn } from "./containers/SignIn";
import { SignUp } from "./containers/SignUp";
import { Course } from "./components/Course";
import { ShowContent } from "./components/ShowContent";
import { NotFound } from "./components/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { TeacherRoute } from "./components/TeacherRoute";
import { NewCourse } from "./components/NewCourse";
import { ErrorBoundary } from "./components/ErrorBoundary";
import type { CourseItem } from "./types/Course";

const Profile = lazy(() =>
  import("./containers/Profile").then((m) => ({ default: m.Profile }))
);
const Teaching = lazy(() =>
  import("./containers/Teaching").then((m) => ({ default: m.Teaching }))
);
const CourseAnalytics = lazy(() =>
  import("./containers/CourseAnalytics").then((m) => ({ default: m.CourseAnalytics }))
);

function RootLayout() {
  return (
    <AuthProvider>
      <App />
      <Outlet />
    </AuthProvider>
  );
}

function LoadingFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 text-center">Загрузка...</div>
  );
}

export const coursesLoader = async () => {
  const courses = await apiGet<CourseItem[]>("/api/courses");
  return { courses };
};

export const learningLoader = async () => {
  try {
    const user = await apiGet<{ id: number }>("/api/users/me");
    const courses = await apiGet<CourseItem[]>(
      `/api/courses?enrolled=${user.id}`
    );
    return { courses };
  } catch {
    return redirect("/signin");
  }
};

export const profileLoader = async () => {
  try {
    const user = await apiGet<{
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    }>("/api/users/me");
    const [userDetails, courses] = await Promise.all([
      apiGet<{ firstName: string; lastName: string; email: string }>(
        `/api/users/${user.id}`
      ),
      apiGet<unknown[]>(`/api/users/${user.id}/courses`),
    ]);
    return {
      user: userDetails,
      courses: courses || [],
    };
  } catch {
    return redirect("/signin");
  }
};

export const courseLoader = async ({
  params,
}: {
  params: { id?: string };
}) => {
  if (!params.id) throw new Response("Not Found", { status: 404 });
  try {
    const course = await apiGet<CourseItem>(`/api/courses/${params.id}`);
    let participating = false;
    try {
      const data = await apiGet<{ participating: boolean }>(
        `/api/courses/${params.id}/enrollment`
      );
      participating = data.participating;
    } catch {
      // ignore
    }
    return { course, participating, error: null as string | null };
  } catch {
    return {
      course: null,
      participating: false,
      error: "Не удалось загрузить страницу курса",
    } as { course: CourseItem | null; participating: boolean; error: string };
  }
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/courses" replace /> },
      { path: "signin", element: <SignIn /> },
      { path: "signup", element: <SignUp /> },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <Profile />
              </Suspense>
            </ErrorBoundary>
          </ProtectedRoute>
        ),
        loader: profileLoader,
      },
      {
        path: "courses",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Courses />
          </Suspense>
        ),
        loader: coursesLoader,
      },
      {
        path: "courses/:id",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Course />
          </Suspense>
        ),
        loader: courseLoader,
      },
      {
        path: "courses/:id/teach",
        element: (
          <TeacherRoute>
            <NewCourse />
          </TeacherRoute>
        ),
      },
      {
        path: "courses/:id/analytics",
        element: (
          <TeacherRoute>
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <CourseAnalytics />
              </Suspense>
            </ErrorBoundary>
          </TeacherRoute>
        ),
      },
      {
        path: "courses/:id/lectures/:lectureId/contents/:contentId",
        element: <ShowContent />,
      },
      {
        path: "learning",
        element: (
          <ProtectedRoute>
            <Learning />
          </ProtectedRoute>
        ),
        loader: learningLoader,
      },
      {
        path: "teaching",
        element: (
          <TeacherRoute>
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <Teaching />
              </Suspense>
            </ErrorBoundary>
          </TeacherRoute>
        ),
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

type CoursesData = { courses: CourseItem[] };
type LearningData = { courses: CourseItem[] };
type ProfileData = {
  user: { firstName: string; lastName: string; email: string };
  courses: unknown[];
};
type CourseData = {
  course: CourseItem | null;
  participating: boolean;
  error: string | null;
};

export function useCoursesLoaderData(): CoursesData {
  return useLoaderData() as CoursesData;
}

export function useLearningLoaderData(): LearningData {
  return useLoaderData() as LearningData;
}

export function useProfileLoaderData(): ProfileData {
  return useLoaderData() as ProfileData;
}

export function useCourseLoaderData(): CourseData {
  return useLoaderData() as CourseData;
}
