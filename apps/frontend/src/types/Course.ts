/**
 * Course and lecture types aligned with API responses.
 * API: GET /api/courses, GET /api/courses/:id, GET /api/lectures/:id/contents/:id
 */

export interface CourseOwner {
  id?: number;
  firstName: string;
  lastName: string;
  email?: string;
  avatar?: string | null;
  role?: string;
}

export interface CourseItem {
  id: number;
  title: string;
  description: string;
  avatar: string | null;
  type?: string;
  lectures: Lecture[];
  solvedIds: number[];
  owner: CourseOwner;
  createdAt: number | string;
}

export interface Lecture {
  id: number;
  title: string;
  content: LectureContent[];
}

export type LectureContentType = "MarkdownContent" | "SqlProblemContent" | "VideoContent";

export interface LectureContent {
  id: number;
  title?: string;
  body?: string;
  type: LectureContentType;
  /** From lectures API (camelCase) */
  sqlProblemId?: number;
  /** From courses API (snake_case) — prefer sqlProblemId when available */
  sql_problem_id?: number;
  /** From lectures API */
  lectureId?: number;
  serial_number?: number;
  serialNumber?: number;
  url?: string;
}
