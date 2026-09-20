import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { FaSearch, FaClock, FaCar, FaUser, FaTimesCircle, FaArrowLeft, FaSpinner } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { ownerBookingsAPI, ownerParkingsAPI } from "../../api/api";

export default function OwnerBookings() {
  const { parkingId } = useParams();
  const navigate      = useNavigate();

  const [filter,     setFilter]     = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [slotFilter, setSlotFilter] = useState("ALL");
  const [parking,    setParking]    = useState(null);
  const [bookings,   setBookings]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [bookData, parkData] = await Promise.all([
          parkingId
            ? ownerBookingsAPI.getByParking(parkingId)
            : ownerBookingsAPI.getAll(),
          parkingId
            ? ownerParkingsAPI.getById(parkingId)
            : Promise.resolve(null),
        ]);
        setBookings(bookData || []);
        setParking(parkData);
      } catch (err) {
        toast.error("Failed to load bookings: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [parkingId]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;
    setCancelling(bookingId);
    try {
      await ownerBookingsAPI.cancel(bookingId);
      toast.success("Booking cancelled.");
      setBookings(prev =>
        prev.map(b => b.id === bookingId ? { ...b, status: "CANCELLED" } : b)
      );
    } catch (err) {
      toast.error(err.message || "Failed to cancel booking.");
    } finally {
      setCancelling(null);
    }
  };

  const slotIds = [...new Set(bookings.map(b => b.slotCode).filter(Boolean))];

  const filtered = bookings.filter(b => {
    const matchStatus = filter === "ALL" || b.status === filter;
    const matchSlot   = slotFilter === "ALL" || b.slotCode === slotFilter;
    const term        = searchTerm.toLowerCase();
    const matchSearch = !term ||
      (b.userName       || "").toLowerCase().includes(term) ||
      (b.vehicleNumber  || "").toLowerCase().includes(term) ||
      String(b.id).includes(term);
    return matchStatus && matchSlot && matchSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED": return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60";
      case "ACTIVE":    return "bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 border-primary-200 dark:border-primary-800/60";
      case "PENDING":   return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60";
      case "CANCELLED": return "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60";
      default:          return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
    }
  };

  const fmtTime = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000}
        style={{ zIndex: 9999, top: "5rem", right: "1rem" }} />

      <DashboardLayout role="OWNER">
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div className="flex items-center gap-4">
            {parkingId && (
              <button
                onClick={() => navigate("/owner/dashboard")}
                className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-sm"
              >
                <FaArrowLeft />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {parking ? `${parking.name} Reservations` : "Booking Management"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Track and manage customer parking sessions and vehicle ingress</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search user, vehicle, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-primary-500 w-56 shadow-sm"
              />
            </div>

            {/* Slot filter */}
            {slotIds.length > 0 && (
              <select
                value={slotFilter}
                onChange={(e) => setSlotFilter(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 text-xs font-semibold outline-none focus:border-primary-500 shadow-sm"
              >
                <option value="ALL">All Slots</option>
                {slotIds.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}

            {/* Status filter */}
            <div className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl p-1 flex gap-1 shadow-sm">
              {["ALL", "ACTIVE", "PENDING", "COMPLETED", "CANCELLED"].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filter === f
                      ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-white font-bold shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content ────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <FaSpinner className="text-primary-600 text-3xl animate-spin" />
          </div>
        ) : (
          <div className="space-y-3.5">
            <AnimatePresence>
              {filtered.map((booking) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="parkease-card rounded-2xl p-5 relative overflow-hidden shadow-sm transition-all"
                >
                  {/* Status indicator bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    booking.status === "ACTIVE"    ? "bg-primary-600"  :
                    booking.status === "COMPLETED" ? "bg-emerald-500" :
                    booking.status === "PENDING"   ? "bg-amber-500" :
                    "bg-rose-500"
                  }`} />

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 pl-2">

                    {/* Left: User & Vehicle */}
                    <div className="flex items-center gap-3.5 w-full md:w-1/3">
                      <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center text-base font-bold shrink-0">
                        <FaUser />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {booking.userName || "Customer"}
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            #{booking.id}
                          </span>
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1 font-mono font-medium text-slate-700 dark:text-slate-300">
                            <FaCar className="text-primary-600 dark:text-primary-400" size={11} /> {booking.vehicleNumber || "—"}
                          </span>
                          <span>•</span>
                          <span className="text-slate-500">{booking.vehicleType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Time & Slot */}
                    <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-5">
                      <p className="text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5">
                        <FaClock className="text-primary-600 dark:text-primary-400" size={11} />
                        {fmtTime(booking.startTime)}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-medium">
                        Expires: {fmtTime(booking.endTime)}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        {booking.parkingName} · <span className="font-mono font-bold text-primary-600 dark:text-primary-400">Slot {booking.slotCode}</span>
                      </p>
                    </div>

                    {/* Right: Amount & Actions */}
                    <div className="w-full md:w-1/3 flex items-center justify-between md:justify-end gap-5 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-5">
                      <div className="text-left md:text-right">
                        <p className="text-base font-bold text-slate-900 dark:text-white">
                          {booking.amount != null ? `₹${booking.amount}` : "—"}
                        </p>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(booking.status)} uppercase tracking-wider inline-block mt-0.5`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {booking.status === "ACTIVE" && (
                          <button
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancelling === booking.id}
                            className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-800/60 transition-all disabled:opacity-50"
                            title="Cancel Booking"
                          >
                            {cancelling === booking.id
                              ? <FaSpinner className="animate-spin" size={12} />
                              : <FaTimesCircle size={12} />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="text-center py-20 parkease-card rounded-2xl border-dashed border-2 border-slate-200 dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400 text-sm">No reservations matching your filter parameters.</p>
              </div>
            )}
          </div>
        )}
      </DashboardLayout>
    </>
  );
}