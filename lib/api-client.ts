import type {
  AdminDashboardResponse,
  ApiError,
  ApiSuccess,
  AuthResponse,
  Booking,
  CreateBookingRequest,
  CreateDestinationRequest,
  CreateExperienceRequest,
  CreateProviderApplicationRequest,
  DashboardResponse,
  Destination,
  Experience,
  ExperienceQueryParams,
  LoginRequest,
  Paginated,
  Provider,
  ProviderApplicationStatus,
  ProviderDashboardResponse,
  PublicProvider,
  PublicUser,
  RegisterRequest,
  ReviewProviderApplicationRequest,
  UpdateExperienceRequest,
} from "./types/reisen";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5500";

export class ApiRequestError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("tc_token");
}

function buildQuery(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return "";
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
  if (entries.length === 0) return "";
  const search = new URLSearchParams(entries.map(([k, v]) => [k, String(v)]));
  return `?${search.toString()}`;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  const json = (await res.json()) as (ApiSuccess<T> & { message?: string }) | ApiError;

  if (!res.ok || json.success === false) {
    const message = "message" in json && json.message ? json.message : "Request failed";
    const errors = "errors" in json ? json.errors : undefined;
    throw new ApiRequestError(message, res.status, errors);
  }

  return (json as ApiSuccess<T>).data;
}

// ---------- Auth ----------
export const authApi = {
  register: (body: RegisterRequest) =>
    apiFetch<AuthResponse>("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: LoginRequest) =>
    apiFetch<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),

  me: () => apiFetch<PublicUser>("/api/auth/me"),
};

// ---------- Users (customer dashboard) ----------
export const usersApi = {
  getDashboard: () => apiFetch<DashboardResponse>("/api/users/me/dashboard"),
};

// ---------- Experiences ----------
export const experiencesApi = {
  list: (params?: ExperienceQueryParams) =>
    apiFetch<Paginated<Experience>>(`/api/experiences${buildQuery(params as Record<string, string | number | boolean | undefined>)}`),

  featured: (limit = 10) => apiFetch<Experience[]>(`/api/experiences/featured${buildQuery({ limit })}`),

  getById: (experienceId: string) => apiFetch<Experience>(`/api/experiences/${experienceId}`),

  create: (body: CreateExperienceRequest) =>
    apiFetch<Experience>("/api/experiences", { method: "POST", body: JSON.stringify(body) }),

  update: (experienceId: string, body: UpdateExperienceRequest) =>
    apiFetch<Experience>(`/api/experiences/${experienceId}`, { method: "PATCH", body: JSON.stringify(body) }),
};

// ---------- Destinations ----------
export const destinationsApi = {
  list: (params?: { featured?: boolean; limit?: number; cursor?: string }) =>
    apiFetch<Paginated<Destination>>(`/api/destinations${buildQuery(params)}`),

  featured: () => apiFetch<Destination[]>("/api/destinations/featured"),

  getBySlug: (slug: string) => apiFetch<Destination>(`/api/destinations/${slug}`),

  create: (body: CreateDestinationRequest) =>
    apiFetch<Destination>("/api/destinations", { method: "POST", body: JSON.stringify(body) }),
};

// ---------- Bookings ----------
export const bookingsApi = {
  create: (body: CreateBookingRequest) =>
    apiFetch<Booking>("/api/bookings", { method: "POST", body: JSON.stringify(body) }),
  list: (params?: { limit?: number; cursor?: string }) =>
    apiFetch<Paginated<Booking>>(`/api/bookings${buildQuery(params)}`),

  getById: (bookingId: string) => apiFetch<Booking>(`/api/bookings/${bookingId}`),

  updateStatus: (bookingId: string, status: Booking["status"]) =>
    apiFetch<Booking>(`/api/bookings/${bookingId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// ---------- Saved experiences ----------
export const savedApi = {
  list: () => apiFetch<Experience[]>("/api/saved"),

  save: (experienceId: string) =>
    apiFetch<{ userId: string; experienceId: string; savedAt: string }>(`/api/saved/${experienceId}`, {
      method: "POST",
    }),

  unsave: (experienceId: string) =>
    apiFetch<undefined>(`/api/saved/${experienceId}`, { method: "DELETE" }),
};

// ---------- Providers ----------
export const providersApi = {
  apply: (body: CreateProviderApplicationRequest) =>
    apiFetch<Provider>("/api/providers/application", { method: "POST", body: JSON.stringify(body) }),

  getMyDashboard: () => apiFetch<ProviderDashboardResponse>("/api/providers/me/dashboard"),

  getMyProfile: () => apiFetch<Provider>("/api/providers/me"),

  getMyExperiences: (limit?: number) =>
    apiFetch<Paginated<Experience>>(`/api/providers/me/experiences${buildQuery({ limit })}`),

  getPublicProfile: (providerId: string) => apiFetch<PublicProvider>(`/api/providers/${providerId}`),

  getPublicExperiences: (providerId: string, limit?: number) =>
    apiFetch<Paginated<Experience>>(`/api/providers/${providerId}/experiences${buildQuery({ limit })}`),
};

// ---------- Admin ----------
export const adminApi = {
  getDashboard: () => apiFetch<AdminDashboardResponse>("/api/admin/dashboard"),

  listApplications: (params?: { status?: ProviderApplicationStatus; limit?: number; cursor?: string }) =>
    apiFetch<Paginated<Provider>>(`/api/admin/providers/applications${buildQuery(params)}`),

  getApplication: (providerId: string) =>
    apiFetch<Provider>(`/api/admin/providers/applications/${providerId}`),

  reviewApplication: (providerId: string, body: ReviewProviderApplicationRequest) =>
    apiFetch<Provider>(`/api/admin/providers/applications/${providerId}/review`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

export const api = {
  ...authApi,
  ...usersApi,
  experiences: experiencesApi,
  destinations: destinationsApi,
  bookings: bookingsApi,
  saved: savedApi,
  providers: providersApi,
  admin: adminApi,
};