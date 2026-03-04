import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftIcon, UserIcon, CalendarIcon, BookIcon } from "../icons";
import type { CourseItem } from "../../types/Course";

interface CourseHeroProps {
  course: CourseItem;
  courseId: string;
  avatarSrc: string;
  createdDate: string;
  totalLessons: number;
  learningProgress: number;
  completedLessonIds: number[];
  isParticipating: boolean | null;
  isOwner: boolean;
  alert: string;
  ctaSection: React.ReactNode;
}

export function CourseHero(props: CourseHeroProps) {
  const {
    course,
    courseId,
    avatarSrc,
    createdDate,
    totalLessons,
    learningProgress,
    completedLessonIds,
    isParticipating,
    isOwner,
    alert,
    ctaSection,
  } = props;

  return (
    <motion.div
      className="course-hero"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div className="course-hero__bg">
        <img src={avatarSrc} alt="" />
      </div>
      <div className="course-hero__content">
        <Link to="/courses" className="course-hero__back">
          <ArrowLeftIcon />
          Все курсы
        </Link>
        <div className="course-hero__chips">
          {course.type && <span className="course-hero__chip">{course.type}</span>}
          <span className="course-hero__chip">{totalLessons} уроков</span>
          <span className="course-hero__chip">практика + лекции</span>
        </div>
        <h1 className="course-hero__title">{course.title}</h1>
        {course.description && (
          <p className="course-hero__description">{course.description}</p>
        )}
        <div className="course-hero__meta">
          <div className="course-hero__meta-item">
            <UserIcon />
            {course.owner.firstName} {course.owner.lastName}
          </div>
          <div className="course-hero__meta-item">
            <CalendarIcon />
            {createdDate}
          </div>
          <div className="course-hero__meta-item">
            <BookIcon />
            {course.lectures.length} {course.lectures.length === 1 ? "раздел" : "разделов"}
          </div>
        </div>

        {isParticipating && totalLessons > 0 && (
          <div className="course-hero__progress">
            <div className="course-progress-bar">
              <div
                className="course-progress-bar__fill"
                style={{ width: `${learningProgress}%` }}
              />
            </div>
            <p className="course-progress-text">
              Прогресс: <strong>{learningProgress}%</strong>
              <span className="course-progress-count">
                {completedLessonIds.length} из {totalLessons}
              </span>
            </p>
          </div>
        )}

        {ctaSection}
        {isOwner && (
          <div className="course-hero__actions mt-3 flex gap-2 flex-wrap">
            <Link
              to={`/courses/${courseId}/analytics`}
              className="button button--ghost"
              style={{ display: "inline-block" }}
            >
              Аналитика
            </Link>
            <Link
              to={`/courses/${courseId}/teach`}
              className="button button--ghost"
              style={{ display: "inline-block" }}
            >
              Добавить контент
            </Link>
          </div>
        )}
        {alert && <div className="alert alert-warning course-hero__alert">{alert}</div>}
      </div>
    </motion.div>
  );
}
