import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Profile } from "./index";

vi.mock("../../config", () => ({
  apiPut: vi.fn(),
}));

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 1 },
    signOut: vi.fn(),
  }),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockProfileData = {
  user: { firstName: "Иван", lastName: "Петров", email: "ivan@test.com" },
  courses: [],
};

vi.mock("../../routes", () => ({
  useProfileLoaderData: () => mockProfileData,
}));

function renderProfile() {
  return render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>
  );
}

describe("Profile", () => {
  it("renders user name", () => {
    renderProfile();
    expect(screen.getByText(/иван петров/i)).toBeInTheDocument();
  });

  it("renders Личные данные section", () => {
    renderProfile();
    expect(screen.getByText("Личные данные")).toBeInTheDocument();
  });

  it("shows edit form when clicking Изменить профиль", async () => {
    const user = userEvent.setup();
    renderProfile();
    await user.click(screen.getByRole("button", { name: /изменить профиль/i }));
    expect(screen.getByPlaceholderText("Введите имя")).toBeInTheDocument();
  });
});
