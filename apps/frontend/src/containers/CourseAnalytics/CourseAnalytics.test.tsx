import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { CourseAnalytics } from "./index";
import * as config from "../../config";

vi.mock("../../config", () => ({
  apiGet: vi.fn(),
}));

const mockApiGet = vi.mocked(config.apiGet);

const mockAnalyticsData = {
  courseTitle: "Тестовый курс",
  summary: {
    totalParticipants: 5,
    totalContent: 10,
    totalProblems: 15,
    avgProgressPercent: 60,
    avgProblemsSolved: 3,
  },
  participants: [
    {
      userId: 1,
      firstName: "Иван",
      lastName: "Петров",
      email: "ivan@test.com",
      progressPercent: 80,
      solvedProblems: 5,
      totalProblems: 15,
    },
  ],
};

function renderCourseAnalytics() {
  return render(
    <MemoryRouter initialEntries={["/courses/1/analytics"]}>
      <Routes>
        <Route path="/courses/:id/analytics" element={<CourseAnalytics />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("CourseAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiGet.mockResolvedValue({ data: mockAnalyticsData });
  });

  it("renders loading state initially", () => {
    mockApiGet.mockImplementation(() => new Promise(() => {}));
    renderCourseAnalytics();
    expect(screen.getByText(/загрузка аналитики/i)).toBeInTheDocument();
  });

  it("renders course title and analytics when loaded", async () => {
    renderCourseAnalytics();
    expect(await screen.findByText("Тестовый курс")).toBeInTheDocument();
    expect(await screen.findByText("Аналитика по участникам курса")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders error state on API failure", async () => {
    mockApiGet.mockRejectedValue(new Error("API error"));
    renderCourseAnalytics();
    expect(await screen.findByText(/не удалось загрузить аналитику/i)).toBeInTheDocument();
    expect(screen.getByText(/назад к курсу/i)).toBeInTheDocument();
  });
});
