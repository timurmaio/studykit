const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3100";

const defaultOptions: RequestInit = {
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
};

export interface ApiError {
  errors: string | string[];
}

async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(response.statusText || "Request failed");
  }

  if (!response.ok) {
    const errData = data as { errors?: string | string[] };
    const errors = errData?.errors ?? response.statusText;
    const err: ApiError = {
      errors: Array.isArray(errors) ? errors.join(", ") : String(errors),
    };
    throw err;
  }

  return data as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...defaultOptions,
    method: "GET",
  });
  return handleResponse<T>(response);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...defaultOptions,
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(response);
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...defaultOptions,
    method: "PUT",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(response);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...defaultOptions,
    method: "DELETE",
  });
  return handleResponse<T>(response);
}

export interface SqlSolutionStreamResult {
  succeed: boolean | null;
  timeout?: boolean;
}

export function apiSqlSolutionStream(
  solutionId: number,
  onResult: (result: SqlSolutionStreamResult) => void
): () => void {
  const url = `${API_URL}/api/sql-solutions/${solutionId}/stream`;
  const controller = new AbortController();

  fetch(url, {
    credentials: "include",
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok || !response.body) {
        onResult({ succeed: null });
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const block of lines) {
          const eventMatch = block.match(/^event:\s*(\S+)/m);
          const dataMatch = block.match(/^data:\s*([\s\S]*)/m);

          if (eventMatch?.[1] === "result" && dataMatch?.[1]) {
            try {
              const parsed = JSON.parse(dataMatch[1].trim()) as SqlSolutionStreamResult;
              onResult(parsed);
            } catch {
              onResult({ succeed: null });
            }
            return;
          }
          if (eventMatch?.[1] === "error") {
            onResult({ succeed: null });
            return;
          }
        }
      }
    })
    .catch(() => {
      onResult({ succeed: null });
    });

  return () => controller.abort();
}

export { API_URL };
