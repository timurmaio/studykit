import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import "bootstrap/dist/css/bootstrap-reboot.min.css";
import "bootstrap/dist/css/bootstrap-grid.min.css";
import "./index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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

function Root() {
  return (
    <BrowserRouter>
      <App />
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        {/* <Route path="about" element={<About />} /> */}

        <Route index element={<Navigate replace to="/courses" />} />

        {/* <Route component={App}> */}
        {/* <Redirect from="/" to="/courses" /> */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<Course />} />
        <Route
          path="/courses/:id/lectures/:lectureId/contents/:contentId"
          element={<ShowContent />}
        />

        <Route path="/learning" element={<Learning />} />
        <Route path="/teaching" element={<Profile />} />

        <Route path="*" element={<NotFound />} />

        {/*<Route path="/courses/:id/contents/new" component={NewCourse} />*/}
        {/* </Route> */}
      </Routes>
    </BrowserRouter>
  );
}

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container); // createRoot(container!) if you use TypeScript

root.render(
  <StrictMode>
    <Root />
  </StrictMode>
);
