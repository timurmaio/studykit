import { Link } from "react-router-dom";
import arrow from "./arrow-back.svg";
import lection from "./lection.svg";
import test from "./test.svg";
import type { CourseItem } from "../../types/Course";

interface ShowSidebarProps {
  course: CourseItem;
  courseId: string;
  lectureId: string;
  contentId: string;
  isParticipating: boolean;
  statistics: number;
  visitedContentIds: number[];
}

export function ShowSidebar(props: ShowSidebarProps) {
  const { course, courseId, lectureId, contentId, isParticipating, statistics, visitedContentIds } = props;

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

  return (
    <div className="panel show-sidebar">
      <div className="mx-4 mt-6">
        <Link to={`/courses/${courseId}`} className="link flex mb-4 show-back-link">
          <img src={arrow} alt="" className="mr-3" />
          Вернуться к курсу
        </Link>
        <header className="text-2xl font-bold mb-5 course-title show-course-title">
          {course.title}
        </header>

        {passStatistics}

        {course.lectures.map((lecture) => {
          const lectureVisitedCount = lecture.content.filter((c) =>
            visitedContentIds.includes(c.id)
          ).length;
          const isCurrentLecture = Number(lectureId) === lecture.id;
          return (
            <div
              className={`mb-4 show-lecture-card ${isCurrentLecture ? "show-lecture-card--active" : ""}`}
              key={lecture.id}
            >
              <div className="show-lecture-header">
                <p className="text-xl mb-0 show-lecture-title">{lecture.title}</p>
                {isParticipating && (
                  <span className="show-lecture-progress">
                    {lectureVisitedCount}/{lecture.content.length}
                  </span>
                )}
              </div>

              {lecture.content.map((content) => {
                const contentIcon = content.type === "MarkdownContent" ? lection : test;
                const isVisited = visitedContentIds.includes(content.id);
                const isCurrent = Number(contentId) === content.id;
                return (
                  <Link
                    to={`/courses/${courseId}/lectures/${lecture.id}/contents/${content.id}`}
                    className={`link course-lesson ${isCurrent ? "show-lesson--active" : ""}`}
                    key={content.id}
                  >
                    <div className="list-item flex align-items-center course-lesson-row">
                      {isParticipating && (
                        <span
                          className={`circle ${isVisited ? "circle--green" : ""} ml-2 mr-4`}
                        />
                      )}
                      <img src={contentIcon} className="mr-4" alt="Иконка контента" />
                      <span className="course-lesson-title">{content.title}</span>
                      {isParticipating && isVisited && (
                        <span className="ml-4 text-xs course-lesson-status">Пройдено</span>
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
  );
}
