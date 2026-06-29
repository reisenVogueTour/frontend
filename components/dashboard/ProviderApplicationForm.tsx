"use client";

import { useState } from "react";
import { Building2, MapPin, Mail, Phone, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import { api, ApiRequestError } from "@/lib/api-client";
import type { CreateProviderApplicationRequest } from "@/lib/types/reisen";

interface ProviderApplicationFormProps {
  onSuccess: () => void;
}

export default function ProviderApplicationForm({ onSuccess }: ProviderApplicationFormProps) {
  const [form, setForm] = useState<CreateProviderApplicationRequest>({
    businessName: "",
    description: "",
    location: "",
    businessAddress: "",
    companyEmail: "",
    companyPhone: "",
    cacNumber: "",
    cacDocumentUrl: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function update<K extends keyof CreateProviderApplicationRequest>(
    key: K,
    value: CreateProviderApplicationRequest[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Convert empty string to undefined for optional fields
    const submissionData: CreateProviderApplicationRequest = {
      ...form,
      cacDocumentUrl: form.cacDocumentUrl?.trim() || undefined,
    };

    try {
      await api.providers.apply(submissionData);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Failed to submit application. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <CheckCircle2 size={48} className="text-success mx-auto mb-4" />
        <h2 className="text-section-inner-title text-dark-base mb-2">
          Application Submitted!
        </h2>
        <p className="text-body-regular text-body-dark">
          Your provider application has been submitted and is pending review by our team.
          You'll be notified once it's approved.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="mb-6">
        <h2 className="text-section-title text-dark-base mb-2">
          Apply to become a Provider
        </h2>
        <p className="text-body-regular text-body-dark">
          Complete your business details to start hosting experiences on Reisen.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-small-medium text-dark-base">Business Name</span>
          <div className="relative">
            <Building2 size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-body-dark" />
            <input
              value={form.businessName}
              onChange={(e) => update("businessName", e.target.value)}
              required
              minLength={2}
              placeholder="e.g. Lagos Adventures Ltd"
              className="w-full rounded-xl border border-body-off pl-11 pr-3.5 py-2.5 text-body-regular text-dark-base outline-none focus:border-primary"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-small-medium text-dark-base">Description</span>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            required
            minLength={10}
            rows={3}
            placeholder="Tell us about your business and the experiences you offer..."
            className="w-full rounded-xl border border-body-off px-3.5 py-2.5 text-body-regular text-dark-base outline-none focus:border-primary resize-none"
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-small-medium text-dark-base">Location</span>
            <div className="relative">
              <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-body-dark" />
              <input
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                required
                minLength={2}
                placeholder="e.g. Lagos"
                className="w-full rounded-xl border border-body-off pl-11 pr-3.5 py-2.5 text-body-regular text-dark-base outline-none focus:border-primary"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-small-medium text-dark-base">Company Phone</span>
            <div className="relative">
              <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-body-dark" />
              <input
                value={form.companyPhone}
                onChange={(e) => update("companyPhone", e.target.value)}
                required
                minLength={7}
                placeholder="+234 XXX XXX XXXX"
                className="w-full rounded-xl border border-body-off pl-11 pr-3.5 py-2.5 text-body-regular text-dark-base outline-none focus:border-primary"
              />
            </div>
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-small-medium text-dark-base">Business Address</span>
          <input
            value={form.businessAddress}
            onChange={(e) => update("businessAddress", e.target.value)}
            required
            minLength={5}
            placeholder="Full business address"
            className="w-full rounded-xl border border-body-off px-3.5 py-2.5 text-body-regular text-dark-base outline-none focus:border-primary"
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-small-medium text-dark-base">Company Email</span>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-body-dark" />
              <input
                type="email"
                value={form.companyEmail}
                onChange={(e) => update("companyEmail", e.target.value)}
                required
                placeholder="business@company.com"
                className="w-full rounded-xl border border-body-off pl-11 pr-3.5 py-2.5 text-body-regular text-dark-base outline-none focus:border-primary"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-small-medium text-dark-base">CAC Number</span>
            <div className="relative">
              <FileText size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-body-dark" />
              <input
                value={form.cacNumber}
                onChange={(e) => update("cacNumber", e.target.value)}
                required
                minLength={5}
                placeholder="RC123456"
                className="w-full rounded-xl border border-body-off pl-11 pr-3.5 py-2.5 text-body-regular text-dark-base outline-none focus:border-primary"
              />
            </div>
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-small-medium text-dark-base">CAC Document URL (Optional)</span>
          <input
            type="url"
            value={form.cacDocumentUrl}
            onChange={(e) => update("cacDocumentUrl", e.target.value)}
            placeholder="https://..."
            className="w-full rounded-xl border border-body-off px-3.5 py-2.5 text-body-regular text-dark-base outline-none focus:border-primary"
          />
        </label>

        {error && (
          <div className="rounded-xl bg-error/10 border border-error/20 px-4 py-3 flex items-start gap-2">
            <AlertTriangle size={18} className="text-error flex-shrink-0 mt-0.5" />
            <span className="text-small text-error">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="primary-cta mt-2"
        >
          <span className="primary-cta-inner !py-3 text-dark-base block">
            {submitting ? "Submitting..." : "Submit Application"}
          </span>
        </button>
      </form>
    </div>
  );
}
