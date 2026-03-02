import { useState, useEffect, SyntheticEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { API_URL, createAxios } from "../../config";
import lection from "./lection.svg";
import test from "./test.svg";
import type { CourseItem } from "../../types/Course";

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

  useEffect(() => {
    if (!id) {
      return;
    }

    const axios = createAxios();
    const userId = localStorage.getItem("user_id");
    const courseId = Number(id);

    setIsCourseLoading(true);
    setCourseError("");

    axios
      .get(`${API_URL}/api/courses/${id}`)
      .then((response: any) => {
        setCourse(response.data);
      })
      .catch(() => {
        setCourseError("Не удалось загрузить страницу курса");
      })
      .finally(() => {
        setIsCourseLoading(false);
      });

    axios
      .get(`${API_URL}/api/courses/${id}/participating`)
      .then((response: any) => {
        setIsParticipating(response.data.participating);
      })
      .catch(() => {
        setIsParticipating(null);
      });

    // Load progress from API
    if (userId) {
      axios
        .get(`${API_URL}/api/courses/${id}/progress`)
        .then((response: any) => {
          setVisitedContentIds(response.data.viewedContentIds || []);
        })
        .catch(() => {
          setVisitedContentIds([]);
        });
    }

  }, [id]);

  const joinCourse = () => {
    if (!id || isJoining) {
      return;
    }

    setIsJoining(true);
    const axios = createAxios();
    axios
      .post(`${API_URL}/api/courses/${id}/join`)
      .then(() => {
        setIsParticipating(true);
        setAlert("");
      })
      .catch((error: any) => {
        setAlert(error?.response?.data?.errors || "Не удалось подписаться");
      })
      .finally(() => {
        setIsJoining(false);
      });
  };

  const leaveCourse = () => {
    if (!id || isJoining) {
      return;
    }

    setIsJoining(true);
    const axios = createAxios();
    axios
      .delete(`${API_URL}/api/courses/${id}/leave`)
      .then(() => {
        setIsParticipating(false);
        setAlert("");
      })
      .catch((error: any) => {
        setAlert(error?.response?.data?.errors || "Не удалось отписаться");
      })
      .finally(() => {
        setIsJoining(false);
      });
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

  const joinButton = isParticipating ? (
    <button 
      className="button button--secondary mb-16" 
      onClick={leaveCourse}
      disabled={isJoining}
    >
      {isJoining ? "Загрузка..." : "Отписаться"}
    </button>
  ) : (
    <button 
      className="button mb-16" 
      onClick={joinCourse}
      disabled={isJoining}
    >
      {isJoining ? "Загрузка..." : "Подписаться на курс"}
    </button>
  );

  const Alert = alert ? (
    <div className="alert alert-warning">{alert}</div>
  ) : null;

  if (isCourseLoading) {
    return (
      <div className="container course-page">
        <div className="course-decor course-decor--mint" aria-hidden="true" />
        <div className="course-decor course-decor--peach" aria-hidden="true" />
        <div className="panel">
          <div className="course-skeleton-hero" />
          <div className="row">
            <div className="col-12 col-lg-4">
              <div className="course-skeleton-panel" style={{ height: 200 }} />
            </div>
            <div className="col-12 col-lg-8">
              <div className="course-skeleton-lecture" />
              <div className="course-skeleton-lecture" />
              <div className="course-skeleton-lecture" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (courseError) {
    return (
      <div className="container course-page">
        <div className="alert alert-warning">{courseError}</div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  const avatarSrc = course.avatar || defaultCourseAvatar;
  const rawCreatedAt = Number(course.createdAt);
  const createdAtMilliseconds =
    Number.isFinite(rawCreatedAt) && rawCreatedAt < 10_000_000_000
      ? rawCreatedAt * 1000
      : rawCreatedAt;
  const createdDate = Number.isFinite(createdAtMilliseconds)
    ? new Date(createdAtMilliseconds).toLocaleDateString("ru-RU", {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : String(course.createdAt);
  const totalLessons = course.lectures.reduce(
    (accumulator, lecture) => accumulator + lecture.content.length,
    0
  );
  const validLessonIds = new Set(
    course.lectures.flatMap((lecture) => lecture.content.map((content) => content.id))
  );
  const solvedIds = Array.isArray(course.solvedIds) ? course.solvedIds : [];
  const filteredVisitedIds = visitedContentIds.filter((id) => validLessonIds.has(id));
  const filteredSolvedIds = solvedIds.filter((id) => validLessonIds.has(id));
  const completedLessonIds = Array.from(
    new Set([...filteredVisitedIds, ...filteredSolvedIds])
  );
  const rawProgress = totalLessons
    ? Math.round((completedLessonIds.length / totalLessons) * 100)
    : 0;
  const learningProgress = Math.min(100, Math.max(0, rawProgress));

  const progressSection = isParticipating ? (
    <div className="course-progress-section mb-20">
      <div className="course-progress-bar">
        <div 
          className="course-progress-bar__fill" 
          style={{ width: `${learningProgress}%` }}
        />
      </div>
      <p className="course-progress-text">
        Прогресс по курсу: <strong>{learningProgress}%</strong>
      </p>
    </div>
  ) : null;

  return (
    <div className="container course-page">
      <div className="course-decor course-decor--mint" aria-hidden="true" />
      <div className="course-decor course-decor--peach" aria-hidden="true" />

      <div className="panel">
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
              <span className="course-hero__chip">{course.type}</span>
              <span className="course-hero__chip">{totalLessons} уроков</span>
              <span className="course-hero__chip">практика + лекции</span>
            </div>
            <h1 className="course-hero__title">{course.title}</h1>
            <p className="course-hero__description">{course.description}</p>
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
                {course.lectures.length} разделов
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12 col-lg-4 mb-24">
            <div className="panel course-overview">
              <div className="mx-32 course-overview-content">
                {progressSection}
                {joinButton}
                {Alert}
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-8">
            <div className="panel course-roadmap">
              <header className="ml-32 mt-24 fs-24 mb-20 course-title">
                Программа курса
              </header>

              {course.lectures.map((lecture, lectureIndex) => {
                const lectureDoneCount = lecture.content.filter(
                  (c) => completedLessonIds.includes(c.id)
                ).length;
                return (
                  <div
                    className="mx-32 mb-20 course-lecture-card"
                    key={lecture.id}
                  >
                    <p className="fs-20 mb-8 course-lecture-title">
                      <span>{lecture.title}</span>
                      {isParticipating && (
                        <span className="course-lecture-progress">
                          {lectureDoneCount}/{lecture.content.length}
                        </span>
                      )}
                    </p>
                    {lecture.content.map((content) => {
                      const contentIcon =
                        content.type === "MarkdownContent" ? lection : test;
                      const isVisited = filteredVisitedIds.includes(content.id);
                      const isSolved = filteredSolvedIds.includes(content.id);
                      const isDone = isVisited || isSolved;
                      return (
                        <Link
                          key={content.id}
                          to={`/courses/${id}/lectures/${lecture.id}/contents/${content.id}`}
                          className={`link course-lesson ${
                            isDone ? "course-lesson--done" : ""
                          }`}
                          onClick={checkAccessToContent}
                        >
                          <div className="list-item course-lesson-row">
                            {isParticipating && (
                              <span
                                className={`circle ${
                                  isDone ? "circle--green" : ""
                                } ml-8 mr-16`}
                              />
                            )}
                            <img
                              src={contentIcon}
                              className="mr-16"
                              alt="Иконка контента"
                            />
                            <span className="course-lesson-title">
                              {content.title}
                            </span>
                            {isParticipating && isDone && (
                              <span className="ml-16 fs-12 course-lesson-status">
                                <CheckIcon />
                                Пройдено
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
