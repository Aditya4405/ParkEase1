import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaHeartbeat, FaCheckCircle, FaExclamationTriangle, FaWrench,
  FaBan, FaSpinner, FaCar, FaSyncAlt
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
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Infrastructure & Slot Health</h1>
          <p className="text-xs text-gray-400 mt-1">
            System-wide physical slot status monitoring, anomaly diagnostics, and maintenance queues
          </p>
        </div>
        <button
          onClick={fetchHealth}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer self-start md:self-auto"
        >
          <FaSyncAlt className={`${loading ? "animate-spin text-neon-blue" : ""}`} size={12} />
          <span>Refresh Health</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center text-red-400 mb-6 flex flex-col items-center gap-3">
          <FaExclamationTriangle size={24} className="text-red-400" />
          <p className="text-sm font-semibold">{error}</p>
          <button
            onClick={fetchHealth}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Retry Audit
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 animate-pulse flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 bg-white/10 rounded"></div>
              <div className="h-6 w-56 bg-white/10 rounded"></div>
              <div className="h-3 w-40 bg-white/5 rounded"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 animate-pulse space-y-2">
                <div className="h-3 w-16 bg-white/10 rounded"></div>
                <div className="h-8 w-12 bg-white/10 rounded"></div>
                <div className="h-2 w-20 bg-white/5 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Overall Health Score Card */}
          <div className="bg-gradient-to-r from-emerald-500/10 via-[#1e293b] to-blue-500/10 border border-emerald-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl font-black shadow-lg">
                <FaHeartbeat />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">System Diagnostic</span>
                <h2 className="text-xl font-black text-white">
                  {health?.healthySlotsRate}% Operational Integrity
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {health?.totalSlots || 0} total slots monitored across all integrated parking lots
                </p>
              </div>
            </div>

            {health?.ghostSlotsCount > 0 && (
              <button
                onClick={() => navigate("/admin/ghost-slots")}
                className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-2 transition-all"
              >
                <FaExclamationTriangle />
                <span>Resolve {health.ghostSlotsCount} Ghost Slots →</span>
              </button>
            )}
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4">
              <span className="text-[10px] text-gray-400 uppercase font-bold">Ready Slots</span>
              <p className="text-2xl font-black text-neon-green mt-1">{health?.availableSlots || 0}</p>
              <p className="text-[10px] text-gray-500 mt-1">Available for new booking</p>
            </div>

            <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4">
              <span className="text-[10px] text-gray-400 uppercase font-bold">Occupied</span>
              <p className="text-2xl font-black text-neon-blue mt-1">{health?.occupiedSlots || 0}</p>
              <p className="text-[10px] text-gray-500 mt-1">Active verified parking</p>
            </div>

            <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4">
              <span className="text-[10px] text-gray-400 uppercase font-bold">Reserved</span>
              <p className="text-2xl font-black text-amber-400 mt-1">{health?.reservedSlots || 0}</p>
              <p className="text-[10px] text-gray-500 mt-1">Awaiting driver arrival</p>
            </div>

            <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4">
              <span className="text-[10px] text-gray-400 uppercase font-bold">Maintenance</span>
              <p className="text-2xl font-black text-purple-400 mt-1">{health?.maintenanceSlots || 0}</p>
              <p className="text-[10px] text-gray-500 mt-1">Repair ticket active</p>
            </div>

            <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4">
              <span className="text-[10px] text-gray-400 uppercase font-bold">Disabled</span>
              <p className="text-2xl font-black text-gray-400 mt-1">{health?.disabledSlots || 0}</p>
              <p className="text-[10px] text-gray-500 mt-1">Owner / admin lock</p>
            </div>
          </div>

        </div>
      )}
    </DashboardLayout>
  );
}
