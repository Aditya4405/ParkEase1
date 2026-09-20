import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaCheckCircle,
  FaTimesCircle, FaExclamationTriangle, FaSyncAlt
} from "react-icons/fa";
import { api } from "../../api/api";
import { TableSkeleton } from "../../components/common/Skeleton";

export default function RefundsPage() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [actionType, setActionType] = useState(null); // "APPROVED" or "REJECTED"

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get("/admin/refunds");
      setRefunds(data || []);
    } catch (err) {
      setError(err.message || "Failed to load refund requests");
      toast.error(err.message || "Failed to load refund requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const handleProcessRefund = async () => {
    if (!selectedRefund || !actionType) return;
    setActionLoading(true);
    try {
      await api.patch(`/admin/refunds/${selectedRefund.id}/status`, { status: actionType });
      toast.success(`Refund request marked as ${actionType}`);
      setRefunds((prev) =>
        prev.map((r) => (r.id === selectedRefund.id ? { ...r, status: actionType } : r))
      );
      setSelectedRefund(null);
      setActionType(null);
    } catch (err) {
      toast.error(err.message || "Failed to process refund");
    } finally {
      setActionLoading(false);
    }
  };

  const fmtMoney = (n) => `₹${(n || 0).toLocaleString("en-IN")}`;
  const fmtTime = (iso) => !iso ? "—" : new Date(iso).toLocaleString("en-IN", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });

  return (
    <DashboardLayout role="ADMIN">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Refund Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review customer refund requests, dispute claims, and authorize transaction reversals
          </p>
        </div>
        <button
          onClick={fetchRefunds}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all cursor-pointer w-fit"
        >
          <FaSyncAlt size={11} className={loading ? "animate-spin text-primary-600" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : error ? (
        <div className="parkease-card rounded-2xl p-12 text-center text-slate-600 dark:text-slate-300 flex flex-col items-center gap-3 border-rose-200 dark:border-rose-900/40">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl">
            <FaExclamationTriangle />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">Unable to load refund claims</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
          <button
            onClick={fetchRefunds}
            className="mt-2 px-4 py-2 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800/60 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <FaSyncAlt size={12} /> Retry
          </button>
        </div>
      ) : refunds.length === 0 ? (
        <div className="parkease-card rounded-2xl p-12 text-center text-slate-400 text-xs shadow-sm">
          No refund requests pending review. All customer settlements are resolved.
        </div>
      ) : (
        <div className="parkease-card rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-850/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Claim ID / Booking</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Facility</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {refunds.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-mono font-bold text-primary-600 dark:text-primary-400">
                      REF-{r.id} <span className="text-slate-400 font-normal">#{r.bookingId}</span>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white">{r.userName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{r.userEmail}</p>
                    </td>

                    <td className="p-4 text-slate-700 dark:text-slate-300 font-semibold">{r.parkingName}</td>

                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">{fmtMoney(r.amount)}</td>

                    <td className="p-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">{r.reason || "Booking cancellation"}</td>

                    <td className="p-4 text-[11px] text-slate-400 dark:text-slate-500">{fmtTime(r.createdAt)}</td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          r.status === "APPROVED" || r.status === "COMPLETED"
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                            : r.status === "REJECTED"
                            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60"
                            : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      {r.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedRefund(r);
                              setActionType("APPROVED");
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 font-bold transition-all cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRefund(r);
                              setActionType("REJECTED");
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 font-bold transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Resolved by {r.reviewedBy || "Admin"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedRefund && actionType && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div
              className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center text-xl ${
                actionType === "APPROVED" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
              }`}
            >
              {actionType === "APPROVED" ? <FaCheckCircle /> : <FaTimesCircle />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {actionType === "APPROVED" ? "Approve Refund?" : "Reject Refund?"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {actionType === "APPROVED"
                  ? `Authorize ₹${selectedRefund.amount} reimbursement for ${selectedRefund.userName}.`
                  : `Decline refund claim REF-${selectedRefund.id} for ${selectedRefund.userName}.`}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedRefund(null);
                  setActionType(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessRefund}
                disabled={actionLoading}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white transition-colors cursor-pointer shadow-sm ${
                  actionType === "APPROVED" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {actionLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
