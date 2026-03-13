import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { NewCourse } from "./index";
import * as config from "../../config";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../config", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

const mockApiGet = vi.mocked(config.apiGet);
const mockApiPost = vi.mocked(config.apiPost);

const mockCourse = {
  id: 1,
  title: "Test Course",
  lectures: [
    { id: 10, title: "Лекция 1", content: [] },
    { id: 11, title: "Лекция 2", content: [] },
  ],
};

function renderNewCourse() {
  return render(
    <MemoryRouter initialEntries={["/courses/1/teach"]}>
      <Routes>
        <Route path="/courses/:id/teach" element={<NewCourse />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("NewCourse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiGet.mockResolvedValue(mockCourse);
    mockApiPost.mockResolvedValue({});
  });

  it("shows loading initially", () => {
    mockApiGet.mockImplementation(() => new Promise(() => {}));
    renderNewCourse();
    expect(screen.getByText(/загрузка/i)).toBeInTheDocument();
  });

  it("renders form after course loads", async () => {
    renderNewCourse();
    expect(await screen.findByRole("combobox", { name: /раздел/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/название/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /создать/i })).toBeInTheDocument();
  });

  it("shows lecture options from course", async () => {
    renderNewCourse();
    const select = await screen.findByRole("combobox", { name: /раздел/i });
    expect(select).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Лекция 1" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Лекция 2" })).toBeInTheDocument();
  });

  it("shows validation error when submitting empty form", async () => {
    renderNewCourse();
    await screen.findByRole("combobox", { name: /раздел/i });
    const form = screen.getByRole("button", { name: /создать/i }).closest("form");
    if (!form) throw new Error("Form not found");
    fireEvent.submit(form);
    expect(await screen.findByText("Выберите раздел лекции")).toBeInTheDocument();
    expect(screen.getByText("Укажите название")).toBeInTheDocument();
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    renderNewCourse();
    await screen.findByRole("combobox", { name: /раздел/i });
    await user.selectOptions(
      screen.getByRole("combobox", { name: /раздел/i }),
      screen.getByRole("option", { name: "Лекция 1" })
    );
    await user.type(screen.getByPlaceholderText(/название лекции/i), "Новый контент");
    await user.click(screen.getByRole("button", { name: /создать/i }));
    expect(mockApiPost).toHaveBeenCalledWith(
      "/api/courses/1/contents",
      expect.objectContaining({
        course_content: expect.objectContaining({
          lecture_id: 10,
          title: "Новый контент",
          type: "MarkdownContent",
        }),
      })
    );
    expect(mockNavigate).toHaveBeenCalledWith("/courses/1");
  });
});
