import { useState, useEffect, SyntheticEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { API_URL, createAxios } from "../../config";
import lection from "./lection.svg";
import test from "./test.svg";
import type { CourseItem } from "../../types/Course";

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

  useEffect(() => {
    if (!id) {
      return;
    }

    const axios = createAxios();
    const courseId = Number(id);

    const savedVisited = localStorage.getItem(
      `visited_content_ids_${courseId}`
    );
    if (savedVisited) {
      try {
        setVisitedContentIds(JSON.parse(savedVisited));
      } catch {
        setVisitedContentIds([]);
      }
    } else {
      setVisitedContentIds([]);
    }

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

  }, [id]);

  const joinCourse = () => {
    if (!id) {
      return;
    }

    const axios = createAxios();
    axios
      .post(`${API_URL}/api/courses/${id}/join`)
      .then(() => {
        setIsParticipating(true);
        setAlert("");
      })
      .catch((error: any) => {
        setAlert(error?.response?.data?.errors || "Не удалось подписаться");
      });
  };

  const leaveCourse = () => {
    if (!id) {
      return;
    }

    const axios = createAxios();
    axios
      .delete(`${API_URL}/api/courses/${id}/leave`)
      .then(() => {
        setIsParticipating(false);
        setAlert("");
      })
      .catch((error: any) => {
        setAlert(error?.response?.data?.errors || "Не удалось отписаться");
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
    <button className="button mb-16" onClick={leaveCourse}>
      Отписаться
    </button>
  ) : (
    <button className="button mb-16" onClick={joinCourse}>
      Подписаться
    </button>
  );

  const Alert = alert ? (
    <div className="alert alert-warning">{alert}</div>
  ) : null;

  if (isCourseLoading) {
    return (
      <div className="container course-page">
        <div className="panel course-skeleton">Загружаем курс...</div>
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
    ? new Date(createdAtMilliseconds).toLocaleDateString("ru-RU")
    : String(course.createdAt);
  const totalLessons = course.lectures.reduce(
    (accumulator, lecture) => accumulator + lecture.content.length,
    0
  );
  const solvedIds = Array.isArray(course.solvedIds) ? course.solvedIds : [];
  const completedLessonIds = Array.from(
    new Set([...visitedContentIds, ...solvedIds])
  );
  const learningProgress = totalLessons
    ? Math.round((completedLessonIds.length / totalLessons) * 100)
    : 0;
  const passStatistics = isParticipating ? (
    <p className="course-progress-text">
      Прогресс по курсу: <strong>{learningProgress}%</strong>
    </p>
  ) : null;

  return (
    <div className="container course-page">
      <div className="course-decor course-decor--mint" aria-hidden="true" />
      <div className="course-decor course-decor--peach" aria-hidden="true" />
      <div className="row">
        <div className="col-12 col-lg-4 mb-24">
          <div className="panel course-overview">
            <img
              src={avatarSrc}
              className="course-img mb-24"
              alt="Изображение курса"
            />
            <div className="mx-32 course-overview-content">
              <div className="course-chip-row mb-16">
                <span className="course-chip">{course.type}</span>
                <span className="course-chip">{totalLessons} уроков</span>
              </div>
              {passStatistics}
              {joinButton}
              {Alert}
              <p className="mb-16 course-description">{course.description}</p>
              <p className="mb-8 course-meta">
                Автор: {course.owner.firstName} {course.owner.lastName}
              </p>
              <p className="mb-8 course-meta">Дата создания: {createdDate}</p>
              <p className="mb-0 course-meta">Формат: практика + лекции</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-8">
          <div className="panel course-roadmap">
            <header className="ml-32 mt-24 fs-24 mb-20 course-title">
              {course.title}
            </header>

            {course.lectures.map((lecture) => {
              return (
                <div
                  className="mx-32 mb-20 course-lecture-card"
                  key={lecture.id}
                >
                  <p className="fs-20 mb-8 course-lecture-title">
                    {lecture.title}
                  </p>
                  {lecture.content.map((content) => {
                    const contentIcon =
                      content.type === "MarkdownContent" ? lection : test;
                    const isVisited = visitedContentIds.includes(content.id);
                    const isSolved = solvedIds.includes(content.id);
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
  );
}
