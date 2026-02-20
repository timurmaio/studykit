import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { API_URL, createAxios } from "../../config";
import arrow from "./arrow-back.svg";
import lection from "./lection.svg";
import test from "./test.svg";
import { CourseItem, LectureContent } from "../../types/Course";

export function ShowContent() {
  const { id, lectureId, contentId } = useParams();
  const [course, setCourse] = useState<CourseItem | null>(null);
  const [content, setContent] = useState<LectureContent | null>(null);
  const [isParticipating, setIsParticipating] = useState(false);
  const [statistics, setStatistics] = useState(0);
  const [visitedContentIds, setVisitedContentIds] = useState<number[]>([]);
  const [contentError, setContentError] = useState("");
  const [solution, setSolution] = useState("");
  const [alert, setAlert] = useState("");
  const [checkingInformation, setCheckingInformation] = useState("");
  const [succeed, setSucceed] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id || !lectureId || !contentId) {
      return;
    }

    const axios = createAxios();
    const userId = localStorage.getItem("user_id");
    const courseId = Number(id);
    const currentContentId = Number(contentId);
    const visitedStorageKey = `visited_content_ids_${courseId}`;
    setIsLoading(true);

    const savedVisited = localStorage.getItem(visitedStorageKey);
    let parsedVisited: number[] = [];
    if (savedVisited) {
      try {
        parsedVisited = JSON.parse(savedVisited);
      } catch {
        parsedVisited = [];
      }
    }
    const nextVisited = parsedVisited.includes(currentContentId)
      ? parsedVisited
      : [...parsedVisited, currentContentId];
    localStorage.setItem(visitedStorageKey, JSON.stringify(nextVisited));
    setVisitedContentIds(nextVisited);

    axios
      .get(`${API_URL}/api/lectures/${lectureId}/content/${contentId}`)
      .then((response: any) => {
        setContent(response.data);
        setContentError("");
      })
      .catch((error: any) => {
        const errorText = error?.response?.data?.errors;
        setContentError(
          Array.isArray(errorText)
            ? errorText.join(", ")
            : errorText || "Не удалось загрузить содержимое лекции"
        );
      })
      .finally(() => {
        setIsLoading(false);
      });

    axios.get(`${API_URL}/api/courses/${id}`).then((response: any) => {
      setCourse(response.data);
    });

    axios
      .get(`${API_URL}/api/courses/${id}/participating`)
      .then((response: any) => {
        setIsParticipating(response.data.participating);
      })
      .catch(() => {
        setIsParticipating(false);
      });

    if (userId) {
      axios
        .get(`${API_URL}/api/courses/${id}/participants/${userId}/statistics`)
        .then((response: any) => {
          const solvedRaw = Number(response?.data?.data?.solvedProblems);
          const totalRaw = Number(response?.data?.data?.problems);
          const solved = Number.isFinite(solvedRaw) ? solvedRaw : 0;
          const total = Number.isFinite(totalRaw) ? totalRaw : 0;
          const ratio = total > 0 ? solved / total : 0;
          const courseStatistics = Number.isFinite(ratio)
            ? Math.max(0, Math.min(100, Math.round(ratio * 100)))
            : 0;
          setStatistics(courseStatistics);
        })
        .catch(() => {
          setStatistics(0);
        });
    }
  }, [id, lectureId, contentId]);

  const checkTheSolution = (event: any) => {
    event.preventDefault();
    if (!content || content.type !== "SqlProblemContent") {
      return;
    }

    const axios = createAxios();
    setAlert("");
    setCheckingInformation("");
    setSucceed(null);

    axios
      .post(`${API_URL}/api/sql_solutions`, {
        sql_solution: {
          sql_problem_id: content.sqlProblemId || content.id,
          code: solution,
        },
      })
      .then((response: any) => {
        if (response.status !== 201) {
          return;
        }

        const solutionId = response.data.id;
        setCheckingInformation("Идёт проверка...");

        const waitingForSolution = setInterval(() => {
          axios
            .get(`${API_URL}/api/sql_solutions/${solutionId}`)
            .then((pollRes: any) => {
              if (pollRes.data.succeed === true) {
                setCheckingInformation("Решение верно!");
                setSucceed(true);
                clearInterval(waitingForSolution);
              } else if (pollRes.data.succeed === false) {
                setCheckingInformation("Решение неверно, попробуйте ещё раз!");
                setSucceed(false);
                clearInterval(waitingForSolution);
              }
            });
        }, 1000);
      })
      .catch((error: any) => {
        const errorText = error?.response?.data?.errors;
        setAlert(
          Array.isArray(errorText) ? errorText[0] : errorText || "Ошибка"
        );
      });
  };

  const passStatistics = isParticipating ? (
    <p className="course-progress-text">
      Прогресс по курсу: <strong>{statistics}%</strong>
    </p>
  ) : null;

  if (isLoading) {
    return (
      <div className="container show-page">
        <div className="panel course-skeleton">Загружаем материал...</div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="container show-page">
      <div className="course-decor course-decor--mint" aria-hidden="true" />
      <div className="course-decor course-decor--peach" aria-hidden="true" />
      <div className="row">
        <div className="col-12 col-lg-4 mb-24">
          <div className="panel show-sidebar">
            <div className="mx-16 mt-24">
              <Link
                to={`/courses/${id}`}
                className="link flex mb-16 show-back-link"
              >
                <img src={arrow} alt="" className="mr-12" />
                Вернуться к курсу
              </Link>
              <header className="fs-24 mb-20 course-title show-course-title">
                {course.title}
              </header>

              {passStatistics}

              {course.lectures.map((lecture) => {
                return (
                  <div className="mb-16 show-lecture-card" key={lecture.id}>
                    <p className="fs-20 mb-0 show-lecture-title">
                      {lecture.title}
                    </p>

                    {lecture.content.map((content) => {
                      const contentIcon =
                        content.type === "MarkdownContent" ? lection : test;
                      const isVisited = visitedContentIds.includes(content.id);
                      const isCurrent = Number(contentId) === content.id;
                      return (
                        <Link
                          to={`/courses/${id}/lectures/${lecture.id}/contents/${content.id}`}
                          className={`link course-lesson ${
                            isCurrent ? "show-lesson--active" : ""
                          }`}
                          key={content.id}
                        >
                          <div className="list-item flex align-items-center course-lesson-row">
                            {isParticipating && (
                              <span
                                className={`circle ${
                                  isVisited ? "circle--green" : ""
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
                            {isParticipating && isVisited && (
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
        <div className="col-12 col-lg-8">
          <div className="panel show-content-panel">
            <header className="ml-32 mt-24 fs-24 mb-20 show-content-title">
              {content?.title || course.title}
            </header>
            {content?.body ? (
              <div className="mx-32 show-markdown">
                <ReactMarkdown>{content.body}</ReactMarkdown>
              </div>
            ) : null}
            {contentError ? (
              <div className="alert alert-warning mx-32">{contentError}</div>
            ) : null}
            <div className="form-group mx-32">
              {content?.type === "SqlProblemContent" && (
                <form className="show-sql-form">
                  <label htmlFor="solutionTextarea" className="show-sql-label">
                    Введите сюда свое решение
                  </label>
                  {content.sqlProblemId === 1 && (
                    <div className="alert alert-info">
                      Подсказка: в этой задаче нужно создать таблицу
                      <strong> passengers</strong>, а не <strong>tickets</strong>.
                    </div>
                  )}
                  <textarea
                    className="form-control mb-16 show-sql-textarea"
                    name="solution"
                    id="solutionTextarea"
                    rows={6}
                    value={solution}
                    onChange={(event) => setSolution(event.target.value)}
                  />
                  <button
                    className="button mb-16 show-sql-button"
                    onClick={checkTheSolution}
                  >
                    Отправить решение
                  </button>
                  {alert ? (
                    <div className="alert alert-danger">{alert}</div>
                  ) : null}
                  {checkingInformation ? (
                    <div
                      className={`alert ${
                        succeed === true
                          ? "alert-success"
                          : succeed === false
                          ? "alert-danger"
                          : "alert-info"
                      }`}
                    >
                      {checkingInformation}
                    </div>
                  ) : null}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
