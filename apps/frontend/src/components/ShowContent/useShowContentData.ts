import { useEffect, useRef, useState } from "react";
import { apiGet, apiPost } from "../../config";
import type { CourseItem, LectureContent } from "../../types/Course";

interface UseShowContentDataParams {
  courseId: string;
  lectureId: string;
  contentId: string;
  userId?: number;
}

interface UseShowContentDataResult {
  course: CourseItem | null;
  content: LectureContent | null;
  contentError: string;
  isLoading: boolean;
  isParticipating: boolean;
  statistics: number;
  visitedContentIds: number[];
}

export function useShowContentData(params: UseShowContentDataParams): UseShowContentDataResult {
  const { courseId, lectureId, contentId, userId } = params;
  const [course, setCourse] = useState<CourseItem | null>(null);
  const [content, setContent] = useState<LectureContent | null>(null);
  const [contentError, setContentError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isParticipating, setIsParticipating] = useState(false);
  const [statistics, setStatistics] = useState(0);
  const [visitedContentIds, setVisitedContentIds] = useState<number[]>([]);
  const streamAbortRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!courseId || !lectureId || !contentId) return;

    const cId = Number(courseId);
    const currentContentId = Number(contentId);

    setIsLoading(true);
    if (streamAbortRef.current) {
      streamAbortRef.current();
      streamAbortRef.current = null;
    }

    const updateLastVisited = (contentTitle: string) => {
      try {
        localStorage.setItem(
          `last_visited_${cId}`,
          JSON.stringify({ lectureId: Number(lectureId), contentId: currentContentId, contentTitle })
        );
      } catch {}
    };

    if (userId) {
      apiPost(`/api/courses/${cId}/progress`, {
        lectureContentId: currentContentId,
      }).catch(() => {});
    }

    const loadData = async () => {
      const results = await Promise.allSettled([
        apiGet<LectureContent>(`/api/lectures/${lectureId}/contents/${contentId}`),
        apiGet<CourseItem>(`/api/courses/${courseId}`),
        apiGet<{ participating: boolean }>(`/api/courses/${courseId}/enrollment`),
        userId
          ? apiGet<{
              completedCount: number;
              totalContent: number;
              viewedContentIds?: number[];
            }>(`/api/courses/${courseId}/progress`)
          : Promise.resolve(null),
      ]);

      const [contentRes, courseRes, enrollmentRes, progressRes] = results;

      if (contentRes.status === "fulfilled" && contentRes.value) {
        setContent(contentRes.value);
        setContentError("");
        if (contentRes.value.title) updateLastVisited(contentRes.value.title);
      } else if (contentRes.status === "rejected") {
        const err = contentRes.reason as { errors?: string | string[] };
        setContentError(
          Array.isArray(err?.errors) ? err.errors.join(", ") : String(err?.errors ?? "Не удалось загрузить содержимое лекции")
        );
      }

      if (courseRes.status === "fulfilled" && courseRes.value) {
        setCourse(courseRes.value);
      }

      if (enrollmentRes.status === "fulfilled" && enrollmentRes.value) {
        setIsParticipating(enrollmentRes.value.participating);
      }

      if (progressRes.status === "fulfilled" && progressRes.value) {
        const { completedCount, totalContent, viewedContentIds: vIds } = progressRes.value;
        const ratio = totalContent > 0 ? completedCount / totalContent : 0;
        setStatistics(Math.max(0, Math.min(100, Math.round(ratio * 100))));
        setVisitedContentIds(vIds ?? []);
      }

      setIsLoading(false);
    };

    loadData();

    return () => {
      if (streamAbortRef.current) {
        streamAbortRef.current();
        streamAbortRef.current = null;
      }
    };
  }, [courseId, lectureId, contentId, userId]);

  return {
    course,
    content,
    contentError,
    isLoading,
    isParticipating,
    statistics,
    visitedContentIds,
  };
}
