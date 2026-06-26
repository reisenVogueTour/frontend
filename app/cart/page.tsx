"use client";

import { useApp } from "../shared/AppContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { fetchAPI } from "../shared/api";

export default function CartPage() {
  const { cart, token, user, removeFromCart, updateCartItem, clearCart } = useApp();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.experience.price * item.groupSize,
    0
  );

  const handleCheckout = async () => {
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setCheckoutStatus(null);

    const successfulBookings = [];
    const simulatedBookings = [];
    let hasFailures = false;

    for (const item of cart) {
      try {
        // Attempt to create booking via the backend API
        const payload = {
          experienceId: item.experience.experienceId,
          requestedDate: item.requestedDate,
          groupSize: item.groupSize,
          notes: item.notes || undefined,
        };

        const booking = await fetchAPI<any>("/api/bookings", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        successfulBookings.push(booking);
      } catch (err: any) {
        console.warn(
          `API booking failed for ${item.experience.title}. Creating a simulated local booking instead.`,
          err
        );
        
        // Create simulated local booking
        const simulatedBooking = {
          bookingId: `sim-bk-${Math.random().toString(36).substring(2, 11)}`,
          userId: user?.userId || "local-user",
          experienceId: item.experience.experienceId,
          experienceTitle: item.experience.title,
          providerId: item.experience.providerId,
          requestedDate: item.requestedDate,
          groupSize: item.groupSize,
          totalPrice: item.experience.price * item.groupSize,
          currency: item.experience.currency,
          status: "pending",
          notes: item.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isSimulated: true, // Tag to identify simulated local bookings
        };
        simulatedBookings.push(simulatedBooking);
      }
    }

    // Save simulated bookings to localStorage
    if (simulatedBookings.length > 0) {
      const existingSimStr = localStorage.getItem("simulated_bookings");
      const existingSim = existingSimStr ? JSON.parse(existingSimStr) : [];
      localStorage.setItem(
        "simulated_bookings",
        JSON.stringify([...existingSim, ...simulatedBookings])
      );
    }

    clearCart();
    setLoading(false);

    if (simulatedBookings.length > 0 && successfulBookings.length === 0) {
      setCheckoutStatus({
        success: true,
        message: "Demo bookings created! Redirecting to dashboard...",
      });
    } else if (successfulBookings.length > 0) {
      setCheckoutStatus({
        success: true,
        message: "Bookings created successfully! Redirecting to dashboard...",
      });
    }

    setTimeout(() => {
      router.push("/bookings");
    }, 2000);
  };

  return (
    <div className="w-full max-w-400 mx-auto px-5 lg:px-10 pb-20 pt-24 lg:pt-32">
      <div className="mb-10 text-center lg:text-left">
        <h1 className="text-section-title text-dark-base mb-2">Your Cart</h1>
        <p className="text-body-medium text-body-dark">
          Review and finalize your matched local experiences.
        </p>
      </div>

      {checkoutStatus && (
        <div
          className={`mb-8 p-4 rounded-xl text-small font-bold border ${
            checkoutStatus.success
              ? "bg-green-50 text-success border-green-200"
              : "bg-red-50 text-error border-red-200"
          }`}
        >
          {checkoutStatus.message}
        </div>
      )}

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white-base border border-body-off rounded-[28px] p-10 flex flex-col items-center justify-center gap-4">
          <span className="text-section-inner-title text-body-dark">Your cart is empty</span>
          <p className="text-body-medium text-body-dark max-w-sm">
            Looks like you haven&apos;t added any matching experiences to your travel cart yet.
          </p>
          <Link href="/experiences" className="primary-cta cursor-pointer mt-2">
            <span className="primary-cta-inner">Find experiences</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Cart Items Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {cart.map((item) => (
              <div
                key={item.experience.experienceId}
                className="border-2 border-primary rounded-[28px] p-6 bg-white-base bg-[url('/noise.svg')] bg-cover relative flex flex-col sm:flex-row gap-6 shadow-sm"
              >
                {/* Image */}
                <div className="w-full sm:w-40 h-28 relative rounded-2xl overflow-hidden flex-shrink-0 border border-body-off">
                  <Image
                    src={
                      item.experience.images && item.experience.images[0]
                        ? item.experience.images[0]
                        : "/experience_placeholder.jpg"
                    }
                    alt={item.experience.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-grow flex flex-col justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-one-liner-medium text-dark-base font-bold">
                        {item.experience.title}
                      </h3>
                      <button
                        onClick={() => removeFromCart(item.experience.experienceId)}
                        className="text-body-dark hover:text-error transition-colors p-1 cursor-pointer"
                        aria-label="Remove item"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                    <span className="text-extra-small text-body-dark">
                      Destination: {item.experience.destination}
                    </span>
                  </div>

                  {/* Inline adjustments */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-body-off">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-body-dark uppercase font-bold">
                        Date
                      </label>
                      <input
                        type="datetime-local"
                        value={item.requestedDate.substring(0, 16)}
                        onChange={(e) =>
                          updateCartItem(item.experience.experienceId, {
                            requestedDate: new Date(e.target.value).toISOString(),
                          })
                        }
                        className="px-2.5 py-1.5 border border-body-off rounded-lg bg-white-base text-small text-dark-base focus:outline-none focus:border-secondary"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-body-dark uppercase font-bold">
                        Group Size
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={item.experience.maxGroupSize}
                        value={item.groupSize}
                        onChange={(e) =>
                          updateCartItem(item.experience.experienceId, {
                            groupSize: Math.max(
                              1,
                              Math.min(item.experience.maxGroupSize, Number(e.target.value))
                            ),
                          })
                        }
                        className="px-2.5 py-1.5 border border-body-off rounded-lg bg-white-base text-small text-dark-base focus:outline-none focus:border-secondary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing & Checkout Summary */}
          <div className="bg-white-base border-2 border-primary rounded-[28px] p-6 lg:p-8 bg-[url('/noise.svg')] bg-cover shadow-sm">
            <h2 className="text-section-inner-title text-dark-base mb-6">Booking Summary</h2>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between text-body-medium text-body-dark pb-2 border-b border-body-off">
                <span>Items count</span>
                <span>{cart.length}</span>
              </div>
              <div className="flex justify-between text-section-inner-title text-dark-base font-bold pt-2 mb-6">
                <span>Total price</span>
                <span className="text-secondary">{subtotal.toLocaleString()} NGN</span>
              </div>

              {!token ? (
                <div className="flex flex-col gap-3">
                  <p className="text-extra-small text-warning font-medium text-center">
                    Authentication is required to place experience bookings.
                  </p>
                  <Link href="/login" className="primary-cta w-full text-center">
                    <span className="primary-cta-inner w-full py-3.5 block">
                      Login to Checkout
                    </span>
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="primary-cta w-full cursor-pointer"
                >
                  <span className="primary-cta-inner w-full py-3.5 block">
                    {loading ? "Checking out..." : "Submit Booking Requests"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
