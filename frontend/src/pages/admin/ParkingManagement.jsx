import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaSearch, FaTimes, FaEye,
  FaExclamationTriangle, FaMapMarkerAlt, FaUser, FaSyncAlt
} from "react-icons/fa";
import { api } from "../../api/api";
import ParkingDetailsModal from "./ParkingDetailsModal";
import { CardSkeleton } from "../../components/common/Skeleton";

export default function ParkingManagement() {
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedParking, setSelectedParking] = useState(null);
  const [confirmSuspend, setConfirmSuspend] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchParkings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get("/admin/parkings");
      setParkings(data || []);
    } catch (err) {
      setError(err.message || "Failed to load parking lots");
      toast.error(err.message || "Failed to load parking lots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParkings();
  }, []);

  const handleToggleSuspend = async () => {
    if (!confirmSuspend) return;
    const { id, status } = confirmSuspend;
    const shouldSuspend = status !== "SUSPENDED";
    setActionLoading(true);
    try {
      await api.patch(`/admin/parkings/${id}/suspend`, { suspend: shouldSuspend });
      toast.success(`Parking lot ${shouldSuspend ? "suspended" : "activated"}`);
      setParkings((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: shouldSuspend ? "SUSPENDED" : "ACTIVE" } : p))
      );
      setConfirmSuspend(null);
    } catch (err) {
      toast.error(err.message || "Failed to update parking state");
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = parkings.filter(
    (p) =>
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.toLowerCase().includes(search.toLowerCase()) ||
      p.ownerName?.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <DashboardLayout role="ADMIN">
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Parking Lots Management</h1>
          <p className="text-xs text-gray-400 mt-1">
            Audit parking facilities, monitor real-time occupancy, and control operational availability
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-300">
            Total Facilities: <strong className="text-white">{parkings.length}</strong>
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5 bg-black/20 border border-white/10 rounded-xl px-3 py-2 w-full md:w-80">
          <FaSearch className="text-gray-400 text-xs flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by lot name, address, or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-gray-500 outline-none w-full"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-gray-400 hover:text-white">
              <FaTimes size={10} />
            </button>
          )}
        </div>
      </div>

      {/* Parking Grid with Skeleton */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : error ? (
        <div className="bg-[#1e293b] border border-neon-red/30 rounded-2xl p-12 text-center text-gray-300 flex flex-col items-center gap-3">
          <FaExclamationTriangle className="text-neon-red text-3xl" />
          <p className="text-sm font-bold text-white">Unable to load parking facilities</p>
          <p className="text-xs text-gray-400">{error}</p>
          <button
            onClick={fetchParkings}
            className="mt-2 px-4 py-2 bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue border border-neon-blue/40 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <FaSyncAlt size={12} /> Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-12 text-center text-gray-400 text-xs">
          No parking locations matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <div
              key={p.id}
              className={`bg-[#1e293b] border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                p.status === "SUSPENDED" ? "border-red-500/30 opacity-80" : "border-white/10 hover:border-neon-blue/40"
              }`}
            >
              <div>
                {/* Status & Name */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-black text-white text-sm tracking-tight">{p.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-black border flex-shrink-0 ${
                      p.status === "SUSPENDED"
                        ? "bg-neon-red/20 text-neon-red border-neon-red/30"
                        : "bg-neon-green/20 text-neon-green border-neon-green/30"
                    }`}
                  >
                    {p.status || "ACTIVE"}
                  </span>
                </div>

                <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-3">
                  <FaMapMarkerAlt className="text-neon-blue text-xs flex-shrink-0" />
                  <span className="truncate">{p.location}</span>
                </p>

                <p className="text-[11px] text-gray-500 flex items-center gap-1.5 mb-4">
                  <FaUser className="text-gray-400 text-[10px]" />
                  <span>Owner: <strong className="text-gray-300">{p.ownerName}</strong></span>
                </p>

                {/* Occupancy Progress */}
                <div className="space-y-1.5 bg-black/20 p-3 rounded-xl border border-white/5 mb-4">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-400">Occupancy</span>
                    <span className="font-bold text-white">{p.occupancyRate}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                    <div
                      style={{ width: `${p.occupancyRate}%` }}
                      className={`h-full rounded-full ${
                        p.occupancyRate >= 85 ? "bg-neon-red" : p.occupancyRate >= 60 ? "bg-amber-400" : "bg-neon-blue"
                      }`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 pt-1">
                    <span>{p.availableSlots} available</span>
                    <span>{p.occupiedSlots} occupied</span>
                    <span>{p.totalSlots} total</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                <button
                  onClick={() => setSelectedParking(p)}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-colors"
                >
                  <FaEye size={11} className="text-neon-blue" /> View Slots
                </button>

                <button
                  onClick={() => setConfirmSuspend(p)}
                  className={`py-1.5 px-3 rounded-xl font-bold text-xs border transition-colors ${
                    p.status === "SUSPENDED"
                      ? "bg-neon-green/10 text-neon-green border-neon-green/30 hover:bg-neon-green/20"
                      : "bg-neon-red/10 text-neon-red border-neon-red/30 hover:bg-neon-red/20"
                  }`}
                >
                  {p.status === "SUSPENDED" ? "Activate" : "Suspend"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal for Suspend/Activate */}
      {confirmSuspend && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-white/10 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center text-xl">
              <FaExclamationTriangle />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {confirmSuspend.status === "SUSPENDED" ? "Activate Parking?" : "Suspend Parking?"}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {confirmSuspend.status === "SUSPENDED"
                  ? `Re-open ${confirmSuspend.name} for public reservations.`
                  : `Temporarily lock all slots in ${confirmSuspend.name}. Existing active bookings will remain unaffected.`}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setConfirmSuspend(null)}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleSuspend}
                disabled={actionLoading}
                className={`flex-1 py-2 rounded-xl font-bold text-xs text-white transition-colors ${
                  confirmSuspend.status === "SUSPENDED"
                    ? "bg-neon-green hover:bg-green-600"
                    : "bg-neon-red hover:bg-red-600"
                }`}
              >
                {actionLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Parking Details Modal */}
      {selectedParking && (
        <ParkingDetailsModal
          parking={selectedParking}
          onClose={() => setSelectedParking(null)}
        />
      )}
    </DashboardLayout>
  );
}
