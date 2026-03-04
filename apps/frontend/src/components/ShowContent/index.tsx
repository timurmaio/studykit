import { useRef, useMemo, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../../contexts/AuthContext";
import { ArrowRightIcon } from "../icons";
import { useShowContentData } from "./useShowContentData";
import { ShowSidebar } from "./ShowSidebar";
import { SqlProblemSection } from "./SqlProblemSection";

export function ShowContent() {
  const { id, lectureId, contentId } = useParams();
  const { user: authUser } = useAuth();
  const streamAbortRef = useRef<(() => void) | null>(null);

  const {
    course,
    content,
    contentError,
    isLoading,
    isParticipating,
    statistics,
    visitedContentIds,
  } = useShowContentData({
    courseId: id ?? "",
    lectureId: lectureId ?? "",
    contentId: contentId ?? "",
    userId: authUser?.id,
  });

  const navigationData = useMemo(() => {
    if (!course) return null;

    const allContents: Array<{ lectureId: number; contentId: number }> = [];
    course.lectures.forEach((lecture) => {
      lecture.content.forEach((c) => {
        allContents.push({ lectureId: lecture.id, contentId: c.id });
      });
    });

    const currentIndex = allContents.findIndex((c) => c.contentId === Number(contentId));
    const nextContent =
      currentIndex >= 0 && currentIndex < allContents.length - 1
        ? allContents[currentIndex + 1]
        : null;

    return { nextContent };
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

  const setStreamAbort = (abort: (() => void) | null) => {
    streamAbortRef.current = abort;
  };

  useEffect(() => {
    return () => {
      if (streamAbortRef.current) {
        streamAbortRef.current();
        streamAbortRef.current = null;
      }
    };
  }, []);

  if (!course) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 show-page">
      <div className="course-decor course-decor--mint" aria-hidden="true" />
      <div className="course-decor course-decor--peach" aria-hidden="true" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4 mb-6">
          <ShowSidebar
            course={course}
            courseId={id!}
            lectureId={lectureId!}
            contentId={contentId!}
            isParticipating={isParticipating}
            statistics={statistics}
            visitedContentIds={visitedContentIds}
          />
        </div>
        <div className="lg:col-span-8">
          <div className="panel show-content-panel">
            {isLoading ? (
              <div className="show-content-skeleton mx-8 mt-6">
                <div className="show-content-skeleton-title" />
                <div className="show-content-skeleton-line" />
                <div className="show-content-skeleton-line" style={{ width: "95%" }} />
                <div className="show-content-skeleton-line" style={{ width: "88%" }} />
                <div className="show-content-skeleton-line" style={{ width: "70%" }} />
                <div className="show-content-skeleton-line" style={{ width: "92%" }} />
                <div className="show-content-skeleton-line" style={{ width: "65%" }} />
              </div>
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
                    <SqlProblemSection
                      key={content.id}
                      content={content}
                      onStreamAbortRef={setStreamAbort}
                    />
                  )}
                </div>

                {nextLessonButton && (
                  <div className="show-next-lesson">{nextLessonButton}</div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
