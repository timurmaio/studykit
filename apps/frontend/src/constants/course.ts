export const DEFAULT_COURSE_AVATAR =
  "https://cf-images.us-east-1.prod.boltdns.net/v1/static/62009828001/c04c4184-85ef-4a71-9313-8a6ae90b1157/785c0b4b-fbae-48ac-8a74-cfabb0c3921c/1280x720/match/image.jpg";

export const READING_SPEED_WPM = 200;

export function getLastVisitedKey(courseId: string | number): string {
  return `last_visited_${courseId}`;
}

export interface LastVisited {
  lectureId: number;
  contentId: number;
  contentTitle: string;
}

export function saveLastVisited(courseId: string | number, data: LastVisited): void {
  try {
    localStorage.setItem(getLastVisitedKey(courseId), JSON.stringify(data));
  } catch {}
}

export function loadLastVisited(courseId: string | number): LastVisited | null {
  try {
    const raw = localStorage.getItem(getLastVisitedKey(courseId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
