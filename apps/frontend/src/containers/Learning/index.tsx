import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiGet } from "../../config";
import { CourseCard } from "../../components/CourseCard";
import type { CourseItem } from "../../types/Course";

export function Learning() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = user?.id;
    setIsLoading(true);
    const url = userId
      ? `/api/courses?participated_by=${userId}`
      : "/api/courses";
    apiGet<CourseItem[]>(url)
      .then((data) => setCourses(data))
      .catch(() => setCourses([]))
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  function renderCourseCard(course: CourseItem) {
    return (
      <div className="mb-6" key={course.id}>
        <CourseCard {...course} />
      </div>
    );
  }

  function renderSkeletonCard(_: unknown, index: number) {
    return (
      <div
        className="mb-6"
        key={`learning-skeleton-${index}`}
      >
        <div className="courses-skeleton-card" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 courses-page learning-page">
      <header className="courses-hero learning-hero mb-6">
        <p className="courses-kicker mb-2">Мой путь</p>
        <h1 className="courses-title mb-2">Продолжить обучение</h1>
        <p className="courses-subtitle mb-0">
          Все курсы, на которые ты подписан, собраны здесь.
        </p>
      </header>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map(renderSkeletonCard)}
        </div>
      ) : courses.length ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">{courses.map(renderCourseCard)}</div>
      ) : (
        <div className="panel courses-empty">У вас еще нет курсов.</div>
      )}
    </div>
  );
}
