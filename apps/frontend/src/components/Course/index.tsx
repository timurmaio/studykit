import { useState, useEffect, useCallback, SyntheticEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { apiGet, apiPost, apiDelete } from "../../config";
import lection from "./lection.svg";
import test from "./test.svg";
import type { CourseItem, LectureContent } from "../../types/Course";

// ─── Icons ────────────────────────────────────────────────────────────────────

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const READING_SPEED_WPM = 200;

function estimateReadingTime(content: LectureContent): string {
  if (content.type === "SqlProblemContent") return "≈10 мин";
  if (!content.body) return "≈2 мин";
  const words = content.body.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / READING_SPEED_WPM));
  return `≈${minutes} мин`;
}

function getLastVisitedKey(courseId: string | number) {
  return `last_visited_${courseId}`;
}

interface LastVisited {
  lectureId: number;
  contentId: number;
  contentTitle: string;
}

function saveLastVisited(courseId: string | number, data: LastVisited) {
  try {
    localStorage.setItem(getLastVisitedKey(courseId), JSON.stringify(data));
  } catch {}
}

function loadLastVisited(courseId: string | number): LastVisited | null {
  try {
    const raw = localStorage.getItem(getLastVisitedKey(courseId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Course() {
  const defaultCourseAvatar =
    "https://cf-images.us-east-1.prod.boltdns.net/v1/static/62009828001/c04c4184-85ef-4a71-9313-8a6ae90b1157/785c0b4b-fbae-48ac-8a74-cfabb0c3921c/1280x720/match/image.jpg";
  const { id } = useParams();

  const [course, setCourse] = useState<CourseItem | null>(null);
  const [isParticipating, setIsParticipating] = useState<boolean | null>(null);
  const [alert, setAlert] = useState("");
  const [visitedContentIds, setVisitedContentIds] = useState<number[]>([]);
  const [isCourseLoading, setIsCourseLoading] = useState(true);
  const [courseError, setCourseError] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [lastVisited, setLastVisited] = useState<LastVisited | null>(null);

  const { user: authUser } = useAuth();

  const loadCourse = useCallback(async () => {
    if (!id) return;

    const userId = authUser?.id;

    setIsCourseLoading(true);
    setCourseError("");
    setLastVisited(loadLastVisited(id));

    try {
      const courseData = await apiGet<CourseItem>(`/api/courses/${id}`);
      setCourse(courseData);
    } catch {
      setCourseError("Не удалось загрузить страницу курса");
    } finally {
      setIsCourseLoading(false);
    }

    try {
      const participatingData = await apiGet<{ participating: boolean }>(
        `/api/courses/${id}/participating`
      );
      setIsParticipating(participatingData.participating);
    } catch {
      setIsParticipating(null);
    }

    if (userId) {
      try {
        const progressData = await apiGet<{ viewedContentIds?: number[] }>(
          `/api/courses/${id}/progress`
        );
        setVisitedContentIds(progressData.viewedContentIds || []);
      } catch {
        setVisitedContentIds([]);
      }
    }
  }, [id, authUser?.id]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  const joinCourse = async () => {
    if (!id || isJoining) return;
    setIsJoining(true);
    try {
      await apiPost(`/api/courses/${id}/join`);
      setIsParticipating(true);
      setAlert("");
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
      await apiDelete(`/api/courses/${id}/leave`);
      setIsParticipating(false);
      setAlert("");
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

  // ── Computed ───────────────────────────────────────────────────────────────
  const avatarSrc = course.avatar || defaultCourseAvatar;

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

  // First lesson that hasn't been completed — for "Start" CTA
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

  // ── CTA logic ──────────────────────────────────────────────────────────────
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
        <div className="course-complete-banner" role="status">
          <span className="course-complete-banner__emoji" aria-hidden="true">🎉</span>
          <span className="course-complete-banner__text">
            Поздравляем — вы прошли курс полностью!
          </span>
          <span className="course-complete-banner__emoji" aria-hidden="true">🎓</span>
        </div>
      )}

      <div className="panel">
        {/* Hero */}
        <div className="course-hero">
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
            {alert && <div className="alert alert-warning course-hero__alert">{alert}</div>}
          </div>
        </div>

        {/* Curriculum */}
        {course.lectures.length === 0 ? (
          <div className="course-empty-state">
            <div className="course-empty-icon" aria-hidden="true">
              <BookIcon />
            </div>
            <p className="course-empty-title">Уроки ещё не добавлены</p>
            <p className="course-empty-desc">
              Автор работает над материалами курса. Загляните позже.
            </p>
          </div>
        ) : (
          <div className="course-roadmap">
            <header className="ml-8 mt-6 text-2xl font-bold mb-5 course-title">
              Программа курса
            </header>

            {course.lectures.map((lecture) => {
              const lectureDoneCount = lecture.content.filter((c) =>
                completedLessonIds.includes(c.id)
              ).length;
              const isLectureComplete =
                lecture.content.length > 0 && lectureDoneCount === lecture.content.length;

              return (
                <div className="mx-8 mb-5 course-lecture-card" key={lecture.id}>
                  <p className={`text-xl mb-2 course-lecture-title ${isLectureComplete ? "course-lecture-title--done" : ""}`}>
                    <span className="course-lecture-title__text">
                      {isLectureComplete && (
                        <span className="course-lecture-check" aria-label="Раздел завершён">
                          <CheckIcon />
                        </span>
                      )}
                      {lecture.title}
                    </span>
                    {isParticipating && (
                      <span className="course-lecture-progress">
                        {lectureDoneCount}/{lecture.content.length}
                      </span>
                    )}
                  </p>

                  {lecture.content.length === 0 ? (
                    <p className="course-lecture-empty">Уроки не добавлены</p>
                  ) : (
                    lecture.content.map((content) => {
                      const contentIcon =
                        content.type === "MarkdownContent" ? lection : test;
                      const isVisited = filteredVisitedIds.includes(content.id);
                      const isSolved = filteredSolvedIds.includes(content.id);
                      const isDone = isVisited || isSolved;
                      const readingTime = estimateReadingTime(content);

                      return (
                        <Link
                          key={content.id}
                          to={`/courses/${id}/lectures/${lecture.id}/contents/${content.id}`}
                          className={`link course-lesson ${isDone ? "course-lesson--done" : ""}`}
                          onClick={(e) => {
                            checkAccessToContent(e);
                            if (isParticipating) {
                              saveLastVisited(id!, {
                                lectureId: lecture.id,
                                contentId: content.id,
                                contentTitle: content.title,
                              });
                            }
                          }}
                        >
                          <div className="list-item course-lesson-row">
                            {isParticipating && (
                              <span
                                className={`circle ${isDone ? "circle--green" : ""} ml-2 mr-4`}
                              />
                            )}
                            <img
                              src={contentIcon}
                              className="mr-4"
                              alt={content.type === "MarkdownContent" ? "Лекция" : "Задание"}
                            />
                            <span className="course-lesson-title">{content.title}</span>
                            <span className="course-lesson-time">
                              <ClockIcon />
                              {readingTime}
                            </span>
                            {isParticipating && isDone && (
                              <span className="ml-2 text-xs course-lesson-status">
                                <CheckIcon />
                                Пройдено
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
