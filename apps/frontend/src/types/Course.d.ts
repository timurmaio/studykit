export interface CourseItem {
  id: string;
  title: string;
  description: string;
  avatar: string;
  type: string;
  lectures: Lecture[];
  avatar: string;
  solvedIds: number[];
  owner: {
    firstName: string;
    lastName: string;
  };
  createdAt: number;
  // participating: boolean;
  // statistics: {},
  // alert: string;/
}

export interface Lecture {
  id: number;
  title: string;
  content: LectureContent[];
}

export interface LectureContent {
  id: number;
  title: string;
  body?: string;
  sqlProblemId?: number;
  type: "text" | "MarkdownContent" | "SqlProblemContent";
}
