import { useEffect, useRef, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../../contexts/AuthContext";
import { apiGet, apiPost, apiSqlSolutionStream } from "../../config";
import { SQL_HINTS } from "../../constants/sqlHints";
import { SqlProblemForm } from "./SqlProblemForm";
import arrow from "./arrow-back.svg";
import lection from "./lection.svg";
import test from "./test.svg";
import { CourseItem, LectureContent } from "../../types/Course";

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export function ShowContent() {
  const { id, lectureId, contentId } = useParams();
  const { user: authUser } = useAuth();
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
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [isHintCopied, setIsHintCopied] = useState(false);
  const streamAbortRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!id || !lectureId || !contentId) {
      return;
    }

    const userId = authUser?.id;
    const courseId = Number(id);
    const currentContentId = Number(contentId);
    setIsLoading(true);
    setSolution("");
    setAlert("");
    setCheckingInformation("");
    setSucceed(null);
    setIsHintOpen(false);
    setIsHintCopied(false);
    if (streamAbortRef.current) {
      streamAbortRef.current();
      streamAbortRef.current = null;
    }

    // Track progress via API (don't block the UI)
    if (userId) {
      apiPost(`/api/courses/${courseId}/progress`, {
        lectureContentId: currentContentId,
      }).catch(() => {});
    }

    // Save last visited for "Resume" CTA on course page
    // We'll update it once course data loads and we know the content title
    const updateLastVisited = (contentTitle: string) => {
      try {
        localStorage.setItem(
          `last_visited_${courseId}`,
          JSON.stringify({ lectureId: Number(lectureId), contentId: currentContentId, contentTitle })
        );
      } catch {}
    };

    (async () => {
      try {
        const contentData = await apiGet<LectureContent>(
          `/api/lectures/${lectureId}/content/${contentId}`
        );
        setContent(contentData);
        setContentError("");
        if (contentData?.title) {
          updateLastVisited(contentData.title);
        }
      } catch (err: unknown) {
        const errorText = (err as { errors?: string | string[] })?.errors;
        setContentError(
          Array.isArray(errorText)
            ? errorText.join(", ")
            : String(errorText ?? "Не удалось загрузить содержимое лекции")
        );
      } finally {
        setIsLoading(false);
      }
    })();

    apiGet<CourseItem>(`/api/courses/${id}`).then((data) => setCourse(data));

    apiGet<{ participating: boolean }>(`/api/courses/${id}/participating`)
      .then((data) => setIsParticipating(data.participating))
      .catch(() => setIsParticipating(false));

    if (userId) {
      apiGet<{
        completedCount: number;
        totalContent: number;
        viewedContentIds?: number[];
      }>(`/api/courses/${id}/progress`)
        .then((progressResponse) => {
          const { completedCount, totalContent } = progressResponse;
          const ratio = totalContent > 0 ? completedCount / totalContent : 0;
          const courseStatistics = Math.max(0, Math.min(100, Math.round(ratio * 100)));
          setStatistics(courseStatistics);
          setVisitedContentIds(progressResponse.viewedContentIds || []);
        })
        .catch(() => {
          setStatistics(0);
        });
    }
    return () => {
      if (streamAbortRef.current) {
        streamAbortRef.current();
        streamAbortRef.current = null;
      }
    };
  }, [id, lectureId, contentId, authUser?.id]);

  const checkTheSolution = (event: React.FormEvent) => {
    event.preventDefault();
    if (!content || content.type !== "SqlProblemContent") {
      return;
    }

    setAlert("");
    setCheckingInformation("");
    setSucceed(null);
    if (streamAbortRef.current) {
      streamAbortRef.current();
      streamAbortRef.current = null;
    }

    apiPost<{ id: number }>("/api/sql_solutions", {
      sql_solution: {
        sql_problem_id: content.sqlProblemId || content.id,
        code: solution,
      },
    })
      .then((response) => {
        const solutionId = response.id;
        setCheckingInformation("Идёт проверка...");

        streamAbortRef.current = apiSqlSolutionStream(solutionId, (result) => {
          streamAbortRef.current = null;
          if (result.timeout) {
            setCheckingInformation("Проверка занимает длительное время, обновите страницу.");
            setSucceed(null);
          } else if (result.succeed === true) {
            setCheckingInformation("Решение верно!");
            setSucceed(true);
          } else if (result.succeed === false) {
            setCheckingInformation("Решение неверно, попробуйте ещё раз!");
            setSucceed(false);
          }
        });
      })
      .catch((err: unknown) => {
        const errorText = (err as { errors?: string | string[] })?.errors;
        setAlert(
          Array.isArray(errorText) ? errorText[0] : String(errorText ?? "Ошибка")
        );
      });
  };

  const sqlHint =
    content?.type === "SqlProblemContent" && content.sqlProblemId
      ? SQL_HINTS[content.sqlProblemId]
      : undefined;

  const copyHint = async () => {
    if (!sqlHint) {
      return;
    }

    try {
      await navigator.clipboard.writeText(sqlHint);
      setIsHintCopied(true);
      window.setTimeout(() => setIsHintCopied(false), 1200);
    } catch {
      setIsHintCopied(false);
    }
  };

  const passStatistics = isParticipating ? (
    <div className="course-progress-section mb-4">
      <div className="course-progress-bar">
        <div
          className="course-progress-bar__fill"
          style={{ width: `${statistics}%` }}
        />
      </div>
      <p className="course-progress-text">
        Прогресс: <strong>{statistics}%</strong>
      </p>
    </div>
  ) : null;

  const navigationData = useMemo(() => {
    if (!course) return null;

    const allContents: Array<{ lectureId: number; contentId: number }> = [];
    course.lectures.forEach((lecture) => {
      lecture.content.forEach((content) => {
        allContents.push({ lectureId: lecture.id, contentId: content.id });
      });
    });

    const currentIndex = allContents.findIndex(
      (c) => c.contentId === Number(contentId)
    );

    const nextContent = currentIndex >= 0 && currentIndex < allContents.length - 1
      ? allContents[currentIndex + 1]
      : null;

    return { allContents, currentIndex, nextContent };
  }, [course, contentId]);

  const nextLessonButton = navigationData?.nextContent ? (
    <Link
      to={`/courses/${id}/lectures/${navigationData.nextContent.lectureId}/contents/${navigationData.nextContent.contentId}`}
      className="button next-lesson-btn"
    >
      Следующий урок
      <ArrowRightIcon />
    </Link>
  ) : null;

  if (!course) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 show-page">
      <div className="course-decor course-decor--mint" aria-hidden="true" />
      <div className="course-decor course-decor--peach" aria-hidden="true" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4 mb-6">
          <div className="panel show-sidebar">
            <div className="mx-4 mt-6">
              <Link
                to={`/courses/${id}`}
                className="link flex mb-4 show-back-link"
              >
                <img src={arrow} alt="" className="mr-3" />
                Вернуться к курсу
              </Link>
              <header className="text-2xl font-bold mb-5 course-title show-course-title">
                {course.title}
              </header>

              {passStatistics}

              {course.lectures.map((lecture) => {
                const lectureVisitedCount = lecture.content.filter(
                  (c) => visitedContentIds.includes(c.id)
                ).length;
                const isCurrentLecture = Number(lectureId) === lecture.id;
                return (
                  <div
                    className={`mb-4 show-lecture-card ${isCurrentLecture ? "show-lecture-card--active" : ""}`}
                    key={lecture.id}
                  >
                    <div className="show-lecture-header">
                      <p className="text-xl mb-0 show-lecture-title">
                        {lecture.title}
                      </p>
                      {isParticipating && (
                        <span className="show-lecture-progress">
                          {lectureVisitedCount}/{lecture.content.length}
                        </span>
                      )}
                    </div>

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
                                } ml-2 mr-4`}
                              />
                            )}
                            <img
                              src={contentIcon}
                              className="mr-4"
                              alt="Иконка контента"
                            />
                            <span className="course-lesson-title">
                              {content.title}
                            </span>
                            {isParticipating && isVisited && (
                              <span className="ml-4 text-xs course-lesson-status">
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
        <div className="lg:col-span-8">
          <div className="panel show-content-panel">
            {isLoading ? (
              <div className="mx-8 mt-6">Загружаем материал...</div>
            ) : (
              <>
                <header className="ml-8 mt-6 text-2xl font-bold mb-5 show-content-title">
                  {content?.title || course.title}
                </header>
                {content?.body ? (
                  <div className="mx-8 show-markdown">
                    <ReactMarkdown>{content.body}</ReactMarkdown>
                  </div>
                ) : null}
                {contentError ? (
                  <div className="alert alert-warning mx-8">{contentError}</div>
                ) : null}
                <div className="form-group mx-8">
                  {content?.type === "SqlProblemContent" && (
                    <SqlProblemForm
                      solution={solution}
                      onSolutionChange={setSolution}
                      onCheck={checkTheSolution}
                      alert={alert}
                      checkingInformation={checkingInformation}
                      succeed={succeed}
                      sqlHint={sqlHint}
                      isHintOpen={isHintOpen}
                      onHintToggle={() => setIsHintOpen((prev) => !prev)}
                      isHintCopied={isHintCopied}
                      onCopyHint={copyHint}
                    />
                  )}
                </div>

                {nextLessonButton && (
                  <div className="show-next-lesson">
                    {nextLessonButton}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
