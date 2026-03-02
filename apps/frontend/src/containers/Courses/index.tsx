import { useState, useEffect } from "react";
import { CourseCard } from "../../components/CourseCard";
import type { CourseItem } from "../../types/Course";
import { apiGet } from "../../config";

export function Courses() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    apiGet<CourseItem[]>("/api/courses")
      .then((json) => setCourses(json))
      .catch(() => setCourses([]))
      .finally(() => setIsLoading(false));
  }, []);

  function renderCourseCard(courseItem: CourseItem) {
    return (
      <div key={courseItem.id} className="mb-6">
        <CourseCard {...courseItem} />
      </div>
    );
  }

  function renderSkeletonCard(_: unknown, index: number) {
    return (
      <div key={`skeleton-${index}`} className="mb-6">
        <div className="courses-skeleton-card" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 courses-page">
      <header className="courses-hero mb-8">
        <p className="courses-kicker mb-4">StudyKit</p>
        <h1 className="courses-title mb-4">
          <span>Каталог</span>
          <em>курсов</em>
        </h1>
        <p className="courses-subtitle mb-0">
          Выбирай траекторию и отмечай прогресс по мере прохождения уроков.
        </p>
      </header>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map(renderSkeletonCard)}
        </div>
      ) : courses.length ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 courses-grid">{courses.map(renderCourseCard)}</div>
      ) : (
        <div className="courses-empty">Курсы скоро появятся</div>
      )}
    </div>
  );
}
