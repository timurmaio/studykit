import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Learning } from "./index";

const mockCourses = [
  {
    id: 1,
    title: "Курс 1",
    description: "Описание",
    avatar: null,
    type: "",
    owner: { firstName: "Иван", lastName: "Петров" },
    lectures: [],
  },
];

vi.mock("../../routes", () => ({
  useLearningLoaderData: () => ({ courses: mockCourses }),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigation: () => ({ state: "idle" }),
  };
});

function renderLearning() {
  return render(
    <MemoryRouter>
      <Learning />
    </MemoryRouter>
  );
}

describe("Learning", () => {
  it("renders heading", () => {
    renderLearning();
    expect(screen.getByText(/продолжить обучение/i)).toBeInTheDocument();
  });

  it("renders course list when courses exist", () => {
    renderLearning();
    expect(screen.getByText("Курс 1")).toBeInTheDocument();
  });
});
