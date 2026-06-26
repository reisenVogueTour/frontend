export type UserRole = "customer" | "provider" | "admin";

export type AuthUser = {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email: string;
  role: UserRole;
  createdAt?: string;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

type RegisterResponse = AuthUser | { user: AuthUser };

type LoginResponse =
  | AuthResponse
  | {
      user: AuthUser;
      accessToken?: string;
      refreshToken?: string;
    };

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  error?: {
    message?: string;
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      `Could not reach the backend at ${API_URL}. Check that the API server is running.`,
    );
  }

  const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;

  if (!response.ok) {
    throw new Error(
      payload.error?.message || payload.message || "Something went wrong",
    );
  }

  if (!payload.data) {
    throw new Error("API response did not include data");
  }

  return payload.data;
}

function unwrapRegisterResponse(data: RegisterResponse) {
  if ("user" in data) {
    return data.user;
  }

  return data;
}

function unwrapLoginResponse(data: LoginResponse): AuthResponse {
  const token = "token" in data ? data.token : data.accessToken;

  if (!token) {
    throw new Error("Login response did not include an auth token");
  }

  return {
    user: data.user,
    token,
  };
}

export function registerUser(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: Exclude<UserRole, "admin">;
}) {
  return apiRequest<RegisterResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  }).then(unwrapRegisterResponse);
}

export function loginUser(input: { email: string; password: string }) {
  return apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  }).then(unwrapLoginResponse);
}
