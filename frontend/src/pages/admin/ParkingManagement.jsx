import { useState, useEffect } from "react";
import { toast } from "react-toastify";
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Parking Lots Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800/60">
              {parkings.length} facilities
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Audit parking facilities, monitor real-time occupancy, and manage operational availability
          </p>
        </div>
        <button
          onClick={fetchParkings}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all cursor-pointer w-fit"
        >
          <FaSyncAlt size={11} className={loading ? "animate-spin text-primary-600" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="parkease-card rounded-2xl p-4 mb-6 shadow-sm flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by lot name, address, or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="parkease-input pl-9 pr-8 py-2 text-xs w-full"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <FaTimes size={10} />
            </button>
          )}
        </div>
      </div>

      {/* Parking Grid with Skeleton */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : error ? (
        <div className="parkease-card rounded-2xl p-12 text-center text-slate-600 dark:text-slate-300 flex flex-col items-center gap-3 border-rose-200 dark:border-rose-900/40">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl">
            <FaExclamationTriangle />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">Unable to load parking facilities</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
          <button
            onClick={fetchParkings}
            className="mt-2 px-4 py-2 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800/60 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <FaSyncAlt size={12} /> Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="parkease-card rounded-2xl p-12 text-center text-slate-400 text-xs">
          No parking locations matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <div
              key={p.id}
              className={`parkease-card rounded-2xl p-5 flex flex-col justify-between shadow-sm transition-all ${
                p.status === "SUSPENDED" ? "border-rose-300 dark:border-rose-900/50 opacity-85" : "hover:border-primary-300 dark:hover:border-primary-800/80"
              }`}
            >
              <div>
                {/* Status & Name */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">{p.name}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0 ${
                      p.status === "SUSPENDED"
                        ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60"
                        : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                    }`}
                  >
                    {p.status || "ACTIVE"}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2.5">
                  <FaMapMarkerAlt className="text-primary-600 dark:text-primary-400 text-xs flex-shrink-0" />
                  <span className="truncate">{p.location}</span>
                </p>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-4">
                  <FaUser className="text-slate-400 text-[10px]" />
                  <span>Owner: <strong className="text-slate-700 dark:text-slate-300">{p.ownerName}</strong></span>
                </p>

                {/* Occupancy Progress */}
                <div className="space-y-1.5 bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Occupancy</span>
                    <span className="font-bold text-slate-900 dark:text-white">{p.occupancyRate}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${p.occupancyRate}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${
                        p.occupancyRate >= 85 ? "bg-rose-500" : p.occupancyRate >= 60 ? "bg-amber-500" : "bg-primary-600"
                      }`}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <span>{p.availableSlots} available</span>
                    <span>{p.occupiedSlots} occupied</span>
                    <span>{p.totalSlots} total</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setSelectedParking(p)}
                  className="flex-1 py-2 px-3 rounded-xl bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 dark:hover:bg-primary-900/40 text-primary-600 dark:text-primary-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FaEye size={11} /> View Slots
                </button>

                <button
                  onClick={() => setConfirmSuspend(p)}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border transition-colors cursor-pointer ${
                    p.status === "SUSPENDED"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100"
                      : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60 hover:bg-rose-100"
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center text-xl">
              <FaExclamationTriangle />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {confirmSuspend.status === "SUSPENDED" ? "Activate Parking?" : "Suspend Parking?"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {confirmSuspend.status === "SUSPENDED"
                  ? `Re-open ${confirmSuspend.name} for public reservations.`
                  : `Temporarily lock all slots in ${confirmSuspend.name}. Existing active bookings will remain unaffected.`}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setConfirmSuspend(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleSuspend}
                disabled={actionLoading}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white transition-colors cursor-pointer shadow-sm ${
                  confirmSuspend.status === "SUSPENDED"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
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
