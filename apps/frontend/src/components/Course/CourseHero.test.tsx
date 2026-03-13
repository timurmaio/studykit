import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CourseHero } from "./CourseHero";

const mockCourse: Parameters<typeof CourseHero>[0]["course"] = {
  id: 1,
  title: "SQL Основы",
  description: "Курс по базам данных",
  type: "Практический",
  avatar: "",
  solvedIds: [],
  createdAt: 0,
  owner: { firstName: "Иван", lastName: "Петров" },
  lectures: [
    {
      id: 10,
      title: "Введение",
      content: [{ id: 1, title: "Урок 1", type: "MarkdownContent" }],
    },
    {
      id: 11,
      title: "SELECT",
      content: [{ id: 2, title: "Урок 2", type: "MarkdownContent" }],
    },
  ],
};

function renderCourseHero(overrides: Partial<Parameters<typeof CourseHero>[0]> = {}) {
  const props = {
    course: mockCourse,
    courseId: "1",
    avatarSrc: "/avatar.png",
    createdDate: "1 января 2025",
    totalLessons: 2,
    learningProgress: 50,
    completedLessonIds: [1],
    isParticipating: true,
    isOwner: false,
    alert: "",
    ctaSection: null,
    ...overrides,
  };
  return render(
    <MemoryRouter>
      <CourseHero {...props} />
    </MemoryRouter>
  );
}

describe("CourseHero", () => {
  it("renders course title and description", () => {
    renderCourseHero();
    expect(screen.getByText("SQL Основы")).toBeInTheDocument();
    expect(screen.getByText("Курс по базам данных")).toBeInTheDocument();
  });

  it("renders owner name", () => {
    renderCourseHero();
    expect(screen.getByText(/иван петров/i)).toBeInTheDocument();
  });

  it("renders lessons count", () => {
    renderCourseHero();
    expect(screen.getByText(/2 уроков/i)).toBeInTheDocument();
  });

  it("renders progress bar when participating", () => {
    renderCourseHero({ learningProgress: 75 });
    const fill = document.querySelector(".course-progress-bar__fill");
    expect(fill).toHaveStyle({ width: "75%" });
  });

  it("renders CTA section when provided", () => {
    renderCourseHero({
      ctaSection: <button>Подписаться на курс</button>,
    });
    expect(screen.getByRole("button", { name: /подписаться/i })).toBeInTheDocument();
  });

  it("links back to courses list", () => {
    renderCourseHero();
    const link = screen.getByRole("link", { name: /все курсы/i });
    expect(link).toHaveAttribute("href", "/courses");
  });
});
