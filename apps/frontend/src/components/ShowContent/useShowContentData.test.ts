import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useShowContentData } from "./useShowContentData";
import * as config from "../../config";

vi.mock("../../config", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

const mockApiGet = vi.mocked(config.apiGet);
const mockApiPost = vi.mocked(config.apiPost);

const mockContent = {
  id: 1,
  title: "Test Content",
  body: "# Hello",
  type: "MarkdownContent",
  serial_number: 0,
};

const mockCourse = {
  id: 1,
  title: "Test Course",
  lectures: [{ id: 10, title: "L1", content: [mockContent] }],
};

describe("useShowContentData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiGet.mockImplementation((path: string) => {
      if (path.includes("/lectures/10/contents/1")) return Promise.resolve(mockContent);
      if (path.includes("/courses/1") && !path.includes("/enrollment") && !path.includes("/progress"))
        return Promise.resolve(mockCourse);
      if (path.includes("/enrollment")) return Promise.resolve({ participating: true });
      if (path.includes("/progress")) return Promise.resolve({ completedCount: 0, totalContent: 1, viewedContentIds: [] });
      return Promise.reject(new Error(`Unknown path: ${path}`));
    });
    mockApiPost.mockResolvedValue({});
  });

  it("returns loading initially", () => {
    const { result } = renderHook(() =>
      useShowContentData({ courseId: "1", lectureId: "10", contentId: "1" })
    );
    expect(result.current.isLoading).toBe(true);
  });

  it("loads course and content", async () => {
    const { result } = renderHook(() =>
      useShowContentData({ courseId: "1", lectureId: "10", contentId: "1" })
    );

    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.course).toEqual(mockCourse);
        expect(result.current.content).toEqual(mockContent);
        expect(result.current.isParticipating).toBe(true);
      },
      { timeout: 2000 }
    );
  });

  it("handles content fetch failure", async () => {
    mockApiGet.mockImplementation((path: string) => {
      if (path.includes("/lectures/10/contents/1")) return Promise.reject({ errors: "Not found" });
      if (path.includes("/courses/1") && !path.includes("/enrollment") && !path.includes("/progress"))
        return Promise.resolve(mockCourse);
      if (path.includes("/enrollment")) return Promise.resolve({ participating: false });
      return Promise.reject(new Error("Unknown"));
    });

    const { result } = renderHook(() =>
      useShowContentData({ courseId: "1", lectureId: "10", contentId: "1" })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.contentError).toBe("Not found");
    expect(result.current.course).toEqual(mockCourse);
  });
});
