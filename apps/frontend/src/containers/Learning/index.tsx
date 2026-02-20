import { useState, useEffect } from "react";
import { API_URL } from "../../config";
import { CourseCard } from "../../components/CourseCard";
import type { CourseItem } from "../../types/Course";

export function Learning() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    fetch(`${API_URL}/api/courses?participated_by=${userId}`)
      .then((res) => res.json())
      .then((data) => setCourses(data));
  }, []);

  function renderCourseCard(course: CourseItem) {
    return (
      <div className="col-3" key={course.id}>
        <CourseCard {...course} />
      </div>
    );
  }

  return (
    <div className="container">
      {courses.length ? (
        <div className="row">{courses.map(renderCourseCard)}</div>
      ) : (
        <span className="text-center mt-40">У вас ещё нет курсов.</span>
      )}
    </div>
  );
}
