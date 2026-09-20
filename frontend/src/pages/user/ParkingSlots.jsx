import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { FaCar, FaBan, FaMotorcycle, FaTruck, FaSpinner, FaTimes, FaClock, FaRupeeSign } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { parkingsAPI, paymentsAPI } from "../../api/api";

// ── Vehicle type icons ────────────────────────────────────────────────────────
function VehicleIcon({ type }) {
  if (type === "BIKE")  return <FaMotorcycle />;
  if (type === "LARGE") return <FaTruck />;
  return <FaCar />;
}

// ── Booking Summary Modal ─────────────────────────────────────────────────────
function BookingModal({ slot, parkingId, parkingName, onClose, onSuccess }) {
  const navigate = useNavigate();
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [startTime,     setStartTime]     = useState("");
  const [endTime,       setEndTime]       = useState("");
  const [loading,       setLoading]       = useState(false);

  // Default start = now, end = 1hr from now
  useEffect(() => {
    const now  = new Date();
    const end  = new Date(now.getTime() + 60 * 60 * 1000);
    // ✅ FIX: Use local time, NOT toISOString() which returns UTC
    // toISOString() on an IST machine returns UTC (5h30m behind),
    // causing the backend to store wrong time and session to appear expired immediately.
    const fmtLocal = (d) => {
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    setStartTime(fmtLocal(now));
    setEndTime(fmtLocal(end));
  }, []);

  const duration = startTime && endTime
    ? Math.max(0, (new Date(endTime) - new Date(startTime)) / 3600000).toFixed(1)
    : 0;
  const amount = (duration * (slot.costPerHour || 0)).toFixed(2);

  const handleInitiate = async () => {
    if (!vehicleNumber.trim()) { toast.error("Enter your vehicle number"); return; }
    if (!startTime || !endTime) { toast.error("Select start and end time"); return; }
    if (new Date(endTime) <= new Date(startTime)) { toast.error("End time must be after start time"); return; }

    setLoading(true);
    try {
      const res = await paymentsAPI.initiate({
        slotId:        slot.id,
        parkingId,
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        // ✅ FIX: startTime/endTime values from datetime-local input are already
        // in local time format "YYYY-MM-DDTHH:MM". Just append seconds — no UTC conversion.
        startTime:     startTime + ":00",
        endTime:       endTime   + ":00",
        paymentType:   "BOOKING",
      });

      // Navigate to payment page with paymentId + booking snapshot
      navigate("/user/payment", {
        state: {
          intent:        "book",
          paymentId:     res.paymentId,
          bookingId:     res.bookingId,
          slotId:        res.slotCode || slot.slotCode,
          slotDbId:      slot.id,
          parkingName,
          duration:      parseFloat(duration),
          ratePerHour:   slot.costPerHour,
          totalAmount:   parseFloat(amount),
          vehicleNumber: vehicleNumber.trim().toUpperCase(),
          startTime:     res.startTime,
          endTime:       res.endTime,
        },
      });
    } catch (err) {
      toast.error(err.message || "Failed to initiate booking");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-[#131C31] border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transition-colors duration-200"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">Book Parking Slot</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{parkingName}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer">
              <FaTimes />
            </button>
          </div>

          {/* Slot Info */}
          <div className="flex items-center gap-4 mb-5 p-4 bg-[#EEF2FF] dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 text-[#5B4DF5] dark:text-indigo-400 flex items-center justify-center text-xl shadow-sm">
              <VehicleIcon type={slot.vehicleType} />
            </div>
            <div className="flex-1">
              <p className="text-slate-900 dark:text-white font-black font-mono text-base">{slot.slotCode}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">{slot.vehicleTypeLabel || slot.vehicleType}</p>
            </div>
            <div className="text-right">
              <p className="text-[#5B4DF5] font-extrabold text-lg font-heading">₹{slot.costPerHour}</p>
              <p className="text-slate-500 text-xs">/hour</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Vehicle Number */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5">Vehicle Number *</label>
              <input
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                placeholder="e.g. MH12 AB 1234"
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#5B4DF5] focus:ring-2 focus:ring-[#5B4DF5]/15 focus:outline-none transition-all font-mono tracking-wider text-sm font-semibold"
              />
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5">
                  <FaClock className="inline mr-1" /> Start Time
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:border-[#5B4DF5] focus:ring-2 focus:ring-[#5B4DF5]/15 focus:outline-none transition-all text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5">
                  <FaClock className="inline mr-1" /> End Time
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:border-[#5B4DF5] focus:ring-2 focus:ring-[#5B4DF5]/15 focus:outline-none transition-all text-xs font-medium"
                />
              </div>
            </div>

            {/* Amount Preview */}
            {duration > 0 && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-xs font-medium">
                  <FaRupeeSign className="text-emerald-600" />
                  {duration}h × ₹{slot.costPerHour}/hr
                </div>
                <p className="text-emerald-700 dark:text-emerald-300 font-extrabold text-base font-heading">₹{amount}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all cursor-pointer">
              Cancel
            </button>
            <button
              onClick={handleInitiate}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-[#5B4DF5] hover:bg-[#4F41E5] text-white font-bold text-xs shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <><FaSpinner className="animate-spin" /> Processing...</> : "Proceed to Pay"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ParkingSlots() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { parkingId } = useParams();

  const [parking,      setParking]      = useState(null);
  const [slots,        setSlots]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [typeFilter,   setTypeFilter]   = useState("ALL");

  // Account block
  const [accountStatus, setAccountStatus] = useState("ACTIVE");
  const [outstanding,   setOutstanding]   = useState(0);
  const isBlocked = accountStatus === "PAYMENT_PENDING" || accountStatus === "SUSPENDED";

  useEffect(() => {
    const status = localStorage.getItem("parkease_account_status") || "ACTIVE";
    const owed   = Number(localStorage.getItem("parkease_outstanding") || 0);
    setAccountStatus(status);
    setOutstanding(owed);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await parkingsAPI.getById(parkingId);
        setParking(data);
        setSlots(data.slots || []);
      } catch (err) {
        toast.error("Failed to load slots: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [parkingId]);

  // Handle auto-opening a slot modal if navigated from Chatbot
  useEffect(() => {
    if (slots.length > 0 && location.state?.autoOpenSlotId) {
      const slot = slots.find(s => s.id === location.state.autoOpenSlotId);
      if (slot && slot.bookable && !isBlocked) {
        setSelectedSlot(slot);
      }
      // Clean up the URL state so it doesn't re-trigger on refresh
      window.history.replaceState({}, document.title);
    }
  }, [slots, location.state, isBlocked]);

  const vehicleTypes = ["ALL", ...new Set((slots).map(s => s.vehicleType).filter(Boolean))];
  const filteredSlots = typeFilter === "ALL" ? slots : slots.filter(s => s.vehicleType === typeFilter);

  const getSlotStyles = (slot) => {
    if (isBlocked || !slot.bookable) {
      if (slot.status === "OCCUPIED")    return "bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed";
      if (slot.status === "RESERVED")   return "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400 cursor-not-allowed";
      if (slot.status === "MAINTENANCE")return "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed opacity-60";
      return "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed";
    }
    return "bg-white dark:bg-[#131C31] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:border-[#5B4DF5] hover:text-[#5B4DF5] hover:bg-[#EEF2FF]/40 dark:hover:bg-indigo-950/40 shadow-sm cursor-pointer";
  };

  const handleSlotClick = (slot) => {
    if (isBlocked) { toast.error("Clear outstanding dues to make new bookings."); return; }
    if (!slot.bookable) { toast.info(`Slot is ${slot.status}`); return; }
    setSelectedSlot(slot);
  };

  const available = slots.filter(s => s.bookable).length;
  const occupied  = slots.filter(s => s.status === "OCCUPIED").length;

  return (
    <>
      <ToastContainer theme="dark" position="top-right" autoClose={3000} style={{ zIndex: 9999, top: "5rem", right: "1rem" }} />
      <DashboardLayout role="USER">
        <div className="flex flex-col h-full">

          {/* Account Block Banner */}
          {isBlocked && (
            <div className="mb-6 flex items-center gap-4 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl">
              <FaBan className="text-rose-600 dark:text-rose-400 text-xl shrink-0" />
              <div className="flex-1">
                <p className="text-rose-700 dark:text-rose-300 font-bold text-sm">
                  {accountStatus === "SUSPENDED" ? "Account Suspended" : "Bookings Blocked — Payment Pending"}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Clear ₹{outstanding} outstanding dues to unlock new bookings.</p>
              </div>
              <button onClick={() => navigate("/user/payments")} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs shadow-sm transition-all whitespace-nowrap cursor-pointer">
                Pay ₹{outstanding}
              </button>
            </div>
          )}

          {/* Header */}
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
                {loading ? "Loading..." : (parking?.name || "Parking Slots")}
              </h2>
              {parking && (
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{parking.location}</p>
              )}
              {!loading && (
                <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
                  <span className="text-emerald-600 dark:text-emerald-400">{available} Available</span>
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                  <span className="text-rose-600 dark:text-rose-400">{occupied} Occupied</span>
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                  <span className="text-slate-500 dark:text-slate-400">{slots.length} Total</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Vehicle type filter */}
              <div className="flex gap-1 bg-white dark:bg-[#131C31] border border-slate-200/80 dark:border-slate-800 rounded-xl p-1 shadow-sm">
                {vehicleTypes.map(t => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      typeFilter === t ? "bg-[#5B4DF5] text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="flex gap-3.5 bg-white dark:bg-[#131C31] p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#5B4DF5]" /> Free</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Reserved</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Occupied</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" /> Maintenance</span>
              </div>
            </div>
          </div>

          {/* Slot Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <FaSpinner className="text-neon-blue text-4xl animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 overflow-y-auto pb-20">
              {filteredSlots.map((s) => (
                <motion.div
                  key={s.id}
                  whileHover={s.bookable && !isBlocked ? { scale: 1.06, y: -3 } : {}}
                  onClick={() => handleSlotClick(s)}
                  className={`relative h-24 rounded-xl border-2 flex flex-col items-center justify-center font-bold transition-all ${getSlotStyles(s)}`}
                >
                  <div className="text-lg mb-0.5">
                    <VehicleIcon type={s.vehicleType} />
                  </div>
                  <span className="text-[11px] font-mono font-black">{s.slotCode}</span>
                  <div className="absolute bottom-1.5 text-[9px] uppercase tracking-wider opacity-70">
                    {s.bookable ? "FREE" : s.status}
                  </div>
                  {s.costPerHour && (
                    <div className="absolute top-1 right-1 text-[9px] opacity-60">₹{s.costPerHour}</div>
                  )}
                </motion.div>
              ))}

              {filteredSlots.length === 0 && !loading && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No slots found for this filter.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Booking Modal */}
        <AnimatePresence>
          {selectedSlot && (
            <BookingModal
              slot={selectedSlot}
              parkingId={Number(parkingId)}
              parkingName={parking?.name || "Parking"}
              onClose={() => setSelectedSlot(null)}
            />
          )}
        </AnimatePresence>
      </DashboardLayout>
    </>
  );
}