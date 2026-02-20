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
  const [statistics, setStatistics] = useState(0);
  const [visitedContentIds, setVisitedContentIds] = useState<number[]>([]);

  useEffect(() => {
    if (!id) {
      return;
    }

    const axios = createAxios();
    const userId = localStorage.getItem("user_id");
    const courseId = Number(id);

    const savedVisited = localStorage.getItem(`visited_content_ids_${courseId}`);
    setVisitedContentIds(savedVisited ? JSON.parse(savedVisited) : []);

    axios.get(`${API_URL}/api/courses/${id}`).then((response) => {
      setCourse(response.data);
    });

    axios
      .get(`${API_URL}/api/courses/${id}/participating`)
      .then((response) => {
        setIsParticipating(response.data.participating);
      })
      .catch(() => {
        setIsParticipating(null);
      });

    if (userId) {
      axios
        .get(`${API_URL}/api/courses/${id}/participants/${userId}/statistics`)
        .then((response) => {
          const solved = response.data.data.solvedProblems;
          const total = response.data.data.problems;
          const courseStatistics = total
            ? Math.round((solved / total) * 100)
            : 0;
          setStatistics(courseStatistics);
        })
        .catch(() => {
          setStatistics(0);
        });
    }
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
      .catch((error) => {
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
      .catch((error) => {
        setAlert(error?.response?.data?.errors || "Не удалось отписаться");
      });
  };

  const checkAccessToContent = (event: SyntheticEvent) => {
    if (isParticipating === false) {
      event.preventDefault();
      setAlert("Вы не подписаны на курс");
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

  const passStatistics = statistics ? (
    isParticipating ? (
      <p>
        <>Курс пройден на {statistics}%</>
      </p>
    ) : null
  ) : null;

  if (!course) {
    return null;
  }

  const avatarSrc = course.avatar || defaultCourseAvatar;

  return (
    <div className="container">
      <div className="row">
        <div className="col-4">
          <div className="panel h-600">
              <img
                src={avatarSrc}
                className="course-img mb-24"
                alt="Изображние курса"
                width="350px"
              height="200px"
            />
            <div className="mx-32">
              {passStatistics}
              {joinButton}
              {Alert}
              <p className="mb-16 fs-20">{course.description}</p>
              <p className="mb-8">
                Автор: {course.owner.firstName} {course.owner.lastName}
              </p>
              <p className="mb-8">Дата создания: {course.createdAt}</p>
              <p className="mb-0">Теги: #programming #database</p>
            </div>
          </div>
        </div>
        <div className="col-8">
          <div className="panel h-600">
            <header className="ml-32 mt-24 fs-24 mb-20">{course.title}</header>

            {course.lectures.map((lecture) => {
              return (
                <div className="mb-16" key={lecture.id}>
                  <p className="fs-20 mx-32 mb-0">{lecture.title}</p>
                  <hr className="hr mx-32  my-4" />
                  {lecture.content.map((content) => {
                    const contentIcon =
                      content.type === "MarkdownContent" ? lection : test;
                    const isVisited = visitedContentIds.includes(content.id);
                    const isSolved = course.solvedIds.includes(content.id);
                    const isDone = isVisited || isSolved;
                    return (
                      <Link
                        to={`/courses/${id}/lectures/${lecture.id}/contents/${content.id}`}
                        className="link"
                        onClick={checkAccessToContent}
                      >
                        <div className="mx-32 list-item" key={content.id}>
                          {isParticipating && (
                            <span
                              className={`circle ${isDone ? "circle--green" : ""} ml-8 mr-16`}
                            />
                          )}
                          <img
                            src={contentIcon}
                            className="mr-16"
                            alt="Иконка контента"
                          />
                          {content.title}
                          {isParticipating && isDone && (
                            <span
                              className="ml-16 fs-12"
                              style={{ fontWeight: "200", color: "gray" }}
                            >
                              Пройдено
                            </span>
                          )}
                          <hr className="hr my-4" />
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
