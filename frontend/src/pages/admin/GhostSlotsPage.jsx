import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaExclamationTriangle, FaWrench, FaCheckCircle, FaSpinner,
  FaShieldAlt, FaSyncAlt, FaCar
} from "react-icons/fa";
import { api } from "../../api/api";

export default function GhostSlotsPage() {
  const [ghosts, setGhosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState(null);

  const fetchGhostSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get("/admin/ghost-slots");
      setGhosts(data || []);
    } catch (err) {
      setError(err.message || "Failed to load ghost slots telemetry");
      toast.error(err.message || "Failed to load ghost slots telemetry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGhostSlots();
  }, []);

  const handleFixSingle = async (slotId, slotCode) => {
    setActionLoading(true);
    try {
      await api.post(`/admin/ghost-slots/${slotId}/fix`);
      toast.success(`Slot ${slotCode} successfully released to AVAILABLE`);
      setGhosts((prev) => prev.filter((g) => g.slotId !== slotId));
    } catch (err) {
      toast.error(err.message || "Failed to release slot");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFixAll = async () => {
    setActionLoading(true);
    try {
      const res = await api.post("/admin/ghost-slots/fix-all");
      toast.success(`Released ${res.count || ghosts.length} ghost slots!`);
      setGhosts([]);
    } catch (err) {
      toast.error(err.message || "Failed to fix ghost slots");
    } finally {
      setActionLoading(false);
    }
  };

  const fmtTime = (iso) => !iso ? "—" : new Date(iso).toLocaleString("en-IN", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });

  return (
    <DashboardLayout role="ADMIN">
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white">Ghost Slot Anomaly Detector</h1>
            {ghosts.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {ghosts.length} ANOMALIES
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Detects parking slots marked occupied or reserved despite no corresponding active session
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchGhostSlots}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <FaSyncAlt className={`${loading ? "animate-spin text-neon-blue" : ""}`} size={12} />
            <span>Scan Anomaly</span>
          </button>
          {ghosts.length > 0 && (
            <button
              onClick={handleFixAll}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-neon-green to-emerald-600 text-white text-xs font-bold shadow-lg shadow-green-500/20 hover:opacity-90 transition-all cursor-pointer"
            >
              <FaCheckCircle size={12} />
              <span>{actionLoading ? "Releasing..." : `Release All ${ghosts.length} Ghost Slots`}</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center text-red-400 mb-6 flex flex-col items-center gap-3">
          <FaExclamationTriangle size={24} className="text-red-400" />
          <p className="text-sm font-semibold">{error}</p>
          <button
            onClick={fetchGhostSlots}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Retry Sensor Scan
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 space-y-4 animate-pulse">
          <div className="h-6 w-48 bg-white/10 rounded"></div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      ) : ghosts.length === 0 ? (
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-16 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-neon-green/20 text-neon-green mx-auto flex items-center justify-center text-2xl">
            <FaCheckCircle />
          </div>
          <h2 className="text-base font-black text-white">No Ghost Slots Detected</h2>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            All physical parking slots are in perfect synchronization with verified customer booking sessions.
          </p>
        </div>
      ) : (
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/30 border-b border-white/10 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Slot</th>
                  <th className="p-4">Facility</th>
                  <th className="p-4">Current Status</th>
                  <th className="p-4">Expected</th>
                  <th className="p-4">Anomaly Confidence</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Last Activity</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ghosts.map((g) => (
                  <tr key={g.slotId} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-mono font-black text-white">
                      {g.slotCode}
                    </td>

                    <td className="p-4 font-bold text-gray-300">
                      {g.parkingName}
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {g.status}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-neon-green/20 text-neon-green border border-neon-green/30">
                        AVAILABLE
                      </span>
                    </td>

                    <td className="p-4 font-bold text-neon-purple">
                      {g.anomalyScore || 92}%
                    </td>

                    <td className="p-4 text-gray-400 max-w-xs truncate">
                      {g.reason}
                    </td>

                    <td className="p-4 text-[11px] text-gray-500">
                      {fmtTime(g.lastBookingTime)}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleFixSingle(g.slotId, g.slotCode)}
                        disabled={actionLoading}
                        className="px-3 py-1 rounded-lg bg-neon-green/10 text-neon-green border border-neon-green/30 hover:bg-neon-green/20 font-bold text-xs transition-all"
                      >
                        Release Slot
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
