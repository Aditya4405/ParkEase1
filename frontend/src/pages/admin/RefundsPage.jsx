import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaUndo, FaSearch, FaTimes, FaCheckCircle,
  FaTimesCircle, FaExclamationTriangle, FaMoneyBillWave, FaSyncAlt
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
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Refund Management</h1>
          <p className="text-xs text-gray-400 mt-1">
            Review customer refund requests, dispute claims, and authorize transaction reversals
          </p>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : error ? (
        <div className="bg-[#1e293b] border border-neon-red/30 rounded-2xl p-12 text-center text-gray-300 flex flex-col items-center gap-3">
          <FaExclamationTriangle className="text-neon-red text-3xl" />
          <p className="text-sm font-bold text-white">Unable to load refund claims</p>
          <p className="text-xs text-gray-400">{error}</p>
          <button
            onClick={fetchRefunds}
            className="mt-2 px-4 py-2 bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue border border-neon-blue/40 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <FaSyncAlt size={12} /> Retry
          </button>
        </div>
      ) : refunds.length === 0 ? (
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-12 text-center text-gray-400 text-xs">
          No refund requests pending review. All customer settlements are resolved.
        </div>
      ) : (
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/30 border-b border-white/10 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
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
              <tbody className="divide-y divide-white/5">
                {refunds.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-mono font-bold text-gray-300">
                      REF-{r.id} <span className="text-gray-500 font-normal">#{r.bookingId}</span>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-white">{r.userName}</p>
                      <p className="text-[11px] text-gray-400">{r.userEmail}</p>
                    </td>

                    <td className="p-4 text-gray-300 font-semibold">{r.parkingName}</td>

                    <td className="p-4 font-black text-neon-green">{fmtMoney(r.amount)}</td>

                    <td className="p-4 text-gray-400 max-w-xs truncate">{r.reason || "Booking cancellation"}</td>

                    <td className="p-4 text-[11px] text-gray-400">{fmtTime(r.createdAt)}</td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                          r.status === "APPROVED" || r.status === "COMPLETED"
                            ? "bg-neon-green/20 text-neon-green border-neon-green/30"
                            : r.status === "REJECTED"
                            ? "bg-neon-red/20 text-neon-red border-neon-red/30"
                            : "bg-amber-500/20 text-amber-400 border-amber-500/30"
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
                            className="px-2.5 py-1 rounded-lg bg-neon-green/10 text-neon-green border border-neon-green/30 hover:bg-neon-green/20 font-bold transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRefund(r);
                              setActionType("REJECTED");
                            }}
                            className="px-2.5 py-1 rounded-lg bg-neon-red/10 text-neon-red border border-neon-red/30 hover:bg-neon-red/20 font-bold transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-500">Resolved by {r.reviewedBy || "Admin"}</span>
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-white/10 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div
              className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center text-xl ${
                actionType === "APPROVED" ? "bg-neon-green/20 text-neon-green" : "bg-neon-red/20 text-neon-red"
              }`}
            >
              {actionType === "APPROVED" ? <FaCheckCircle /> : <FaTimesCircle />}
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {actionType === "APPROVED" ? "Approve Refund?" : "Reject Refund?"}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
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
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessRefund}
                disabled={actionLoading}
                className={`flex-1 py-2 rounded-xl font-bold text-xs text-white transition-colors ${
                  actionType === "APPROVED" ? "bg-neon-green hover:bg-green-600" : "bg-neon-red hover:bg-red-600"
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
