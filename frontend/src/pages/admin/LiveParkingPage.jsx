import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaMapMarkerAlt, FaCar, FaMotorcycle, FaSyncAlt,
  FaExclamationTriangle
} from "react-icons/fa";
import { api } from "../../api/api";

export default function LiveParkingPage() {
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchLive = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await api.get("/admin/live-parking");
      setParkings(data || []);
    } catch (err) {
      setError(err.message || "Failed to load live parking telemetry");
      toast.error(err.message || "Failed to load live parking telemetry");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLive();
  }, []);

  const getSlotColor = (status) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300";
      case "OCCUPIED":
        return "bg-primary-50 dark:bg-primary-950/40 border-primary-200 dark:border-primary-800/60 text-primary-700 dark:text-primary-300";
      case "RESERVED":
        return "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 animate-pulse";
      case "MAINTENANCE":
        return "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300";
      case "DISABLED":
      default:
        return "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400";
    }
  };

  return (
    <DashboardLayout role="ADMIN">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Live Parking Telemetry</h1>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time physical slot occupancy and operational grid status across all facilities
          </p>
        </div>

        <button
          onClick={fetchLive}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all cursor-pointer w-fit"
        >
          <FaSyncAlt className={`${refreshing ? "animate-spin text-primary-600" : ""}`} size={12} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Legend */}
      <div className="parkease-card rounded-2xl p-4 mb-6 shadow-sm flex items-center justify-between flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
            <span className="w-3 h-3 rounded bg-emerald-500" /> Available
          </span>
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
            <span className="w-3 h-3 rounded bg-primary-600" /> Occupied
          </span>
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
            <span className="w-3 h-3 rounded bg-amber-500" /> Reserved
          </span>
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
            <span className="w-3 h-3 rounded bg-purple-500" /> Maintenance
          </span>
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
            <span className="w-3 h-3 rounded bg-slate-400" /> Disabled
          </span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-2xl p-6 text-center text-rose-700 dark:text-rose-400 mb-6 flex flex-col items-center gap-3">
          <FaExclamationTriangle size={24} className="text-rose-500" />
          <p className="text-sm font-semibold">{error}</p>
          <button
            onClick={fetchLive}
            className="px-4 py-2 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Retry Loading Telemetry
          </button>
        </div>
      )}

      {/* Venues Live View */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="parkease-card rounded-2xl p-6 animate-pulse shadow-sm">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                <div className="space-y-2">
                  <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                  <div className="h-3 w-32 bg-slate-100 dark:bg-slate-850 rounded-lg"></div>
                </div>
                <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
                {Array.from({ length: 20 }).map((_, idx) => (
                  <div key={idx} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : parkings.length === 0 ? (
        <div className="parkease-card rounded-2xl p-12 text-center text-slate-400 text-xs">
          No parking facilities registered.
        </div>
      ) : (
        <div className="space-y-6">
          {parkings.map((p) => (
            <div key={p.id} className="parkease-card rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">{p.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800/60">
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    <FaMapMarkerAlt size={10} className="text-primary-600 dark:text-primary-400" /> {p.location} • Managed by {p.ownerName}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Occupancy Rate</p>
                    <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{p.occupancyRate}%</p>
                  </div>
                </div>
              </div>

              {/* Slot Grid Matrix */}
              <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
                {p.slots?.map((s) => (
                  <div
                    key={s.id}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${getSlotColor(
                      s.status
                    )}`}
                    title={`Slot ${s.code}: ${s.status} (₹${s.cost}/hr)`}
                  >
                    {s.vehicleType === "BIKE" ? (
                      <FaMotorcycle size={12} />
                    ) : (
                      <FaCar size={12} />
                    )}
                    <span className="font-mono font-bold text-xs">{s.code}</span>
                    <span className="text-[9px] uppercase tracking-wider font-bold">
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
