import { describe, it, expect } from "vitest";
import { validateEmail, validatePassword, validateRequired } from "./validation";

describe("validateEmail", () => {
  it("returns error for empty string", () => {
    expect(validateEmail("")).toBe("Введите email");
    expect(validateEmail("   ")).toBe("Введите email");
  });

  it("returns error for invalid format", () => {
    expect(validateEmail("invalid")).toBe("Неверный формат email");
    expect(validateEmail("missing@")).toBe("Неверный формат email");
    expect(validateEmail("@domain.com")).toBe("Неверный формат email");
  });

  it("returns null for valid emails", () => {
    expect(validateEmail("user@example.com")).toBeNull();
    expect(validateEmail("user.name@domain.co")).toBeNull();
    expect(validateEmail(" user@test.ru ")).toBeNull();
  });
});

describe("validatePassword", () => {
  it("returns error for empty password", () => {
    expect(validatePassword("")).toBe("Введите пароль");
  });

  it("returns error for short password", () => {
    expect(validatePassword("12345")).toBe("Пароль должен быть не менее 6 символов");
  });

  it("returns null for valid password", () => {
    expect(validatePassword("123456")).toBeNull();
    expect(validatePassword("password")).toBeNull();
  });
});

describe("validateRequired", () => {
  it("returns error for empty value", () => {
    expect(validateRequired("", "имя")).toBe("Введите имя");
    expect(validateRequired("   ", "фамилию")).toBe("Введите фамилию");
  });

  it("returns null for non-empty value", () => {
    expect(validateRequired("Иван", "имя")).toBeNull();
    expect(validateRequired("  text  ", "поле")).toBeNull();
  });
});
