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
        // Load bookings — scoped to parking if parkingId present
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

  // Unique slot codes for filter dropdown
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

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED": return "bg-neon-green/10 text-neon-green border-neon-green/20";
      case "ACTIVE":    return "bg-neon-blue/10 text-neon-blue border-neon-blue/20 animate-pulse";
      case "PENDING":   return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "CANCELLED": return "bg-neon-red/10 text-neon-red border-neon-red/20";
      default:          return "bg-gray-500/10 text-gray-400";
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
      <ToastContainer theme="dark" position="top-right" autoClose={3000}
        style={{ zIndex: 9999, top: "5rem", right: "1rem" }} />

      <DashboardLayout role="OWNER">
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
          <div className="flex items-center gap-4">
            {parkingId && (
              <button
                onClick={() => navigate("/owner/dashboard")}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-all"
              >
                <FaArrowLeft />
              </button>
            )}
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {parking ? `${parking.name} — Bookings` : "Booking Management"}
              </h2>
              <p className="text-gray-400">Track and manage all customer reservations</p>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user, vehicle, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-dark-card border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white outline-none focus:border-neon-purple w-64"
              />
            </div>

            {/* Slot filter */}
            {slotIds.length > 0 && (
              <select
                value={slotFilter}
                onChange={(e) => setSlotFilter(e.target.value)}
                className="bg-dark-card border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-neon-blue"
              >
                <option value="ALL">All Slots</option>
                {slotIds.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}

            {/* Status filter */}
            <div className="bg-dark-card border border-white/10 rounded-lg p-1 flex">
              {["ALL", "ACTIVE", "PENDING", "COMPLETED", "CANCELLED"].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    filter === f
                      ? "bg-neon-purple text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
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
          <div className="flex items-center justify-center py-20">
            <FaSpinner className="text-neon-blue text-4xl animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filtered.map((booking) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-dark-card/60 backdrop-blur-xl border border-white/5 rounded-xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors"
                >
                  {/* Status bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    booking.status === "ACTIVE"    ? "bg-neon-blue"  :
                    booking.status === "COMPLETED" ? "bg-neon-green" :
                    booking.status === "PENDING"   ? "bg-yellow-400" :
                    "bg-neon-red"
                  }`} />

                  <div className="flex flex-col md:flex-row justify-between items-center gap-6 pl-4">

                    {/* Left: User & Vehicle */}
                    <div className="flex items-center gap-4 w-full md:w-1/3">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-xl text-gray-400 border border-white/5">
                        <FaUser />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white flex items-center gap-2">
                          {booking.userName || "User"}
                          <span className="text-xs font-mono text-gray-500 bg-black/30 px-2 py-0.5 rounded border border-white/5">
                            #{booking.id}
                          </span>
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                          <span className="flex items-center gap-1">
                            <FaCar className="text-neon-purple" /> {booking.vehicleNumber}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-gray-600" />
                          <span className="text-gray-500">{booking.vehicleType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Time & Slot */}
                    <div className="w-full md:w-1/3 border-l border-white/5 pl-6">
                      <p className="text-white font-bold flex items-center gap-2">
                        <FaClock className="text-neon-blue" />
                        {fmtTime(booking.startTime)}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        → {fmtTime(booking.endTime)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">
                        {booking.parkingName} · Slot {booking.slotCode}
                      </p>
                    </div>

                    {/* Right: Amount & Actions */}
                    <div className="w-full md:w-1/3 flex items-center justify-between md:justify-end gap-6 border-l border-white/5 pl-6">
                      <div className="text-right">
                        <p className="text-xl font-bold text-neon-green">
                          {booking.amount != null ? `₹${booking.amount}` : "—"}
                        </p>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(booking.status)} uppercase tracking-wider`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {booking.status === "ACTIVE" && (
                          <button
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancelling === booking.id}
                            className="p-2 rounded-lg bg-neon-red/10 text-neon-red hover:bg-neon-red hover:text-white border border-neon-red/20 transition-all disabled:opacity-50"
                            title="Cancel Booking"
                          >
                            {cancelling === booking.id
                              ? <FaSpinner className="animate-spin" />
                              : <FaTimesCircle />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="text-center py-20 bg-dark-card/30 rounded-xl border border-white/5 border-dashed">
                <p className="text-gray-500 text-lg">No bookings found matching your filters.</p>
              </div>
            )}
          </div>
        )}
      </DashboardLayout>
    </>
  );
}