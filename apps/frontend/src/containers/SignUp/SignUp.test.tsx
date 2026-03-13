import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { SignUp } from "./index";
import * as config from "../../config";

vi.mock("../../config", () => ({
  apiPost: vi.fn(),
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

const mockApiPost = vi.mocked(config.apiPost);

function renderSignUp() {
  return render(
    <MemoryRouter>
      <SignUp />
    </MemoryRouter>
  );
}

describe("SignUp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows validation errors on submit when fields are empty", () => {
    renderSignUp();
    const form = screen.getByRole("button", { name: /зарегистрироваться/i }).closest("form");
    if (!form) throw new Error("Form not found");
    fireEvent.submit(form);
    expect(screen.getByText("Введите имя")).toBeInTheDocument();
    expect(screen.getByText("Введите фамилию")).toBeInTheDocument();
  });

  it("shows validation error for invalid email", async () => {
    const user = userEvent.setup();
    renderSignUp();
    await user.type(screen.getByPlaceholderText("Иван"), "Test");
    await user.type(screen.getByPlaceholderText("Иванов"), "User");
    await user.type(screen.getByPlaceholderText("example@mail.com"), "invalid");
    await user.type(screen.getByPlaceholderText("••••••"), "password123");
    const submitBtn = document.getElementById("signup-form-submit");
    if (submitBtn) await user.click(submitBtn);
    expect(screen.getByText("Неверный формат email")).toBeInTheDocument();
  });

  it("navigates to courses on successful signup", async () => {
    const user = userEvent.setup();
    mockApiPost.mockResolvedValue({ id: 1, firstName: "Test", lastName: "User", email: "test@test.com", role: 1 });
    renderSignUp();
    await user.type(screen.getByPlaceholderText("Иван"), "Test");
    await user.type(screen.getByPlaceholderText("Иванов"), "User");
    await user.type(screen.getByPlaceholderText("example@mail.com"), "test@test.com");
    await user.type(screen.getByPlaceholderText("••••••"), "password123");
    const submitBtn = document.getElementById("signup-form-submit");
    if (submitBtn) await user.click(submitBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/courses");
  });
});
