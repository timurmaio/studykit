import { useState, useEffect } from "react";
import { CourseCard } from "../../components/CourseCard";
import type { CourseItem } from "../../types/Course";
import { API_URL } from "../../config";

export function Courses() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_URL}/api/courses`)
      .then((res) => res.json())
      .then((json) => setCourses(json))
      .catch(() => setCourses([]))
      .finally(() => setIsLoading(false));
  }, []);

  function renderCourseCard(courseItem: CourseItem) {
    return (
      <div key={courseItem.id} className="col-12 col-md-6 col-lg-3 mb-24">
        <CourseCard {...courseItem} />
      </div>
    );
  }

  function renderSkeletonCard(_: unknown, index: number) {
    return (
      <div key={`skeleton-${index}`} className="col-12 col-md-6 col-lg-3 mb-24">
        <div className="courses-skeleton-card" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="container courses-page">
      <header className="courses-hero mb-32">
        <p className="courses-kicker mb-16">StudyKit</p>
        <h1 className="courses-title mb-16">
          <span>Каталог</span>
          <em>курсов</em>
        </h1>
        <p className="courses-subtitle mb-0">
          Выбирай траекторию и отмечай прогресс по мере прохождения уроков.
        </p>
      </header>
      {isLoading ? (
        <div className="row">
          {Array.from({ length: 8 }).map(renderSkeletonCard)}
        </div>
      ) : courses.length ? (
        <div className="row courses-grid">{courses.map(renderCourseCard)}</div>
      ) : (
        <div className="courses-empty">Курсы скоро появятся</div>
      )}
    </div>
  );
}
