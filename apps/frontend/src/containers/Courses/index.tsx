import { useState, useEffect } from "react";
import { CourseCard } from "../../components/CourseCard";
import type { CourseItem } from "../../types/Course";
import { API_URL } from "../../config";

export function Courses() {
  const [courses, setCourses] = useState<CourseItem[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/courses`)
      .then((res) => res.json())
      .then((json) => setCourses(json));
  }, []);

  function renderCourseCard(courseItem: CourseItem) {
    return (
      <div key={courseItem.id} className="col-3 mb-24">
        <CourseCard {...courseItem} />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row">{courses.map(renderCourseCard)}</div>
    </div>
  );
}
