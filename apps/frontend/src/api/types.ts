export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  avatar?: string;
  role?: number;
}

export interface LoginResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: number;
}

export interface CourseOwner {
  id?: number;
  firstName: string;
  lastName: string;
  email?: string;
  avatar?: string | null;
  role?: number;
}

export interface CourseItem {
  id: number;
  title: string;
  description?: string | null;
  avatar?: string | null;
  owner?: CourseOwner;
  lectures?: Lecture[];
  type?: string;
  createdAt?: number;
  solvedIds?: number[];
}

export interface Lecture {
  id: number;
  title: string;
  content: LectureContent[];
}

export interface LectureContent {
  id: number;
  type: "MarkdownContent" | "SqlProblemContent" | "VideoContent";
  lectureId?: number;
  title?: string;
  body?: string;
  serialNumber?: number;
  sqlProblemId?: number;
}

export interface ProgressResponse {
  viewedContentIds?: number[];
  totalContent: number;
  completedCount: number;
}
