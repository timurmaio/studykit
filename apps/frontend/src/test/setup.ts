import "@testing-library/jest-dom/vitest";
import "../i18n";

// Recharts uses ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
