import { useNavigation } from "react-router-dom";
import { CourseCard } from "../../components/CourseCard";
import type { CourseItem } from "../../types/Course";
import { useLearningLoaderData } from "../../routes";

export function Learning() {
  const { courses } = useLearningLoaderData();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

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
    <div className="mx-auto max-w-6xl px-4 pb-6">
      <header className="mb-8 pt-[52px] pb-11">
        <p className="mb-4 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)] before:block before:h-0.5 before:w-6 before:shrink-0 before:bg-[var(--color-accent)] before:content-['']">
          Мой путь
        </p>
        <h1 className="mb-4 flex flex-col m-0 text-[54px] font-semibold leading-[0.9] text-[var(--color-heading)] [font-family:var(--font-display)] min-[992px]:text-[92px]">
          Продолжить обучение
        </h1>
        <p className="m-0 max-w-[440px] text-base leading-[1.6] text-[var(--color-text-muted)]">
          Все курсы, на которые ты подписан, собраны здесь.
        </p>
      </header>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map(renderSkeletonCard)}
        </div>
      ) : courses.length ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {courses.map(renderCourseCard)}
        </div>
      ) : (
        <div className="grid min-h-[180px] place-items-center rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)]">
          У вас еще нет курсов.
        </div>
      )}
    </div>
  );
}
