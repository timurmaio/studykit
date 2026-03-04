import { useState, useEffect, useCallback, SyntheticEvent } from "react";
import { Link, useParams, useRevalidator } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { apiGet, apiPost, apiDelete } from "../../config";
import { useCourseLoaderData } from "../../routes";
import { ArrowLeftIcon, ArrowRightIcon, RefreshIcon } from "../icons";
import { DEFAULT_COURSE_AVATAR, loadLastVisited, saveLastVisited } from "../../constants/course";
import { CourseHero } from "./CourseHero";
import { CourseLectures } from "./CourseLectures";
import type { CourseItem } from "../../types/Course";
import type { LastVisited } from "../../constants/course";

export function Course() {
  const { id } = useParams();
  const {
    course: loaderCourse,
    participating: loaderParticipating,
    error: loaderError,
  } = useCourseLoaderData();

  const [course, setCourse] = useState<CourseItem | null>(loaderCourse);
  const [isParticipating, setIsParticipating] = useState<boolean | null>(loaderParticipating);
  const [alert, setAlert] = useState("");
  const [visitedContentIds, setVisitedContentIds] = useState<number[]>([]);
  const [courseError, setCourseError] = useState(loaderError ?? "");
  const [isJoining, setIsJoining] = useState(false);
  const [lastVisited, setLastVisited] = useState<LastVisited | null>(null);
  const revalidator = useRevalidator();
  const isCourseLoading = revalidator.state === "loading";

  const { user: authUser } = useAuth();

  const loadCourse = useCallback(() => {
    revalidator.revalidate();
  }, [revalidator]);

  const loadProgress = useCallback(() => {
    if (!id || !authUser?.id) return;
    setLastVisited(loadLastVisited(id));
    apiGet<{ viewedContentIds?: number[] }>(`/api/courses/${id}/progress`)
      .then((data) => setVisitedContentIds(data.viewedContentIds || []))
      .catch(() => setVisitedContentIds([]));
  }, [id, authUser?.id]);

  useEffect(() => {
    setCourse(loaderCourse);
    setIsParticipating(loaderParticipating);
    setCourseError(loaderError ?? "");
    setLastVisited(id ? loadLastVisited(id) : null);
    loadProgress();
  }, [id, loaderCourse, loaderParticipating, loaderError, loadProgress]);

  const joinCourse = async () => {
    if (!id || isJoining) return;
    setIsJoining(true);
    try {
      await apiPost(`/api/courses/${id}/enrollments`);
      setIsParticipating(true);
      setAlert("");
      toast.success("Вы подписаны на курс");
    } catch (err: unknown) {
      const errors = (err as { errors?: string })?.errors;
      setAlert(String(errors ?? "Не удалось подписаться"));
    } finally {
      setIsJoining(false);
    }
  };

  const leaveCourse = async () => {
    if (!id || isJoining) return;
    setIsJoining(true);
    try {
      await apiDelete(`/api/courses/${id}/enrollments`);
      setIsParticipating(false);
      setAlert("");
      toast.success("Вы отписаны от курса");
    } catch (err: unknown) {
      const errors = (err as { errors?: string })?.errors;
      setAlert(String(errors ?? "Не удалось отписаться"));
    } finally {
      setIsJoining(false);
    }
  };

  const checkAccessToContent = (event: SyntheticEvent) => {
    if (isParticipating !== true) {
      event.preventDefault();
      setAlert(
        isParticipating === false
          ? "Вы не подписаны на курс"
          : "Не удалось проверить подписку. Попробуйте позже"
      );
    }
  };

  const handleLessonClick = (
    e: React.MouseEvent,
    lectureId: number,
    contentId: number,
    contentTitle: string
  ) => {
    checkAccessToContent(e);
    if (isParticipating && id) {
      saveLastVisited(id, { lectureId, contentId, contentTitle });
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isCourseLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 course-page">
        <div className="course-decor course-decor--mint" aria-hidden="true" />
        <div className="course-decor course-decor--peach" aria-hidden="true" />
        <div className="panel">
          <div className="course-skeleton-hero" />
          <div style={{ padding: "0 24px 24px" }}>
            <div className="course-skeleton-lecture" />
            <div className="course-skeleton-lecture" style={{ animationDelay: "80ms" }} />
            <div className="course-skeleton-lecture" style={{ animationDelay: "160ms" }} />
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (courseError) {
    return (
      <div className="mx-auto max-w-6xl px-4 course-page">
        <div className="course-error-state panel">
          <div className="course-error-icon" aria-hidden="true">⚠</div>
          <h2 className="course-error-title">Не удалось загрузить курс</h2>
          <p className="course-error-desc">{courseError}</p>
          <button className="button course-error-retry" onClick={loadCourse}>
            <RefreshIcon />
            Попробовать снова
          </button>
          <Link to="/courses" className="course-error-back">
            <ArrowLeftIcon />
            Все курсы
          </Link>
        </div>
      </div>
    );
  }

  if (!course) return null;

  const isOwner = authUser && course.owner && Number((course.owner as { id?: number }).id) === authUser.id;

  // ── Computed ───────────────────────────────────────────────────────────────
  const avatarSrc = course.avatar || DEFAULT_COURSE_AVATAR;

  const rawCreatedAt = Number(course.createdAt);
  const createdAtMs =
    Number.isFinite(rawCreatedAt) && rawCreatedAt < 10_000_000_000
      ? rawCreatedAt * 1000
      : rawCreatedAt;
  const createdDate = Number.isFinite(createdAtMs)
    ? new Date(createdAtMs).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
    : String(course.createdAt);

  const totalLessons = course.lectures.reduce((acc, l) => acc + l.content.length, 0);
  const validLessonIds = new Set(course.lectures.flatMap((l) => l.content.map((c) => c.id)));
  const solvedIds = Array.isArray(course.solvedIds) ? course.solvedIds : [];
  const filteredVisitedIds = visitedContentIds.filter((cid) => validLessonIds.has(cid));
  const filteredSolvedIds = solvedIds.filter((cid) => validLessonIds.has(cid));
  const completedLessonIds = Array.from(new Set([...filteredVisitedIds, ...filteredSolvedIds]));
  const learningProgress = totalLessons
    ? Math.min(100, Math.max(0, Math.round((completedLessonIds.length / totalLessons) * 100)))
    : 0;
  const isCourseComplete = isParticipating && totalLessons > 0 && learningProgress === 100;

  const firstUnvisited = (() => {
    for (const lecture of course.lectures) {
      for (const content of lecture.content) {
        if (!completedLessonIds.includes(content.id)) {
          return { lectureId: lecture.id, contentId: content.id, contentTitle: content.title };
        }
      }
    }
    return null;
  })();

  // ── CTA ───────────────────────────────────────────────────────────────────
  let ctaSection: React.ReactNode = null;
  if (!isParticipating) {
    ctaSection = (
      <div className="course-hero__actions">
        <button className="button" onClick={joinCourse} disabled={isJoining}>
          {isJoining ? "Загрузка..." : "Подписаться на курс"}
        </button>
      </div>
    );
  } else if (isCourseComplete) {
    ctaSection = (
      <div className="course-hero__actions">
        <button className="button button--secondary" onClick={leaveCourse} disabled={isJoining}>
          {isJoining ? "Загрузка..." : "Отписаться"}
        </button>
      </div>
    );
  } else if (lastVisited) {
    ctaSection = (
      <div className="course-hero__actions">
        <Link
          to={`/courses/${id}/lectures/${lastVisited.lectureId}/contents/${lastVisited.contentId}`}
          className="button course-resume-btn"
        >
          <ArrowRightIcon />
          Продолжить обучение
        </Link>
        <p className="course-resume-hint">
          Последний урок: {lastVisited.contentTitle}
        </p>
      </div>
    );
  } else if (firstUnvisited) {
    ctaSection = (
      <div className="course-hero__actions">
        <Link
          to={`/courses/${id}/lectures/${firstUnvisited.lectureId}/contents/${firstUnvisited.contentId}`}
          className="button"
        >
          Начать обучение
          <ArrowRightIcon />
        </Link>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-6xl px-4 course-page">
      <div className="course-decor course-decor--mint" aria-hidden="true" />
      <div className="course-decor course-decor--peach" aria-hidden="true" />

      {isCourseComplete && (
        <motion.div
          className="course-complete-banner"
          role="status"
          initial={{ opacity: 0, y: -12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <span className="course-complete-banner__emoji" aria-hidden="true">🎉</span>
          <span className="course-complete-banner__text">
            Поздравляем — вы прошли курс полностью!
          </span>
          <span className="course-complete-banner__emoji" aria-hidden="true">🎓</span>
        </motion.div>
      )}

      <div className="panel">
        <CourseHero
          course={course}
          courseId={id!}
          avatarSrc={avatarSrc}
          createdDate={createdDate}
          totalLessons={totalLessons}
          learningProgress={learningProgress}
          completedLessonIds={completedLessonIds}
          isParticipating={isParticipating}
          isOwner={!!isOwner}
          alert={alert}
          ctaSection={ctaSection}
        />
        <CourseLectures
          course={course}
          courseId={id!}
          completedLessonIds={completedLessonIds}
          filteredVisitedIds={filteredVisitedIds}
          filteredSolvedIds={filteredSolvedIds}
          isParticipating={isParticipating}
          isOwner={!!isOwner}
          onLessonClick={handleLessonClick}
        />
      </div>
    </div>
  );
}
