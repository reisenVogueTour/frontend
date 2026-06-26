export type UserRole = "customer" | "provider" | "admin";

export type ExperienceCategory = "adventure" | "relaxation" | "nightlife" | "cultural" | "wildlife" | "water_sports" |"romantic"| "family-friendly";

export type ExperienceStatus = "draft" | "published" | "archived";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type ProviderApplicationStatus = "pending" | "approved" | "rejected";

export interface PublicUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}
 
export interface Experience {
  experienceId: string;
  providerId: string;
  title: string;
  description: string;
  destination: string;
  destinationSlug: string;
  category: ExperienceCategory;
  eventDate: string;
  numberOfDays: number;
  price: number;
  currency: string;
  duration?: string;
  maxGroupSize: number;
  images: string[];
  featured: boolean;
  status: ExperienceStatus;
  createdAt: string;
  updatedAt: string;
}
 
export interface Booking {
  bookingId: string;
  userId: string;
  experienceId: string;
  experienceTitle: string;
  providerId: string;
  requestedDate: string;
  groupSize: number;
  totalPrice: number;
  currency: string;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  destination?: string;
}
 
export interface Provider {
  providerId: string;
  userId: string;
  businessName: string;
  description: string;
  location: string;
  businessAddress: string;
  companyEmail: string;
  companyPhone: string;
  cacNumber: string;
  cacDocumentUrl?: string;
  applicationStatus: ProviderApplicationStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}
 
export interface DashboardResponse {
  recentBookings: Booking[];
  savedExperiences: Experience[];
  stats: {
    totalBookings: number;
    totalSaved: number;
  };
}
 
export interface AdminDashboardResponse {
  stats: {
    pendingApplications: number;
    approvedProviders: number;
    rejectedApplications: number;
  };
  recentPendingApplications: Provider[];
}
 
export interface Destination {
  destinationSlug: string;
  name: string;
  state: string;
  description: string;
  imageUrl: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}
 
export interface Paginated<T> {
  items: T[];
  nextCursor?: string;
}
 
export interface ProviderDashboardResponse {
  profile: Provider;
  applicationStatus: ProviderApplicationStatus;
  canManageExperiences: boolean;
  experiences: Experience[];
  recentBookings: Booking[];
  stats: {
    totalExperiences: number;
    publishedExperiences: number;
    draftExperiences: number;
    pendingBookings: number;
  };
}
 
export interface PublicProvider {
  providerId: string;
  businessName: string;
  description: string;
  location: string;
  createdAt: string;
}
 
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
}
 
export interface LoginRequest {
  email: string;
  password: string;
}
 
export interface AuthResponse {
  user: PublicUser;
  token: string;
}
 
export interface CreateProviderApplicationRequest {
  businessName: string;
  description: string;
  location: string;
  businessAddress: string;
  companyEmail: string;
  companyPhone: string;
  cacNumber: string;
  cacDocumentUrl?: string;
}
 
export interface CreateExperienceRequest {
  title: string;
  description: string;
  destination: string;
  category: ExperienceCategory;
  eventDate: string;
  numberOfDays: number;
  price: number;
  currency?: string;
  duration?: string;
  maxGroupSize: number;
  images?: string[];
  featured?: boolean;
  status?: "draft" | "published";
}
 
export type UpdateExperienceRequest = Partial<
  Omit<CreateExperienceRequest, "eventDate" | "numberOfDays"> & {
    numberOfDays: number;
    status: ExperienceStatus;
  }
>;
 
export interface CreateDestinationRequest {
  name: string;
  state: string;
  description: string;
  imageUrl: string;
  featured?: boolean;
  destinationSlug?: string;
}
 
export interface CreateBookingRequest {
  experienceId: string;
  requestedDate: string;
  groupSize: number;
  notes?: string;
}
 
export interface ExperienceQueryParams {
  destination?: string;
  category?: ExperienceCategory;
  search?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  cursor?: string;
}
 
export interface ApiSuccess<T> {
  success: true;
  data: T;
}
 
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
 
export interface ReviewProviderApplicationRequest {
  status: "approved" | "rejected";
  rejectionReason?: string;
}
 