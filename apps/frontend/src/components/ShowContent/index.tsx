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

  useEffect(() => {
    if (!id || !lectureId || !contentId) {
      return;
    }

    const axios = createAxios();
    const userId = localStorage.getItem("user_id");
    const courseId = Number(id);
    const currentContentId = Number(contentId);
    const visitedStorageKey = `visited_content_ids_${courseId}`;

    const savedVisited = localStorage.getItem(visitedStorageKey);
    const parsedVisited: number[] = savedVisited ? JSON.parse(savedVisited) : [];
    const nextVisited = parsedVisited.includes(currentContentId)
      ? parsedVisited
      : [...parsedVisited, currentContentId];
    localStorage.setItem(visitedStorageKey, JSON.stringify(nextVisited));
    setVisitedContentIds(nextVisited);

    axios
      .get(`${API_URL}/api/lectures/${lectureId}/content/${contentId}`)
      .then((response) => {
        setContent(response.data);
        setContentError("");
      })
      .catch((error) => {
        const errorText = error?.response?.data?.errors;
        setContentError(
          Array.isArray(errorText)
            ? errorText.join(", ")
            : errorText || "Не удалось загрузить содержимое лекции"
        );
      });

    axios.get(`${API_URL}/api/courses/${id}`).then((response) => {
      setCourse(response.data);
    });

    axios
      .get(`${API_URL}/api/courses/${id}/participating`)
      .then((response) => {
        setIsParticipating(response.data.participating);
      })
      .catch(() => {
        setIsParticipating(false);
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
      .then((response) => {
        if (response.status !== 201) {
          return;
        }

        const solutionId = response.data.id;
        setCheckingInformation("Идёт проверка...");

        const waitingForSolution = setInterval(() => {
          axios.get(`${API_URL}/api/sql_solutions/${solutionId}`).then((pollRes) => {
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
      .catch((error) => {
        const errorText = error?.response?.data?.errors;
        setAlert(Array.isArray(errorText) ? errorText[0] : errorText || "Ошибка");
      });
  };

  const passStatistics = statistics ? (
    isParticipating ? (
      <p>Курс пройден на {statistics}%</p>
    ) : null
  ) : null;

  if (!course) {
    return null;
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-3">
          <div className="panel h-600">
            <div className="mx-16 mt-24">
              <Link to={`/courses/${id}`} className="link flex mb-16">
                <img src={arrow} alt="" className="mr-12" />
                Вернуться к курсу
              </Link>
              <header className="fs-24 mb-20">{course.title}</header>

              {passStatistics}

              {course.lectures.map((lecture) => {
                return (
                  <div className="mb-16" key={lecture.id}>
                    <p className="fs-20 mb-0">{lecture.title}</p>
                    <hr className="hr my-4" />

                    {lecture.content.map((content) => {
                      const contentIcon =
                        content.type === "MarkdownContent" ? lection : test;
                      const isVisited = visitedContentIds.includes(content.id);
                      return (
                        <Link
                          to={`/courses/${id}/lectures/${lecture.id}/contents/${content.id}`}
                          className="link"
                          key={content.id}
                        >
                          <div className="list-item flex align-items-center">
                            {isParticipating && (
                              <span
                                className={`circle ${isVisited ? "circle--green" : ""} ml-8 mr-16`}
                              />
                            )}
                            <img
                              src={contentIcon}
                              className="mr-16"
                              alt="Иконка контента"
                            />
                            <div style={{ display: "block" }}>
                              {content.title}
                            </div>
                            {isParticipating && isVisited && (
                              <div
                                className="ml-16 fs-12"
                                style={{ fontWeight: "200", color: "gray" }}
                              >
                                Пройдено
                              </div>
                            )}
                          </div>
                          <hr className="hr my-4" />
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="col-9">
          <div className="panel h-600">
            <header className="ml-32 mt-24 fs-24 mb-20">
              {content?.title || course.title}
            </header>
            {content?.body ? (
              <div className="mx-32">
                <ReactMarkdown>{content.body}</ReactMarkdown>
              </div>
            ) : null}
            {contentError ? (
              <div className="alert alert-warning mx-32">{contentError}</div>
            ) : null}
            <div className="form-group mx-32">
              {content?.type === "SqlProblemContent" && (
                <form>
                  <label htmlFor="solutionTextarea">Введите сюда своё решение</label>
                  <textarea
                    className="form-control mb-16"
                    name="solution"
                    id="solutionTextarea"
                    rows={6}
                    value={solution}
                    onChange={(event) => setSolution(event.target.value)}
                  />
                  <button className="button mb-16" onClick={checkTheSolution}>
                    Отправить решение
                  </button>
                  {alert ? <div className="alert alert-danger">{alert}</div> : null}
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
