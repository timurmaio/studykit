import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Course } from "./index";
import * as config from "../../config";

vi.mock("../../config", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiDelete: vi.fn(),
}));

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: 1 } }),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useRevalidator: () => ({ state: "idle", revalidate: vi.fn() }),
  };
});

vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));

const mockCourse = {
  id: 1,
  title: "Тестовый курс",
  description: "Описание",
  avatar: null,
  type: "Практический",
  createdAt: Date.now() / 1000,
  owner: { id: 1, firstName: "Иван", lastName: "Петров" },
  lectures: [
    {
      id: 10,
      title: "Раздел 1",
      content: [{ id: 100, title: "Урок 1", type: "MarkdownContent" as const }],
    },
  ],
  solvedIds: [],
};

const mockApiGet = vi.mocked(config.apiGet);

function renderCourse() {
  return render(
    <MemoryRouter initialEntries={["/courses/1"]}>
      <Routes>
        <Route path="/courses/:id" element={<Course />} />
      </Routes>
    </MemoryRouter>
  );
}

// Course uses useCourseLoaderData which comes from the router's loader data.
// We need to provide loader data - but createBrowserRouter/useLoaderData
// gets data from the matching route. With MemoryRouter + Routes we don't
// have loaders. So we need to mock useCourseLoaderData.
vi.mock("../../routes", () => ({
  useCourseLoaderData: vi.fn(),
}));

import { useCourseLoaderData } from "../../routes";

const mockUseCourseLoaderData = vi.mocked(useCourseLoaderData);

describe("Course", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCourseLoaderData.mockReturnValue({
      course: mockCourse,
      participating: false,
      error: null,
    });
    mockApiGet.mockResolvedValue({ viewedContentIds: [] });
  });

  it("renders course title", async () => {
    renderCourse();
    expect(await screen.findByText("Тестовый курс")).toBeInTheDocument();
  });

  it("shows subscribe button when not participating", async () => {
    renderCourse();
    expect(await screen.findByRole("button", { name: /подписаться на курс/i })).toBeInTheDocument();
  });

  it("shows start learning when participating with no progress", async () => {
    mockUseCourseLoaderData.mockReturnValue({
      course: mockCourse,
      participating: true,
      error: null,
    });
    renderCourse();
    expect(await screen.findByText(/начать обучение/i)).toBeInTheDocument();
  });

  it("shows error state when loader has error", async () => {
    mockUseCourseLoaderData.mockReturnValue({
      course: null,
      participating: false,
      error: "Не удалось загрузить курс",
    });
    renderCourse();
    expect(await screen.findByRole("heading", { name: /не удалось загрузить курс/i })).toBeInTheDocument();
  });
});
