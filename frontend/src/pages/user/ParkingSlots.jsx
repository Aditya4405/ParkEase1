import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { FaCar, FaLock, FaBan, FaMotorcycle, FaTruck, FaSpinner, FaTimes, FaClock, FaRupeeSign } from "react-icons/fa";
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#0f1629] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden"
      >
        <div className="h-1 w-full bg-gradient-to-r from-neon-blue to-neon-purple" />
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Book Slot</h3>
              <p className="text-gray-400 text-sm mt-0.5">{parkingName}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <FaTimes />
            </button>
          </div>

          {/* Slot Info */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-white/5 rounded-xl border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-neon-green/20 border border-neon-green/40 flex items-center justify-center text-neon-green text-xl">
              <VehicleIcon type={slot.vehicleType} />
            </div>
            <div className="flex-1">
              <p className="text-white font-black font-mono text-lg">{slot.slotCode}</p>
              <p className="text-gray-400 text-xs">{slot.vehicleTypeLabel || slot.vehicleType}</p>
            </div>
            <div className="text-right">
              <p className="text-neon-green font-black text-lg">₹{slot.costPerHour}</p>
              <p className="text-gray-500 text-xs">/hour</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Vehicle Number */}
            <div>
              <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1.5">Vehicle Number *</label>
              <input
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                placeholder="e.g. MH12 AB 1234"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-neon-blue focus:outline-none transition-all font-mono tracking-wider"
              />
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1.5">
                  <FaClock className="inline mr-1" /> Start Time
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white focus:border-neon-blue focus:outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1.5">
                  <FaClock className="inline mr-1" /> End Time
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white focus:border-neon-blue focus:outline-none transition-all text-sm"
                />
              </div>
            </div>

            {/* Amount Preview */}
            {duration > 0 && (
              <div className="p-4 bg-neon-green/5 border border-neon-green/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <FaRupeeSign className="text-neon-green" />
                  {duration}h × ₹{slot.costPerHour}/hr
                </div>
                <p className="text-neon-green font-black text-xl">₹{amount}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 transition-all">
              Cancel
            </button>
            <button
              onClick={handleInitiate}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
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
      if (slot.status === "OCCUPIED")    return "bg-neon-red/10  border-neon-red/40  text-neon-red  cursor-not-allowed opacity-70";
      if (slot.status === "RESERVED")   return "bg-yellow-500/10 border-yellow-500/40 text-yellow-500 cursor-not-allowed opacity-70";
      if (slot.status === "MAINTENANCE")return "bg-gray-700/50   border-gray-600      text-gray-400  cursor-not-allowed opacity-50";
      return "bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed opacity-50";
    }
    return "bg-neon-green/10 border-neon-green/50 text-neon-green hover:bg-neon-green/25 hover:shadow-[0_0_18px_rgba(34,197,94,0.4)] cursor-pointer";
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
            <div className="mb-6 flex items-center gap-4 p-4 bg-neon-red/10 border border-neon-red/30 rounded-2xl">
              <FaBan className="text-neon-red text-xl shrink-0" />
              <div className="flex-1">
                <p className="text-neon-red font-black text-sm">
                  {accountStatus === "SUSPENDED" ? "Account Suspended" : "Bookings Blocked — Payment Pending"}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">Clear ₹{outstanding} outstanding dues to unlock new bookings.</p>
              </div>
              <button onClick={() => navigate("/user/payments")} className="px-4 py-2 bg-neon-red text-white rounded-xl font-bold text-sm hover:bg-red-500 transition-all whitespace-nowrap">
                Pay ₹{outstanding}
              </button>
            </div>
          )}

          {/* Header */}
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white">
                {loading ? "Loading..." : (parking?.name || "Parking Slots")}
              </h2>
              {parking && (
                <p className="text-gray-400 text-sm mt-1">{parking.location}</p>
              )}
              {!loading && (
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-neon-green font-bold">{available} Available</span>
                  <span className="text-gray-500">·</span>
                  <span className="text-neon-red font-bold">{occupied} Occupied</span>
                  <span className="text-gray-500">·</span>
                  <span className="text-gray-400">{slots.length} Total</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Vehicle type filter */}
              <div className="flex gap-1 bg-dark-card border border-white/10 rounded-lg p-1">
                {vehicleTypes.map(t => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      typeFilter === t ? "bg-neon-blue text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="flex gap-3 bg-dark-card/50 p-3 rounded-lg border border-white/5 text-xs text-gray-300">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-neon-green shadow-[0_0_5px_rgba(34,197,94,0.8)]" /> Free</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Reserved</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-neon-red" /> Occupied</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-600" /> Maintenance</span>
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