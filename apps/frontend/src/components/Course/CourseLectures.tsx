import { Link } from "react-router-dom";
import { CheckIcon, BookIcon, ClockIcon } from "../icons";
import { READING_SPEED_WPM } from "../../constants/course";
import lection from "./lection.svg";
import test from "./test.svg";
import type { CourseItem, LectureContent } from "../../types/Course";

function estimateReadingTime(content: LectureContent): string {
  if (content.type === "SqlProblemContent") return "≈10 мин";
  if (!content.body) return "≈2 мин";
  const words = content.body.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / READING_SPEED_WPM));
  return `≈${minutes} мин`;
}

interface CourseLecturesProps {
  course: CourseItem;
  courseId: string;
  completedLessonIds: number[];
  filteredVisitedIds: number[];
  filteredSolvedIds: number[];
  isParticipating: boolean | null;
  isOwner: boolean;
  onLessonClick: (e: React.MouseEvent, lectureId: number, contentId: number, contentTitle: string) => void;
}

export function CourseLectures(props: CourseLecturesProps) {
  const {
    course,
    courseId,
    completedLessonIds,
    filteredVisitedIds,
    filteredSolvedIds,
    isParticipating,
    isOwner,
    onLessonClick,
  } = props;

  if (course.lectures.length === 0) {
    return (
      <div className="course-empty-state">
        <div className="course-empty-icon" aria-hidden="true">
          <BookIcon />
        </div>
        <p className="course-empty-title">Уроки ещё не добавлены</p>
        <p className="course-empty-desc">
          Автор работает над материалами курса. Загляните позже.
        </p>
        {isOwner && (
          <Link to={`/courses/${courseId}/teach`} className="button mt-4">
            Добавить первый урок
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="course-roadmap">
      <header className="ml-8 mt-6 text-2xl font-bold mb-5 course-title flex flex-wrap items-center justify-between gap-4">
        <span>Программа курса</span>
        {isOwner && (
          <Link to={`/courses/${courseId}/teach`} className="button button--ghost text-base">
            Добавить контент
          </Link>
        )}
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
                    to={`/courses/${courseId}/lectures/${lecture.id}/contents/${content.id}`}
                    className={`link course-lesson ${isDone ? "course-lesson--done" : ""}`}
                    onClick={(e) => onLessonClick(e, lecture.id, content.id, content.title)}
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
  );
}
