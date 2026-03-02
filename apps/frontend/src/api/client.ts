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

export { API_URL };
