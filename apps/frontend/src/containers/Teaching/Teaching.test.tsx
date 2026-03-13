import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Teaching } from "./index";
import * as config from "../../config";

vi.mock("../../config", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: 1 } }),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));

const mockApiGet = vi.mocked(config.apiGet);

function renderTeaching() {
  return render(
    <MemoryRouter>
      <Teaching />
    </MemoryRouter>
  );
}

describe("Teaching", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiGet.mockResolvedValue([]);
  });

  it("renders heading", async () => {
    renderTeaching();
    expect(await screen.findByText("Преподавание")).toBeInTheDocument();
  });

  it("shows create course button", async () => {
    renderTeaching();
    expect(await screen.findByRole("button", { name: /создать курс/i })).toBeInTheDocument();
  });

  it("shows empty state when no courses", async () => {
    renderTeaching();
    expect(
      await screen.findByText(/у вас пока нет курсов/i)
    ).toBeInTheDocument();
  });

  it("shows create form when clicking create button", async () => {
    const user = userEvent.setup();
    renderTeaching();
    await user.click(await screen.findByRole("button", { name: /создать курс/i }));
    expect(screen.getByPlaceholderText("Название курса")).toBeInTheDocument();
  });
});
