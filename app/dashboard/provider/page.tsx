"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { api, ApiRequestError } from "@/lib/api-client";
import type { Provider } from "@/lib/types/reisen";
import ProviderDashboard from "@/components/dashboard/ProviderDashboard";
import ProviderApplicationForm from "@/components/dashboard/ProviderApplicationForm";

export default function DashboardPage() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProvider() {
    setLoading(true);
    try {
      const data = await api.providers.getMyProfile();
      setProvider(data);
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 404) {
        // No application exists yet - this is expected
        setProvider(null);
      } else {
        setError(
          err instanceof ApiRequestError
            ? err.message
            : "Failed to load provider data"
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProvider();
  }, []);

  if (loading) {
    return (
      <div className="section-wrapper !items-stretch !gap-8 bg-body-light min-h-screen flex items-center justify-center">
        <div className="text-body-regular text-body-dark">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section-wrapper !items-stretch !gap-8 bg-body-light min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertTriangle size={28} className="text-error mx-auto mb-3" />
          <p className="text-body-regular text-body-dark mb-4">{error}</p>
          <button
            onClick={loadProvider}
            className="primary-cta"
          >
            <span className="primary-cta-inner !py-2.5 !px-6 text-dark-base">
              Try again
            </span>
          </button>
        </div>
      </div>
    );
  }

  // No application exists - show the application form
  if (!provider) {
    return (
      <div className="section-wrapper !items-stretch !gap-8 bg-body-light min-h-screen">
        <ProviderApplicationForm onSuccess={loadProvider} />
      </div>
    );
  }

  // Application exists - show the dashboard
  return <ProviderDashboard />;
}