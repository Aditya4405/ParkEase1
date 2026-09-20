import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaUserCheck, FaSearch, FaSyncAlt, FaCheck, FaTimes, FaEye, FaClock,
  FaCheckCircle, FaTimesCircle, FaBuilding,
  FaFileAlt, FaUser, FaExternalLinkAlt,
  FaClipboardList, FaDownload, FaSpinner, FaParking
} from "react-icons/fa";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { ownerApprovalAPI, getToken } from "../../api/api";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:8081/api";

// ── Status badge helper ────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = {
    PENDING:      { bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400",   icon: <FaClock size={9} />,       label: "Pending" },
    UNDER_REVIEW: { bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-400",          icon: <FaEye size={9} />,         label: "Under Review" },
    APPROVED:     { bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400", icon: <FaCheckCircle size={9} />, label: "Approved" },
    REJECTED:     { bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-400",         icon: <FaTimesCircle size={9} />, label: "Rejected" },
  }[status] || { bg: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400", icon: null, label: status };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.bg}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ── Application Detail Modal ───────────────────────────────────────────────────

function ApplicationDetailModal({ app, onClose, onApprove, onReject, onReview }) {
  const [rejectMode, setRejectMode]   = useState(false);
  const [approveMode, setApproveMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [adminNotes, setAdminNotes]   = useState("");
  const [loading, setLoading]         = useState(false);

  const canApprove = app.applicationStatus !== "APPROVED";
  const canReject  = app.applicationStatus !== "REJECTED" && app.applicationStatus !== "APPROVED";

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove(app.id, { adminNotes });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error("Rejection reason is required"); return; }
    setLoading(true);
    try {
      await onReject(app.id, { rejectionReason: rejectReason, adminNotes });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = (d) => !d ? "—" : new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-slate-900/50 backdrop-blur-xs" onClick={onClose}>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="h-full w-full max-w-xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Application Review</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{app.applicationRef}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={app.applicationStatus} />
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-2 cursor-pointer">
              <FaTimes size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-6">
          {/* Applicant Info */}
          <Section title="Applicant Information" icon={<FaUser size={12} />}>
            <Row label="Full Name"   value={app.applicantName} />
            <Row label="Email"       value={<a href={`mailto:${app.applicantEmail}`} className="text-primary-600 dark:text-primary-400 hover:underline">{app.applicantEmail}</a>} />
            <Row label="Phone"       value={app.applicantPhone || "—"} />
            <Row label="Applied On"  value={fmtDate(app.submittedAt)} />
          </Section>

          {/* Business Info */}
          <Section title="Business Information" icon={<FaBuilding size={12} />}>
            <Row label="Business Name"   value={app.businessName} />
            <Row label="Business Type"   value={app.businessType || "—"} />
            <Row label="Address"         value={app.address} />
            <Row label="City"            value={app.city} />
            <Row label="State"           value={app.state} />
            <Row label="PIN Code"        value={app.pinCode || "—"} />
            <Row label="Contact"         value={app.contactNumber || "—"} />
            <Row label="Identifier"      value={app.businessIdentifier || "—"} />
            <Row label="Locations"       value={app.numberOfLocations ?? "—"} />
            <Row label="Ownership Type"  value={app.ownershipType || "—"} />
          </Section>

          {/* Parking Information */}
          {(app.parkingSpaceName || app.approxSlots) && (
            <Section title="Parking Information" icon={<FaParking size={12} />}>
              <Row label="Space / Facility Name" value={app.parkingSpaceName} />
              <Row label="Approx Slots"          value={app.approxSlots ? `${app.approxSlots} slots` : "—"} />
              <Row label="Facility Type"         value={app.parkingType || "—"} />
              <Row label="Vehicles Supported"    value={app.vehicleTypesSupported || "—"} />
              <Row label="Parking Address"       value={app.parkingAddress || app.address} />
              <Row label="Location"              value={`${app.parkingCity || app.city}, ${app.parkingState || app.state} - ${app.parkingPinCode || app.pinCode || ""}`} />
            </Section>
          )}

          {/* Documents */}
          <Section title="Submitted Documents" icon={<FaFileAlt size={12} />}>
            {(!app.documents || app.documents.length === 0) ? (
              <p className="text-xs text-slate-400 py-2">No documents submitted.</p>
            ) : (
              <div className="space-y-2">
                {app.documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 shadow-xs">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{doc.documentType?.replace(/_/g, " ")}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{doc.originalFileName}</p>
                      {doc.fileSizeBytes && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{(doc.fileSizeBytes / 1024 / 1024).toFixed(2)} MB</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-3">
                      <a
                        href={`${BASE}/documents/${doc.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => {
                          e.preventDefault();
                          fetch(`${BASE}/documents/${doc.id}?download=false`, {
                            headers: { Authorization: `Bearer ${getToken()}` }
                          }).then(r => r.blob()).then(blob => {
                            window.open(URL.createObjectURL(blob), "_blank");
                          }).catch(() => toast.error("Failed to open document"));
                        }}
                        className="p-1.5 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
                        title="View Document"
                      >
                        <FaExternalLinkAlt size={12} />
                      </a>
                      <button
                        onClick={() => {
                          fetch(`${BASE}/documents/${doc.id}?download=true`, {
                            headers: { Authorization: `Bearer ${getToken()}` }
                          }).then(r => r.blob()).then(blob => {
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = doc.originalFileName;
                            a.click();
                          }).catch(() => toast.error("Download failed"));
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Download"
                      >
                        <FaDownload size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Review History */}
          {(app.reviewedAt || app.rejectionReason) && (
            <Section title="Review History" icon={<FaClipboardList size={12} />}>
              {app.reviewedAt && <Row label="Reviewed On" value={fmtDate(app.reviewedAt)} />}
              {app.reviewedByName && <Row label="Reviewed By" value={app.reviewedByName} />}
              {app.rejectionReason && <Row label="Rejection Reason" value={<span className="text-rose-600 dark:text-rose-400 font-medium">{app.rejectionReason}</span>} />}
              {app.adminNotes && <Row label="Admin Notes" value={app.adminNotes} />}
            </Section>
          )}

          {/* Admin Notes (for new review) */}
          {(canApprove || canReject) && (
            <div>
              <label className="text-xs text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider block mb-1.5">Admin Notes (Optional)</label>
              <textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                placeholder="Internal notes about this application..."
                rows={2}
                className="parkease-input text-xs resize-none"
              />
            </div>
          )}
        </div>

        {/* Action Footer */}
        {(canApprove || canReject) && (
          <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4">
            <AnimatePresence mode="wait">
              {!approveMode && !rejectMode ? (
                <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                  {app.applicationStatus === "PENDING" && (
                    <button
                      onClick={() => onReview(app.id).then(onClose)}
                      className="w-full py-2.5 rounded-xl border border-primary-300 dark:border-primary-800 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FaEye size={12} /> Mark Under Review
                    </button>
                  )}
                  <div className="flex gap-2">
                    {canReject && (
                      <button
                        onClick={() => setRejectMode(true)}
                        className="flex-1 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <FaTimes size={12} /> Reject
                      </button>
                    )}
                    {canApprove && (
                      <button
                        onClick={() => setApproveMode(true)}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <FaCheck size={12} /> Approve
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : approveMode ? (
                <motion.div key="approve" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3.5 mb-3">
                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-1">Approve Owner Application?</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      This will activate owner access for <strong className="text-slate-900 dark:text-white">{app.applicantName}</strong> ({app.applicantEmail}). They will be able to log in and manage parking immediately.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setApproveMode(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold cursor-pointer">Cancel</button>
                    <button onClick={handleApprove} disabled={loading}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                      {loading ? <FaSpinner className="animate-spin" size={12} /> : <FaCheck size={12} />} Confirm Approve
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="reject" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-sm font-bold text-rose-700 dark:text-rose-400 mb-2">Reject Owner Application</p>
                  <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection (required — will be shown to applicant)"
                    rows={3}
                    className="parkease-input text-xs border-rose-300 dark:border-rose-800 resize-none mb-3"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setRejectMode(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold cursor-pointer">Cancel</button>
                    <button onClick={handleReject} disabled={loading}
                      className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                      {loading ? <FaSpinner className="animate-spin" size={12} /> : <FaTimes size={12} />} Confirm Reject
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function OwnerApprovalsPage() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter]     = useState("ALL");
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState(null);

  const fetchData = useCallback(async (showLoader = false) => {
    if (showLoader) setRefreshing(true);
    try {
      const [appsData, statsData] = await Promise.all([
        ownerApprovalAPI.getAll(filter === "ALL" ? null : filter),
        ownerApprovalAPI.getStats(),
      ]);
      setApplications(appsData || []);
      setStats(statsData);
    } catch (err) {
      toast.error(err.message || "Failed to load applications");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = async (id, action) => {
    await ownerApprovalAPI.approve(id, action);
    toast.success("Application approved! Owner account activated.");
    fetchData(true);
  };

  const handleReject = async (id, action) => {
    await ownerApprovalAPI.reject(id, action);
    toast.success("Application rejected.");
    fetchData(true);
  };

  const handleReview = async (id) => {
    await ownerApprovalAPI.markUnderReview(id);
    toast.success("Marked as Under Review");
    fetchData(true);
  };

  const fmtDate = (d) => !d ? "—" : new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const filtered = applications.filter(a => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      a.applicantName?.toLowerCase().includes(s) ||
      a.applicantEmail?.toLowerCase().includes(s) ||
      a.businessName?.toLowerCase().includes(s) ||
      a.applicationRef?.toLowerCase().includes(s) ||
      a.city?.toLowerCase().includes(s)
    );
  });

  const FILTERS = [
    { key: "ALL",         label: "All",          count: (stats ? Object.values(stats).reduce((a,b)=>a+b,0) : 0) },
    { key: "PENDING",     label: "Pending",       count: stats?.pending || 0 },
    { key: "UNDER_REVIEW",label: "Under Review",  count: stats?.underReview || 0 },
    { key: "APPROVED",    label: "Approved",      count: stats?.approved || 0 },
    { key: "REJECTED",    label: "Rejected",      count: stats?.rejected || 0 },
  ];

  return (
    <DashboardLayout role="ADMIN">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800/60 flex items-center justify-center shadow-xs">
            <FaUserCheck size={18} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Owner Approvals</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Review and verify parking partner registration applications</p>
          </div>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-semibold shadow-xs transition-all cursor-pointer"
        >
          <FaSyncAlt className={refreshing ? "animate-spin text-primary-600" : ""} size={11} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Pending",       value: stats?.pending     || 0, color: "text-amber-600 dark:text-amber-400" },
          { label: "Under Review",  value: stats?.underReview || 0, color: "text-blue-600 dark:text-blue-400"  },
          { label: "Approved",      value: stats?.approved    || 0, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Rejected",      value: stats?.rejected    || 0, color: "text-rose-600 dark:text-rose-400"   },
        ].map(s => (
          <div key={s.label} className="parkease-card rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1 uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === f.key
                  ? "bg-primary-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {f.label} {f.count > 0 && <span className="ml-1 opacity-80">({f.count})</span>}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search applicant, email, business..."
            className="parkease-input pl-9 pr-4 py-2 text-xs w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="parkease-card rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <FaSpinner className="animate-spin text-primary-600" size={24} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
              <FaClipboardList size={22} />
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-bold text-sm">No applications found</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              {filter !== "ALL" ? "Try changing the status filter" : search ? "Try a different search query" : "Applications will appear here when submitted"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40">
                  {["Ref", "Applicant", "Business", "Location", "Submitted", "Status", "Actions"].map(h => (
                    <th key={h} className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 text-xs text-primary-600 dark:text-primary-400 font-bold font-mono">{app.applicationRef}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-xs text-slate-900 dark:text-white font-bold">{app.applicantName}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{app.applicantEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-xs text-slate-900 dark:text-white font-semibold">{app.businessName}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{app.businessType || "—"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{app.city}, {app.state}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{fmtDate(app.submittedAt)}</td>
                    <td className="px-4 py-3"><StatusBadge status={app.applicationStatus} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setSelected(app)}
                          className="px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 dark:hover:bg-primary-900/40 text-primary-600 dark:text-primary-400 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          title="Review"
                        >
                          <FaEye size={11} /> Review
                        </button>
                        {app.applicationStatus !== "APPROVED" && app.applicationStatus !== "REJECTED" && (
                          <button
                            onClick={() => setSelected(app)}
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 transition-all cursor-pointer"
                            title="Quick Approve"
                          >
                            <FaCheck size={11} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <ApplicationDetailModal
            app={selected}
            onClose={() => setSelected(null)}
            onApprove={handleApprove}
            onReject={handleReject}
            onReview={handleReview}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

// ── Section / Row helpers ──────────────────────────────────────────────────────

function Section({ title, icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-slate-400">{icon}</span>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">{title}</p>
      </div>
      <div className="bg-slate-50/70 dark:bg-slate-850/50 border border-slate-200/70 dark:border-slate-800 rounded-xl p-3.5 space-y-2.5 shadow-2xs">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">{label}</span>
      <span className="text-xs text-slate-900 dark:text-slate-200 text-right font-medium max-w-[65%]">{value ?? "—"}</span>
    </div>
  );
}
