import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Booking Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800/60">
              {bookings.length} reservations
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete real-time ledger of reservations, active parking sessions, and settlements
          </p>
        </div>
        <button
          onClick={fetchBookings}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all cursor-pointer w-fit"
        >
          <FaSyncAlt size={11} className={loading ? "animate-spin text-primary-600" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="parkease-card rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by ID, user, parking, vehicle..."
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

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="parkease-input py-2 px-3 text-xs cursor-pointer"
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
            className="parkease-input py-2 px-3 text-xs cursor-pointer"
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
        <div className="parkease-card rounded-2xl p-12 text-center text-slate-600 dark:text-slate-300 flex flex-col items-center gap-3 border-rose-200 dark:border-rose-900/40">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl">
            <FaExclamationTriangle />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">Unable to load bookings ledger</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
          <button
            onClick={fetchBookings}
            className="mt-2 px-4 py-2 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800/60 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <FaSyncAlt size={12} /> Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="parkease-card rounded-2xl p-12 text-center text-slate-400 text-xs">
          No bookings matching the current criteria.
        </div>
      ) : (
        <div className="parkease-card rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-850/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
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
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-primary-600 dark:text-primary-400">
                      #{b.id}
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white">{b.userName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{b.userEmail}</p>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white">{b.parkingName}</p>
                      <span className="text-[10px] text-primary-600 dark:text-primary-400 font-bold">Slot: {b.slotCode}</span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                        {b.vehicleType === "BIKE" ? <FaMotorcycle className="text-amber-500" /> : <FaCar className="text-blue-500" />}
                        <span>{b.vehicleNumber}</span>
                      </div>
                    </td>

                    <td className="p-4 text-[11px] text-slate-500 dark:text-slate-400">
                      <p>{fmtTime(b.startTime)}</p>
                      <p className="text-slate-400 dark:text-slate-500">to {fmtTime(b.endTime)}</p>
                    </td>

                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {fmtMoney(b.amount)}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          b.status === "ACTIVE"
                            ? "bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 border-primary-200 dark:border-primary-800/60 animate-pulse"
                            : b.status === "COMPLETED"
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                            : b.status === "CANCELLED"
                            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60"
                            : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 dark:hover:bg-primary-900/40 text-primary-600 dark:text-primary-400 font-bold transition-all cursor-pointer"
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Booking #{selectedBooking.id} Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Customer</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedBooking.userName} ({selectedBooking.userEmail})</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Parking Location</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedBooking.parkingName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Parking Slot</span>
                <span className="font-bold text-primary-600 dark:text-primary-400">{selectedBooking.slotCode} ({selectedBooking.vehicleType})</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Vehicle Number</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">{selectedBooking.vehicleNumber}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Start Time</span>
                <span className="font-bold text-slate-900 dark:text-white">{fmtTime(selectedBooking.startTime)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">End Time</span>
                <span className="font-bold text-slate-900 dark:text-white">{fmtTime(selectedBooking.endTime)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Total Amount</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{fmtMoney(selectedBooking.amount)}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">Status</span>
                <span className="font-bold text-primary-600 dark:text-primary-400">{selectedBooking.status}</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-colors cursor-pointer"
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
