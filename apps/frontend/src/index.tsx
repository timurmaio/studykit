import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import "./index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { App } from "./containers/App";
import { Courses } from "./containers/Courses";
import { Learning } from "./containers/Learning";
import { Profile } from "./containers/Profile";
import { SignIn } from "./containers/SignIn";
import { SignUp } from "./containers/SignUp";

import { Course } from "./components/Course";
// import NewCourse from "./components/NewCourse";
import { ShowContent } from "./components/ShowContent";
import { NotFound } from "./components/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";

function Root() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        {/* <Route path="about" element={<About />} /> */}

            <Route index element={<Navigate replace to="/courses" />} />

            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<Course />} />
            <Route
              path="/courses/:id/lectures/:lectureId/contents/:contentId"
              element={<ShowContent />}
            />

            <Route path="/learning" element={<ProtectedRoute><Learning /></ProtectedRoute>} />
            <Route path="/teaching" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container); // createRoot(container!) if you use TypeScript

root.render(
  <StrictMode>
    <Root />
  </StrictMode>
);
