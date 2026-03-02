import { useNavigation } from "react-router-dom";
import { motion } from "framer-motion";
import { CourseCard } from "../../components/CourseCard";
import type { CourseItem } from "../../types/Course";
import { useCoursesLoaderData } from "../../routes";

export function Courses() {
  const { courses } = useCoursesLoaderData();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  function renderCourseCard(courseItem: CourseItem, index: number) {
    const isFeatured = index === 0;
    return (
      <motion.div
        key={courseItem.id}
        className={`mb-6 ${isFeatured ? "md:col-span-2 lg:row-span-2" : ""}`}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
          delay: 0.04 + index * 0.05,
        }}
      >
        <CourseCard {...courseItem} featured={isFeatured} />
      </motion.div>
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
    <div className="mx-auto max-w-6xl px-4 pb-6">
      <motion.header
        className="mb-8 pt-[52px] pb-11"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <p className="mb-4 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)] before:block before:h-0.5 before:w-6 before:shrink-0 before:bg-[var(--color-accent)] before:content-['']">
          StudyKit
        </p>
        <h1 className="mb-4 flex flex-col m-0 text-[54px] font-semibold leading-[0.9] text-[var(--color-heading)] [font-family:var(--font-display)] min-[992px]:text-[92px]">
          <span>Каталог</span>
          <em className="font-bold italic text-[var(--color-accent)]">курсов</em>
        </h1>
        <p className="m-0 max-w-[440px] text-base leading-[1.6] text-[var(--color-text-muted)]">
          Выбирай траекторию и отмечай прогресс по мере прохождения уроков.
        </p>
      </motion.header>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map(renderSkeletonCard)}
        </div>
      ) : courses.length ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[minmax(340px,auto)]">
          {courses.map((c, i) => renderCourseCard(c, i))}
        </div>
      ) : (
        <div className="grid min-h-[180px] place-items-center rounded-[18px] border border-[var(--color-border)]">
          Курсы скоро появятся
        </div>
      )}
    </div>
  );
}
