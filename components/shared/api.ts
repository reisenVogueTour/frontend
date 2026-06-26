const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export class APIError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.errors = errors;
  }
}

export async function fetchAPI<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  let responseData: any;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    responseData = await response.json();
  } else {
    responseData = { message: await response.text() };
  }

  if (!response.ok) {
    throw new APIError(
      responseData.message || `API request failed with status ${response.status}`,
      response.status,
      responseData.errors
    );
  }

  return responseData.data as T;
}
