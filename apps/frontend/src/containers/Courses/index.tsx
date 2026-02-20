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
    <div className="container courses-page">
      <header className="courses-hero mb-24">
        <p className="courses-kicker mb-8">StudyKit</p>
        <h1 className="courses-title mb-8">Каталог курсов</h1>
        <p className="courses-subtitle mb-0">
          Выбирай траекторию и отмечай прогресс по мере прохождения уроков.
        </p>
      </header>
      {courses.length ? (
        <div className="row">{courses.map(renderCourseCard)}</div>
      ) : (
        <div className="panel courses-empty">Курсы скоро появятся</div>
      )}
    </div>
  );
}
