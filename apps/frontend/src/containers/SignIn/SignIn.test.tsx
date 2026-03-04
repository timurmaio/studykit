import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { SignIn } from "./index";

// Mock config
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

function renderSignIn() {
  return render(
    <MemoryRouter>
      <SignIn />
    </MemoryRouter>
  );
}

describe("SignIn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows validation errors on submit when fields are empty", () => {
    renderSignIn();
    const form = screen.getByRole("button", { name: /войти/i }).closest("form");
    if (!form) throw new Error("Form not found");
    fireEvent.submit(form);
    expect(screen.getByText("Введите email")).toBeInTheDocument();
    expect(screen.getByText("Введите пароль")).toBeInTheDocument();
  });

  it("shows validation error for invalid email", async () => {
    const user = userEvent.setup();
    renderSignIn();
    await user.type(screen.getByPlaceholderText("example@mail.com"), "invalid");
    await user.type(screen.getByPlaceholderText("••••••"), "123456");
    await user.click(screen.getByRole("button", { name: /войти/i }));
    expect(screen.getByText("Неверный формат email")).toBeInTheDocument();
  });

  it("shows validation error for short password", async () => {
    const user = userEvent.setup();
    renderSignIn();
    await user.type(screen.getByPlaceholderText("example@mail.com"), "test@test.com");
    await user.type(screen.getByPlaceholderText("••••••"), "12345");
    await user.click(screen.getByRole("button", { name: /войти/i }));
    expect(screen.getByText("Пароль должен быть не менее 6 символов")).toBeInTheDocument();
  });
});
