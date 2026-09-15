import { useState, useEffect, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaSearch, FaTimes, FaCar, FaMotorcycle,
  FaSyncAlt, FaExclamationTriangle
} from "react-icons/fa";
import { api } from "../../api/api";
import { TableSkeleton } from "../../components/common/Skeleton";

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [vehicleFilter, setVehicleFilter] = useState("ALL");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get("/admin/bookings");
      setBookings(data || []);
    } catch (err) {
      setError(err.message || "Failed to load bookings");
      toast.error(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchSearch =
        !search ||
        String(b.id).includes(search) ||
        b.userName?.toLowerCase().includes(search.toLowerCase()) ||
        b.parkingName?.toLowerCase().includes(search.toLowerCase()) ||
        b.vehicleNumber?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
      const matchVehicle = vehicleFilter === "ALL" || b.vehicleType === vehicleFilter;

      return matchSearch && matchStatus && matchVehicle;
    });
  }, [bookings, search, statusFilter, vehicleFilter]);

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
          <h1 className="text-2xl font-black text-white">Booking Management</h1>
          <p className="text-xs text-gray-400 mt-1">
            Complete real-time ledger of reservations, active stays, and payment statuses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-300">
            Total Bookings: <strong className="text-white">{bookings.length}</strong>
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="flex items-center gap-2.5 bg-black/20 border border-white/10 rounded-xl px-3 py-2 w-full md:w-80">
          <FaSearch className="text-gray-400 text-xs flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by ID, user, parking, vehicle..."
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

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="PENDING">PENDING</option>
          </select>

          {/* Vehicle Type Filter */}
          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
          >
            <option value="ALL">All Vehicles</option>
            <option value="CAR">Car</option>
            <option value="BIKE">Bike</option>
            <option value="TRUCK">Truck / Heavy</option>
          </select>
        </div>
      </div>

      {/* Bookings Table with Skeleton */}
      {loading ? (
        <TableSkeleton rows={7} cols={8} />
      ) : error ? (
        <div className="bg-[#1e293b] border border-neon-red/30 rounded-2xl p-12 text-center text-gray-300 flex flex-col items-center gap-3">
          <FaExclamationTriangle className="text-neon-red text-3xl" />
          <p className="text-sm font-bold text-white">Unable to load bookings ledger</p>
          <p className="text-xs text-gray-400">{error}</p>
          <button
            onClick={fetchBookings}
            className="mt-2 px-4 py-2 bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue border border-neon-blue/40 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <FaSyncAlt size={12} /> Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-12 text-center text-gray-400 text-xs">
          No bookings matching the current criteria.
        </div>
      ) : (
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/30 border-b border-white/10 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Facility & Slot</th>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Schedule</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-mono font-bold text-gray-300">
                      #{b.id}
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-white">{b.userName}</p>
                      <p className="text-[11px] text-gray-400">{b.userEmail}</p>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-white">{b.parkingName}</p>
                      <span className="text-[10px] text-neon-blue font-bold">Slot: {b.slotCode}</span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-gray-300 font-semibold">
                        {b.vehicleType === "BIKE" ? <FaMotorcycle className="text-amber-400" /> : <FaCar className="text-blue-400" />}
                        <span>{b.vehicleNumber}</span>
                      </div>
                    </td>

                    <td className="p-4 text-[11px] text-gray-400">
                      <p>{fmtTime(b.startTime)}</p>
                      <p className="text-gray-500">to {fmtTime(b.endTime)}</p>
                    </td>

                    <td className="p-4 font-black text-neon-green">
                      {fmtMoney(b.amount)}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                          b.status === "ACTIVE"
                            ? "bg-neon-blue/20 text-neon-blue border-neon-blue/30 animate-pulse"
                            : b.status === "COMPLETED"
                            ? "bg-neon-green/20 text-neon-green border-neon-green/30"
                            : b.status === "CANCELLED"
                            ? "bg-neon-red/20 text-neon-red border-neon-red/30"
                            : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neon-blue border border-white/10 font-bold transition-all"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-black text-white">Booking #{selectedBooking.id} Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-gray-400">Customer</span>
                <span className="font-bold text-white">{selectedBooking.userName} ({selectedBooking.userEmail})</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-gray-400">Parking Location</span>
                <span className="font-bold text-white">{selectedBooking.parkingName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-gray-400">Parking Slot</span>
                <span className="font-bold text-neon-blue">{selectedBooking.slotCode} ({selectedBooking.vehicleType})</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-gray-400">Vehicle Number</span>
                <span className="font-bold text-white font-mono">{selectedBooking.vehicleNumber}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-gray-400">Start Time</span>
                <span className="font-bold text-white">{fmtTime(selectedBooking.startTime)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-gray-400">End Time</span>
                <span className="font-bold text-white">{fmtTime(selectedBooking.endTime)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-gray-400">Total Amount</span>
                <span className="font-black text-neon-green text-sm">{fmtMoney(selectedBooking.amount)}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-400">Status</span>
                <span className="font-black text-neon-blue">{selectedBooking.status}</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
