import { useState, useEffect } from "react";
import { API_URL } from "../../config";
import { CourseCard } from "../../components/CourseCard";
import type { CourseItem } from "../../types/Course";

export function Learning() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    setIsLoading(true);
    fetch(`${API_URL}/api/courses?participated_by=${userId}`)
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch(() => setCourses([]))
      .finally(() => setIsLoading(false));
  }, []);

  function renderCourseCard(course: CourseItem) {
    return (
      <div className="col-12 col-md-6 col-lg-3 mb-24" key={course.id}>
        <CourseCard {...course} />
      </div>
    );
  }

  function renderSkeletonCard(_: unknown, index: number) {
    return (
      <div
        className="col-12 col-md-6 col-lg-3 mb-24"
        key={`learning-skeleton-${index}`}
      >
        <div className="courses-skeleton-card" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="container courses-page learning-page">
      <header className="courses-hero learning-hero mb-24">
        <p className="courses-kicker mb-8">Мой путь</p>
        <h1 className="courses-title mb-8">Продолжить обучение</h1>
        <p className="courses-subtitle mb-0">
          Все курсы, на которые ты подписан, собраны здесь.
        </p>
      </header>
      {isLoading ? (
        <div className="row">
          {Array.from({ length: 4 }).map(renderSkeletonCard)}
        </div>
      ) : courses.length ? (
        <div className="row">{courses.map(renderCourseCard)}</div>
      ) : (
        <div className="panel courses-empty">У вас еще нет курсов.</div>
      )}
    </div>
  );
}
