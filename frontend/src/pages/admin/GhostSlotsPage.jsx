import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaExclamationTriangle, FaCheckCircle, FaSyncAlt
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Ghost Slot Anomaly Detector</h1>
            {ghosts.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                {ghosts.length} anomalies
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Detects parking slots marked occupied or reserved despite no corresponding active session
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchGhostSlots}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all cursor-pointer"
          >
            <FaSyncAlt className={`${loading ? "animate-spin text-primary-600" : ""}`} size={12} />
            <span>Scan Anomaly</span>
          </button>
          {ghosts.length > 0 && (
            <button
              onClick={handleFixAll}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <FaCheckCircle size={12} />
              <span>{actionLoading ? "Releasing..." : `Release All ${ghosts.length} Ghost Slots`}</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-2xl p-6 text-center text-rose-700 dark:text-rose-400 mb-6 flex flex-col items-center gap-3">
          <FaExclamationTriangle size={24} className="text-rose-500" />
          <p className="text-sm font-semibold">{error}</p>
          <button
            onClick={fetchGhostSlots}
            className="px-4 py-2 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Retry Sensor Scan
          </button>
        </div>
      )}

      {loading ? (
        <div className="parkease-card rounded-2xl p-6 space-y-4 animate-pulse shadow-sm">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-850 rounded"></div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
          ))}
        </div>
      ) : ghosts.length === 0 ? (
        <div className="parkease-card rounded-2xl p-16 text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center text-2xl">
            <FaCheckCircle />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">No Ghost Slots Detected</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            All physical parking slots are in perfect synchronization with verified customer booking sessions.
          </p>
        </div>
      ) : (
        <div className="parkease-card rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-850/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
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
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {ghosts.map((g) => (
                  <tr key={g.slotId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                      {g.slotCode}
                    </td>

                    <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                      {g.parkingName}
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                        {g.status}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                        AVAILABLE
                      </span>
                    </td>

                    <td className="p-4 font-bold text-purple-600 dark:text-purple-400">
                      {g.anomalyScore || 92}%
                    </td>

                    <td className="p-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {g.reason}
                    </td>

                    <td className="p-4 text-[11px] text-slate-400 dark:text-slate-500">
                      {fmtTime(g.lastBookingTime)}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleFixSingle(g.slotId, g.slotCode)}
                        disabled={actionLoading}
                        className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 font-bold text-xs transition-all cursor-pointer"
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
