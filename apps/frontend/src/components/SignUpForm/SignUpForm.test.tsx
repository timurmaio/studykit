import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { SignUpForm } from "./index";

function renderSignUpForm(props: Partial<Parameters<typeof SignUpForm>[0]> = {}) {
  const defaultProps = {
    handleSubmit: vi.fn((e: React.FormEvent) => e.preventDefault()),
    handleChange: vi.fn(),
    handleBlur: vi.fn(),
    changeFormType: vi.fn(),
    error: "",
    fieldErrors: {},
  };
  return render(
    <MemoryRouter>
      <SignUpForm {...defaultProps} {...props} />
    </MemoryRouter>
  );
}

describe("SignUpForm", () => {
  it("renders all form fields", () => {
    renderSignUpForm();
    expect(screen.getByLabelText(/имя/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/фамилия/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument();
  });

  it("shows field errors when provided", () => {
    renderSignUpForm({
      fieldErrors: {
        firstName: "Введите имя",
        lastName: "Введите фамилию",
        email: "Неверный формат email",
        password: "Пароль должен быть не менее 6 символов",
      },
    });
    expect(screen.getByText("Введите имя")).toBeInTheDocument();
    expect(screen.getByText("Введите фамилию")).toBeInTheDocument();
    expect(screen.getByText("Неверный формат email")).toBeInTheDocument();
    expect(screen.getByText(/пароль должен быть/i)).toBeInTheDocument();
  });

  it("shows server error alert", () => {
    renderSignUpForm({ error: "Email уже используется" });
    expect(screen.getByRole("alert")).toHaveTextContent("Email уже используется");
  });

  it("calls handleBlur when field loses focus", async () => {
    const user = userEvent.setup();
    const handleBlur = vi.fn();
    renderSignUpForm({ handleBlur });
    const input = screen.getByPlaceholderText("Иван");
    await user.click(input);
    await user.tab();
    expect(handleBlur).toHaveBeenCalled();
  });

  it("disables submit button when isLoading", () => {
    renderSignUpForm({ isLoading: true });
    const btn = screen.getByRole("button", { name: /рег/i });
    expect(btn).toBeDisabled();
  });

  it("calls handleSubmit on form submit", () => {
    const handleSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    renderSignUpForm({ handleSubmit });
    const form = screen.getByRole("button", { name: /зарегистрироваться/i }).closest("form");
    if (!form) throw new Error("Form not found");
    fireEvent.submit(form);
    expect(handleSubmit).toHaveBeenCalled();
  });

  it("has link to sign in page", () => {
    renderSignUpForm();
    const link = screen.getByRole("link", { name: /войти/i });
    expect(link).toHaveAttribute("href", "/signin");
  });
});
