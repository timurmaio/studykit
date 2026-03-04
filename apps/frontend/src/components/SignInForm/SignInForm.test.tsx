import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { SignInForm } from "./index";

function renderSignInForm(props: Partial<Parameters<typeof SignInForm>[0]> = {}) {
  const defaultProps = {
    handleSubmit: vi.fn((e) => e.preventDefault()),
    handleChange: vi.fn(),
    handleBlur: vi.fn(),
    error: "",
    fieldErrors: {},
  };
  return render(
    <MemoryRouter>
      <SignInForm {...defaultProps} {...props} />
    </MemoryRouter>
  );
}

describe("SignInForm", () => {
  it("renders email and password fields", () => {
    renderSignInForm();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument();
  });

  it("shows field errors when provided", () => {
    renderSignInForm({
      fieldErrors: { email: "Введите email", password: "Введите пароль" },
    });
    expect(screen.getByText("Введите email")).toBeInTheDocument();
    expect(screen.getByText("Введите пароль")).toBeInTheDocument();
  });

  it("shows server error alert", () => {
    renderSignInForm({ error: "Неверный пароль" });
    expect(screen.getByRole("alert")).toHaveTextContent("Неверный пароль");
  });

  it("calls handleBlur when field loses focus", async () => {
    const user = userEvent.setup();
    const handleBlur = vi.fn();
    renderSignInForm({ handleBlur });
    const emailInput = screen.getByPlaceholderText("example@mail.com");
    await user.click(emailInput);
    await user.tab();
    expect(handleBlur).toHaveBeenCalled();
  });

  it("disables submit button when isLoading", () => {
    renderSignInForm({ isLoading: true });
    expect(screen.getByRole("button", { name: /вход/i })).toBeDisabled();
  });

  it("calls handleSubmit on form submit", () => {
    const handleSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    renderSignInForm({ handleSubmit });
    const form = screen.getByRole("button", { name: /войти/i }).closest("form");
    if (!form) throw new Error("Form not found");
    fireEvent.submit(form);
    expect(handleSubmit).toHaveBeenCalled();
  });
});
