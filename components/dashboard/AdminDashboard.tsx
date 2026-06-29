"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Hourglass,
  AlertTriangle,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { api, ApiRequestError } from "@/lib/api-client";
import type {
  AdminDashboardResponse,
  Provider,
  ProviderApplicationStatus,
} from "@/lib/types/reisen";

// ---------- Helpers ----------

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function AnimationStyles() {
  return (
    <style>{`
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .fade-in-up { animation: fadeInUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }
    `}</style>
  );
}

// ---------- Status badge ----------

const STATUS_CONFIG: Record<
  ProviderApplicationStatus,
  { label: string; textClass: string; bgClass: string; icon: typeof Hourglass }
> = {
  pending:  { label: "Pending",  textClass: "text-warning", bgClass: "bg-warning/10",  icon: Hourglass    },
  approved: { label: "Approved", textClass: "text-success", bgClass: "bg-success/10",  icon: CheckCircle2 },
  rejected: { label: "Rejected", textClass: "text-error",   bgClass: "bg-error/10",    icon: XCircle      },
};

function StatusBadge({ status }: { status: ProviderApplicationStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-extra-small ${cfg.textClass} ${cfg.bgClass}`}
    >
      <Icon size={13} strokeWidth={2.2} />
      {cfg.label}
    </span>
  );
}

// ---------- Stat card ----------

function StatCard({
  label,
  value,
  textClass = "text-dark-base",
}: {
  label: string;
  value: number;
  textClass?: string;
}) {
  return (
    <div className="flex-1 min-w-[150px] rounded-3xl bg-white-base border border-body-off p-5">
      <div className="text-small text-body-dark mb-1">{label}</div>
      <div className={`text-section-title ${textClass}`}>{value}</div>
    </div>
  );
}

// ---------- Tab bar ----------

type Tab = "pending" | "approved" | "rejected";

function TabBar({ active, onChange, counts }: { active: Tab; onChange: (t: Tab) => void; counts: Record<Tab, number> }) {
  const tabs: { key: Tab; label: string }[] = [
    { key: "pending",  label: `Pending (${counts.pending})`   },
    { key: "approved", label: `Approved (${counts.approved})` },
    { key: "rejected", label: `Rejected (${counts.rejected})` },
  ];
  return (
    <div className="flex items-center gap-1 rounded-full bg-primary-50 p-1.5 w-fit">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`rounded-full px-5 py-2 text-small-medium transition-colors ${
            active === t.key
              ? "bg-white-base text-dark-base shadow-sm"
              : "text-body-dark hover:text-dark-base"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ---------- Rejection modal ----------

function RejectModal({
  provider,
  onClose,
  onConfirm,
}: {
  provider: Provider;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  function submit() {
    if (!reason.trim()) { setError("Please provide a rejection reason."); return; }
    onConfirm(reason.trim());
  }

  return (
    <div className="fixed inset-0 bg-dark-base/50 flex items-center justify-center z-50 p-4">
      <div className="fade-in-up bg-white-base rounded-3xl p-6 w-full max-w-md">
        <h3 className="text-section-inner-title text-dark-base mb-1">Reject application</h3>
        <p className="text-small text-body-dark mb-4">
          Rejecting <strong>{provider.businessName}</strong>. Give a clear reason so the provider can reapply.
        </p>
        <label className="flex flex-col gap-1.5 mb-4">
          <span className="text-small-medium text-body-dark">Reason</span>
          <textarea
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(""); }}
            rows={3}
            className="rounded-xl border border-body-off px-3.5 py-2.5 text-body-regular text-dark-base outline-none focus:border-secondary resize-none"
            placeholder="e.g. CAC number could not be verified"
          />
          {error && <span className="text-small text-error">{error}</span>}
        </label>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-body-off py-2.5 text-small-medium text-body-dark hover:bg-body-light transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="flex-1 rounded-full bg-error/10 text-error py-2.5 text-small-medium hover:bg-error/20 transition-colors"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Application card ----------

function ApplicationCard({
  provider,
  onApprove,
  onReject,
}: {
  provider: Provider;
  onApprove: (p: Provider) => void;
  onReject:  (p: Provider) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fade-in-up rounded-2xl border border-body-off bg-white-base overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 flex-wrap p-5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-body-medium text-dark-base">{provider.businessName}</span>
            <StatusBadge status={provider.applicationStatus} />
          </div>
          <div className="flex items-center gap-4 flex-wrap text-extra-small text-body-dark">
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {provider.location}
            </span>
            <span className="flex items-center gap-1">
              <Mail size={12} /> {provider.companyEmail}
            </span>
            <span>Applied {formatDate(provider.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {provider.applicationStatus === "pending" && (
            <>
              <button
                onClick={() => onApprove(provider)}
                className="rounded-full bg-success/10 text-success px-4 py-1.5 text-small-medium hover:bg-success/20 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => onReject(provider)}
                className="rounded-full bg-error/10 text-error px-4 py-1.5 text-small-medium hover:bg-error/20 transition-colors"
              >
                Reject
              </button>
            </>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Collapse details" : "Expand details"}
            className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center hover:scale-110 transition-transform"
          >
            {expanded ? (
              <ChevronUp size={15} className="text-secondary" />
            ) : (
              <ChevronDown size={15} className="text-secondary" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-body-off px-5 pb-5 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Detail icon={<Building2 size={13} />} label="Business address" value={provider.businessAddress} />
          <Detail icon={<Phone size={13} />}    label="Company phone"    value={provider.companyPhone} />
          <Detail icon={<FileText size={13} />} label="CAC number"       value={provider.cacNumber} />
          <Detail icon={<Mail size={13} />}     label="Company email"    value={provider.companyEmail} />

          {provider.description && (
            <div className="sm:col-span-2">
              <span className="text-extra-small text-body-dark block mb-1">Description</span>
              <p className="text-small text-dark-base">{provider.description}</p>
            </div>
          )}

          {provider.cacDocumentUrl && (
            <div className="sm:col-span-2">
              <a
                href={provider.cacDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-small-medium text-secondary hover:underline"
              >
                <ExternalLink size={13} /> View CAC document
              </a>
            </div>
          )}

          {provider.rejectionReason && (
            <div className="sm:col-span-2 rounded-xl bg-error/5 border border-error/20 px-4 py-3">
              <span className="text-extra-small text-error block mb-1">Rejection reason</span>
              <p className="text-small text-dark-base">{provider.rejectionReason}</p>
            </div>
          )}

          {provider.reviewedAt && (
            <div className="sm:col-span-2">
              <span className="text-extra-small text-body-dark">
                Reviewed {formatDate(provider.reviewedAt)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <span className="flex items-center gap-1 text-extra-small text-body-dark mb-0.5">
        {icon} {label}
      </span>
      <span className="text-small text-dark-base">{value}</span>
    </div>
  );
}

// ---------- Skeleton / Error ----------

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 w-full max-w-240 mx-auto animate-pulse">
      <div className="flex gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex-1 h-20 rounded-3xl bg-body-light" />
        ))}
      </div>
      <div className="h-10 w-72 rounded-full bg-body-light" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-20 rounded-2xl bg-body-light" />
      ))}
    </div>
  );
}

function DashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="max-w-md mx-auto mt-20 text-center">
      <AlertTriangle size={28} className="text-error mx-auto mb-3" />
      <p className="text-body-regular text-body-dark mb-4">{message}</p>
      <button onClick={onRetry} className="primary-cta">
        <span className="primary-cta-inner !py-2.5 !px-6 text-dark-base">Try again</span>
      </button>
    </div>
  );
}

// ---------- Main page ----------

export default function AdminDashboard() {
  const [summary, setSummary]         = useState<AdminDashboardResponse | null>(null);
  const [applications, setApplications] = useState<Provider[]>([]);
  const [activeTab, setActiveTab]     = useState<Tab>("pending");
  const [loadingTab, setLoadingTab]   = useState(false);
  const [status, setStatus]           = useState<"loading" | "error" | "ready">("loading");
  const [errorMsg, setErrorMsg]       = useState("");
  const [rejectTarget, setRejectTarget] = useState<Provider | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function loadSummary() {
    setStatus("loading");
    try {
      const data = await api.admin.getDashboard();
      setSummary(data);
      setStatus("ready");
    } catch (err) {
      setErrorMsg(err instanceof ApiRequestError ? err.message : "Failed to load dashboard.");
      setStatus("error");
    }
  }

  async function loadTab(tab: Tab) {
    setLoadingTab(true);
    try {
      const result = await api.admin.listApplications({ status: tab, limit: 50 });
      setApplications(result.items);
    } catch {
      setApplications([]);
    } finally {
      setLoadingTab(false);
    }
  }

  useEffect(() => { loadSummary(); }, []);

  useEffect(() => {
    if (status === "ready") loadTab(activeTab);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, status]);

  async function handleApprove(provider: Provider) {
    setActionLoading(provider.providerId);
    try {
      await api.admin.reviewApplication(provider.providerId, { status: "approved" });
      await Promise.all([loadSummary(), loadTab(activeTab)]);
    } catch {
      // silently fail for now — could toast
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRejectConfirm(reason: string) {
    if (!rejectTarget) return;
    const target = rejectTarget;
    setRejectTarget(null);
    setActionLoading(target.providerId);
    try {
      await api.admin.reviewApplication(target.providerId, { status: "rejected", rejectionReason: reason });
      await Promise.all([loadSummary(), loadTab(activeTab)]);
    } catch {
      // silently fail
    } finally {
      setActionLoading(null);
    }
  }

  const counts: Record<Tab, number> = {
    pending:  summary?.stats.pendingApplications  ?? 0,
    approved: summary?.stats.approvedProviders    ?? 0,
    rejected: summary?.stats.rejectedApplications ?? 0,
  };

  return (
    <div className="section-wrapper !items-stretch !gap-8 bg-body-light min-h-screen">
      <AnimationStyles />

      {status === "loading" && <DashboardSkeleton />}
      {status === "error"   && <DashboardError message={errorMsg} onRetry={loadSummary} />}

      {status === "ready" && summary && (
        <div className="w-full max-w-240 mx-auto flex flex-col gap-8">

          {/* Header */}
          <div className="fade-in-up flex items-center  mt-4 gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-secondary text-small-medium mb-1">
                <ShieldCheck size={14} />
                <span>Admin</span>
              </div>
              <h1 className="text-section-title text-dark-base">Provider applications</h1>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 flex-wrap">
            <StatCard label="Pending review"      value={summary.stats.pendingApplications}  textClass="text-warning" />
            <StatCard label="Approved providers"  value={summary.stats.approvedProviders}    textClass="text-success" />
            <StatCard label="Rejected"            value={summary.stats.rejectedApplications} textClass="text-error"   />
          </div>

          {/* Tabs */}
          <TabBar active={activeTab} onChange={setActiveTab} counts={counts} />

          {/* Application list */}
          <section className="flex flex-col gap-3">
            {loadingTab ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-body-off animate-pulse" />
              ))
            ) : applications.length === 0 ? (
              <div className="fade-in-up rounded-3xl border border-dashed border-body-off p-10 text-center text-body-dark text-body-regular">
                No {activeTab} applications.
              </div>
            ) : (
              applications.map((p) => (
                <div
                  key={p.providerId}
                  className={actionLoading === p.providerId ? "opacity-50 pointer-events-none" : ""}
                >
                  <ApplicationCard
                    provider={p}
                    onApprove={handleApprove}
                    onReject={setRejectTarget}
                  />
                </div>
              ))
            )}
          </section>
        </div>
      )}

      {rejectTarget && (
        <RejectModal
          provider={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleRejectConfirm}
        />
      )}
    </div>
  );
}