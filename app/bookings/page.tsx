"use client";

import { useEffect, useState } from "react";
import { useApp } from "../shared/AppContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchAPI } from "../shared/api";

interface Booking {
  bookingId: string;
  userId: string;
  experienceId: string;
  experienceTitle: string;
  providerId: string;
  requestedDate: string;
  groupSize: number;
  totalPrice: number;
  currency: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isSimulated?: boolean;
}

export default function BookingsPage() {
  const { token, user } = useApp();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const loadBookings = async () => {
      setLoading(true);
      setError("");

      try {
        // Fetch actual bookings from backend API
        const result = await fetchAPI<{ items: Booking[] }>("/api/bookings");
        const apiBookings = result.items || [];

        // Fetch simulated bookings from localStorage
        const simBookingsStr = localStorage.getItem("simulated_bookings");
        const simBookings: Booking[] = simBookingsStr ? JSON.parse(simBookingsStr) : [];
        
        // Filter simulated bookings for current user
        const userSimBookings = simBookings.filter(
          (b) => b.userId === user?.userId
        );

        // Merge and sort by createdAt descending
        const mergedBookings = [...apiBookings, ...userSimBookings].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setBookings(mergedBookings);
      } catch (err) {
        console.error("Failed to load bookings from API, loading local mock bookings:", err);
        // Fallback to local simulated bookings
        const simBookingsStr = localStorage.getItem("simulated_bookings");
        const simBookings: Booking[] = simBookingsStr ? JSON.parse(simBookingsStr) : [];
        const userSimBookings = simBookings.filter(
          (b) => b.userId === user?.userId
        );
        setBookings(userSimBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [token, user]);

  const getStatusBadgeClass = (status: Booking["status"]) => {
    switch (status) {
      case "pending":
        return "bg-warning/10 text-warning border-warning/30";
      case "confirmed":
        return "bg-success/10 text-success border-success/30";
      case "cancelled":
        return "bg-error/10 text-error border-error/30";
      case "completed":
        return "bg-info/10 text-info border-info/30";
      default:
        return "bg-body-dark/10 text-body-dark border-body-off";
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-24 px-5 text-center gap-4">
        <h1 className="text-section-title text-dark-base">Your Bookings</h1>
        <p className="text-body-medium text-body-dark max-w-sm">
          Please login or register to see your bookings and itineraries.
        </p>
        <div className="flex gap-4 mt-2">
          <Link href="/login" className="bg-secondary text-white-base px-6 py-3 rounded-full font-bold text-small">
            Login
          </Link>
          <Link href="/register" className="border border-primary text-dark-base px-6 py-3 rounded-full font-medium text-small hover:bg-primary-50">
            Register
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-400 mx-auto px-5 lg:px-10 pb-20 pt-24 lg:pt-32">
      <div className="mb-10 text-center lg:text-left">
        <h1 className="text-section-title text-dark-base mb-2">Your Bookings</h1>
        <p className="text-body-medium text-body-dark">
          Track experience booking status, dates, and tour details.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-white-base border border-body-off rounded-[28px] p-10 flex flex-col items-center justify-center gap-4">
          <span className="text-section-inner-title text-body-dark">No bookings found</span>
          <p className="text-body-medium text-body-dark max-w-sm">
            You haven&apos;t requested any bookings yet. Find an experience and submit a booking request.
          </p>
          <Link href="/experiences" className="primary-cta cursor-pointer mt-2">
            <span className="primary-cta-inner">Find experiences</span>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {bookings.map((booking) => (
            <div
              key={booking.bookingId}
              className="border-2 border-primary rounded-[28px] p-6 lg:p-8 bg-white-base bg-[url('/noise.svg')] bg-cover relative flex flex-col lg:flex-row justify-between gap-6 shadow-sm"
            >
              {/* Left Details */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 rounded-full border text-extra-small font-bold uppercase tracking-wider ${getStatusBadgeClass(booking.status)}`}>
                    {booking.status}
                  </span>
                  
                  {booking.isSimulated && (
                    <span className="bg-primary/30 text-secondary border border-primary/40 px-3 py-1 rounded-full text-extra-small font-bold uppercase tracking-wider">
                      Demo Mode
                    </span>
                  )}
                  
                  <span className="text-extra-small text-body-dark">
                    ID: {booking.bookingId}
                  </span>
                </div>

                <h2 className="text-section-inner-title text-dark-base mt-1">
                  <Link href={`/experiences/${booking.experienceId}`} className="hover:text-secondary hover:underline transition-all">
                    {booking.experienceTitle}
                  </Link>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-2 mt-2 text-one-liner text-body-dark">
                  <div>
                    <span className="font-bold text-dark-base">Date: </span>
                    {formatDate(booking.requestedDate)}
                  </div>
                  <div>
                    <span className="font-bold text-dark-base">Group size: </span>
                    {booking.groupSize} {booking.groupSize === 1 ? "person" : "people"}
                  </div>
                  <div>
                    <span className="font-bold text-dark-base">Requested: </span>
                    {formatDate(booking.createdAt)}
                  </div>
                </div>

                {booking.notes && (
                  <div className="mt-3 p-4 bg-body-light border border-body-off rounded-xl text-small text-body-dark">
                    <span className="font-bold text-dark-base block mb-1">Your notes:</span>
                    {booking.notes}
                  </div>
                )}
              </div>

              {/* Right Pricing */}
              <div className="flex flex-col lg:items-end justify-between border-t lg:border-t-0 lg:border-l border-body-off pt-4 lg:pt-0 lg:pl-8 flex-shrink-0 min-w-44">
                <div className="flex flex-col lg:items-end">
                  <span className="text-extra-small text-body-dark uppercase font-bold">Total price</span>
                  <div className="text-section-inner-title text-secondary font-bold mt-1">
                    {booking.totalPrice.toLocaleString()} NGN
                  </div>
                </div>

                {booking.status === "pending" && (
                  <span className="text-extra-small text-warning mt-2 font-medium">
                    Awaiting confirmation from provider.
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
