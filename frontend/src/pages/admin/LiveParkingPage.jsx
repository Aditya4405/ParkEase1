import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaMapMarkerAlt, FaCar, FaMotorcycle, FaSpinner, FaSyncAlt,
  FaCheckCircle, FaExclamationTriangle, FaWrench, FaBan
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
        return "bg-neon-green/20 border-neon-green/40 text-neon-green";
      case "OCCUPIED":
        return "bg-neon-blue/20 border-neon-blue/40 text-neon-blue";
      case "RESERVED":
        return "bg-amber-400/20 border-amber-400/40 text-amber-400 animate-pulse";
      case "MAINTENANCE":
        return "bg-purple-500/20 border-purple-500/40 text-purple-400";
      case "DISABLED":
      default:
        return "bg-gray-500/20 border-gray-500/40 text-gray-400";
    }
  };

  return (
    <DashboardLayout role="ADMIN">
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">Live Parking Telemetry</h1>
            <span className="w-2.5 h-2.5 rounded-full bg-neon-green animate-ping" />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Real-time physical slot occupancy and operational grid status across all facilities
          </p>
        </div>

        <button
          onClick={fetchLive}
          disabled={refreshing}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <FaSyncAlt className={`${refreshing ? "animate-spin text-neon-blue" : ""}`} size={12} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Legend */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-gray-300 font-semibold">
            <span className="w-3 h-3 rounded bg-neon-green/40 border border-neon-green" /> Available
          </span>
          <span className="flex items-center gap-1.5 text-gray-300 font-semibold">
            <span className="w-3 h-3 rounded bg-neon-blue/40 border border-neon-blue" /> Occupied
          </span>
          <span className="flex items-center gap-1.5 text-gray-300 font-semibold">
            <span className="w-3 h-3 rounded bg-amber-400/40 border border-amber-400" /> Reserved
          </span>
          <span className="flex items-center gap-1.5 text-gray-300 font-semibold">
            <span className="w-3 h-3 rounded bg-purple-500/40 border border-purple-500" /> Maintenance
          </span>
          <span className="flex items-center gap-1.5 text-gray-300 font-semibold">
            <span className="w-3 h-3 rounded bg-gray-500/40 border border-gray-500" /> Disabled
          </span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center text-red-400 mb-6 flex flex-col items-center gap-3">
          <FaExclamationTriangle size={24} className="text-red-400" />
          <p className="text-sm font-semibold">{error}</p>
          <button
            onClick={fetchLive}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Retry Loading Telemetry
          </button>
        </div>
      )}

      {/* Venues Live View */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 animate-pulse">
              <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-5">
                <div className="space-y-2">
                  <div className="h-5 w-48 bg-white/10 rounded-lg"></div>
                  <div className="h-3 w-32 bg-white/5 rounded-lg"></div>
                </div>
                <div className="h-8 w-20 bg-white/10 rounded-lg"></div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
                {Array.from({ length: 20 }).map((_, idx) => (
                  <div key={idx} className="h-16 rounded-xl bg-white/5 border border-white/5"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : parkings.length === 0 ? (
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-12 text-center text-gray-400 text-xs">
          No parking facilities registered.
        </div>
      ) : (
        <div className="space-y-6">
          {parkings.map((p) => (
            <div key={p.id} className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-white">{p.name}</h2>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-neon-blue/20 text-neon-blue border border-neon-blue/30">
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <FaMapMarkerAlt size={10} className="text-neon-blue" /> {p.location} • Managed by {p.ownerName}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400">Occupancy Rate</p>
                    <p className="text-lg font-black text-neon-blue">{p.occupancyRate}%</p>
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
                    <span className="font-mono font-black text-xs">{s.code}</span>
                    <span className="text-[8px] uppercase tracking-wider opacity-80 font-bold">
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
