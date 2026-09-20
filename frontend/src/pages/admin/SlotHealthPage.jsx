import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaHeartbeat, FaExclamationTriangle,
  FaSyncAlt
} from "react-icons/fa";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";

export default function SlotHealthPage() {
  const navigate = useNavigate();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get("/admin/slot-health");
      setHealth(data);
    } catch (err) {
      setError(err.message || "Failed to load slot telemetry");
      toast.error(err.message || "Failed to load slot telemetry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <DashboardLayout role="ADMIN">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Infrastructure & Slot Health</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            System-wide physical slot status monitoring, anomaly diagnostics, and maintenance queues
          </p>
        </div>
        <button
          onClick={fetchHealth}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all cursor-pointer self-start md:self-auto"
        >
          <FaSyncAlt className={`${loading ? "animate-spin text-primary-600" : ""}`} size={12} />
          <span>Refresh Health</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-2xl p-6 text-center text-rose-700 dark:text-rose-400 mb-6 flex flex-col items-center gap-3">
          <FaExclamationTriangle size={24} className="text-rose-500" />
          <p className="text-sm font-semibold">{error}</p>
          <button
            onClick={fetchHealth}
            className="px-4 py-2 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Retry Audit
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="parkease-card rounded-2xl p-6 animate-pulse flex items-center gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-850"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-850 rounded"></div>
              <div className="h-6 w-56 bg-slate-200 dark:bg-slate-850 rounded"></div>
              <div className="h-3 w-40 bg-slate-100 dark:bg-slate-800 rounded"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="parkease-card rounded-2xl p-4 animate-pulse space-y-2 shadow-sm">
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-850 rounded"></div>
                <div className="h-8 w-12 bg-slate-200 dark:bg-slate-850 rounded"></div>
                <div className="h-2 w-20 bg-slate-100 dark:bg-slate-800 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Overall Health Score Card */}
          <div className="parkease-card rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 border-emerald-200/80 dark:border-emerald-800/40">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-2xl font-bold shadow-xs">
                <FaHeartbeat />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400">System Diagnostic</span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {health?.healthySlotsRate}% Operational Integrity
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {health?.totalSlots || 0} total slots monitored across all active parking lots
                </p>
              </div>
            </div>

            {health?.ghostSlotsCount > 0 && (
              <button
                onClick={() => navigate("/admin/ghost-slots")}
                className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <FaExclamationTriangle />
                <span>Resolve {health.ghostSlotsCount} Ghost Slots →</span>
              </button>
            )}
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="parkease-card rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Ready Slots</span>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{health?.availableSlots || 0}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Available for new booking</p>
            </div>

            <div className="parkease-card rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Occupied</span>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1">{health?.occupiedSlots || 0}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Active verified parking</p>
            </div>

            <div className="parkease-card rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Reserved</span>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{health?.reservedSlots || 0}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Awaiting driver arrival</p>
            </div>

            <div className="parkease-card rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Maintenance</span>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{health?.maintenanceSlots || 0}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Repair ticket active</p>
            </div>

            <div className="parkease-card rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Disabled</span>
              <p className="text-2xl font-bold text-slate-600 dark:text-slate-300 mt-1">{health?.disabledSlots || 0}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Owner / admin lock</p>
            </div>
          </div>

        </div>
      )}
    </DashboardLayout>
  );
}
