import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaCheckCircle, FaParking, FaClock, FaRupeeSign,
  FaLock, FaCalendarAlt, FaExclamationTriangle,
  FaPlus, FaStop, FaSkullCrossbones, FaSpinner,
} from "react-icons/fa";
import { paymentsAPI } from "../../api/api";

const PENALTY_PER_INTERVAL = 10;        // ₹10 per 15 min overtime
const PENALTY_INTERVAL_MS  = 15 * 60 * 1000;

function InfoTile({ icon, label, value }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700/60">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="text-primary-600 dark:text-primary-400 text-sm">{icon}</div>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
      </div>
      <div className="text-slate-900 dark:text-white font-bold text-base">{value}</div>
    </div>
  );
}

export default function ActiveParking() {
  const navigate = useNavigate();

  const [booking,      setBooking]      = useState(null);
  const [timeLeft,     setTimeLeft]     = useState(0);
  const [expired,      setExpired]      = useState(false);
  const [penaltyAmount,setPenaltyAmount]= useState(0);
  const [overtimeMs,   setOvertimeMs]   = useState(0);
  const [ending,       setEnding]       = useState(false);

  // Load active booking from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("parkease_active_booking");
    if (!stored) {
      toast.error("No active parking session found.");
      setTimeout(() => navigate("/user/dashboard"), 1500);
      return;
    }
    setBooking(JSON.parse(stored));
  }, [navigate]);

  // Live countdown timer
  useEffect(() => {
    if (!booking) return;
    const interval = setInterval(() => {
      const now     = Date.now();
      const endTs   = new Date(booking.endTime).getTime();
      const remaining = endTs - now;

      if (remaining > 0) {
        setTimeLeft(remaining);
        setExpired(false);
        setPenaltyAmount(0);
        setOvertimeMs(0);
      } else {
        setTimeLeft(0);
        setExpired(true);
        const overtime = Math.abs(remaining);
        setOvertimeMs(overtime);
        const intervals = Math.floor(overtime / PENALTY_INTERVAL_MS);
        setPenaltyAmount(intervals * PENALTY_PER_INTERVAL);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [booking]);

  if (!booking) {
    return (
      <DashboardLayout role="USER">
        <div className="flex items-center justify-center h-96">
          <FaSpinner className="text-primary-600 text-4xl animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  // ── Time formatting ───────────────────────────────────────────────────────
  const hours     = Math.floor(timeLeft  / 3600000);
  const mins      = Math.floor((timeLeft  % 3600000) / 60000);
  const secs      = Math.floor((timeLeft  % 60000)   / 1000);
  const oHours    = Math.floor(overtimeMs / 3600000);
  const oMins     = Math.floor((overtimeMs % 3600000) / 60000);
  const oSecs     = Math.floor((overtimeMs % 60000)   / 1000);

  const startTime = new Date(booking.startTime);
  const endTime   = new Date(booking.endTime);
  const fmt       = (d) => d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  const timerColor = expired
    ? "text-rose-600 dark:text-rose-400"
    : hours === 0 && mins < 15
      ? "text-amber-500 dark:text-amber-400"
      : "text-primary-600 dark:text-primary-400";

  const totalDurationMs = new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime();

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleExtend = () => {
    navigate("/user/payment", {
      state: {
        intent:      "extend",
        bookingId:   booking.bookingId,
        slotId:      booking.slotId,
        parkingName: booking.parkingName,
        ratePerHour: booking.ratePerHour || 50,
        duration:    booking.duration,
        vehicleNumber: booking.vehicleNumber,
        totalAmount: 0,
      },
    });
  };

  const handleEndParking = async () => {
    if (penaltyAmount > 0) {
      try {
        const penaltyRes = await paymentsAPI.penaltyInitiate({
          bookingId:   booking.bookingId,
          paymentType: "PENALTY",
        });

        navigate("/user/final-bill", {
          state: {
            booking,
            baseAmount:      booking.totalPaid,
            penaltyAmount:   penaltyRes.amount || penaltyAmount,
            paymentId:       penaltyRes.paymentId,
            overtimeDisplay: { h: oHours, m: oMins, s: oSecs },
          },
        });
      } catch (err) {
        navigate("/user/final-bill", {
          state: {
            booking,
            baseAmount:      booking.totalPaid,
            penaltyAmount,
            overtimeDisplay: { h: oHours, m: oMins, s: oSecs },
          },
        });
      }
      return;
    }

    setEnding(true);
    try {
      await paymentsAPI.endParking(booking.bookingId);

      const history = JSON.parse(localStorage.getItem("parkease_booking_history") || "[]");
      history.push({ ...booking, endedAt: new Date().toISOString(), status: "COMPLETED", finalAmount: booking.totalPaid });
      localStorage.setItem("parkease_booking_history", JSON.stringify(history));
      localStorage.removeItem("parkease_active_booking");

      toast.success("Parking ended successfully! No additional charges.");
      setTimeout(() => navigate("/user/dashboard"), 1500);
    } catch (err) {
      toast.error(err.message || "Failed to end parking.");
      setEnding(false);
    }
  };

  const slotBadge = expired
    ? { label: "OVERDUE", cls: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60" }
    : { label: "ACTIVE & LOCKED",  cls: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60" };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} style={{ zIndex: 9999, top: "5rem", right: "1rem" }} />
      <DashboardLayout role="USER">
        <div className="max-w-2xl mx-auto">

          {/* ── Booking Confirmed Banner ──────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 rounded-2xl p-6 mb-8 flex items-center gap-5 shadow-sm"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-sm">
              <FaCheckCircle className="text-2xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Active Parking Session</h1>
              <p className="text-emerald-800 dark:text-emerald-300/90 text-sm mt-0.5">
                Payment verified · Slot {booking.slotId} is reserved & locked for your vehicle
              </p>
              {booking.transactionId && (
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-mono">TXN: {booking.transactionId}</p>
              )}
            </div>
          </motion.div>

          {/* ── Overtime / Penalty Banner ──────────────────────────── */}
          <AnimatePresence>
            {expired && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-2xl p-5 flex items-center gap-4 shadow-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 flex items-center justify-center shrink-0">
                  <FaSkullCrossbones className="text-xl" />
                </div>
                <div className="flex-1">
                  <p className="text-rose-700 dark:text-rose-300 font-bold text-sm uppercase tracking-wide mb-0.5">
                    Parking Session Expired — Overtime Penalty Running
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 text-xs">
                    ₹{PENALTY_PER_INTERVAL} penalty per 15 minutes of overtime.
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-slate-700 dark:text-slate-300 text-sm font-mono font-medium">
                      Overtime: {String(oHours).padStart(2,"0")}:{String(oMins).padStart(2,"0")}:{String(oSecs).padStart(2,"0")}
                    </span>
                    <span className="px-2.5 py-0.5 bg-rose-100 dark:bg-rose-900/60 rounded-full text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-700/60">
                      Penalty: ₹{penaltyAmount}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Session Card ───────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="parkease-card rounded-2xl overflow-hidden mb-6 shadow-sm"
          >
            <div className="p-7">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Session Details</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time status and allocation</p>
                </div>
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${slotBadge.cls}`}>
                  <FaLock size={10} /> {slotBadge.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <InfoTile icon={<FaParking />} label="Parking Location" value={booking.parkingName} />
                <InfoTile icon={<span className="font-mono text-base font-bold">#</span>} label="Slot ID"
                  value={<span className="font-mono text-primary-600 dark:text-primary-400 font-bold">{booking.slotId}</span>} />
                <InfoTile icon={<FaCalendarAlt />} label="Start Time" value={fmt(startTime)} />
                <InfoTile icon={<FaClock />} label="Expiry Time" value={fmt(endTime)} />
                <InfoTile icon={<FaRupeeSign />} label="Base Amount Paid"
                  value={<span className="text-emerald-600 dark:text-emerald-400 font-bold">₹{booking.totalPaid}</span>} />
                <InfoTile icon={<FaClock />} label="Vehicle Number" value={booking.vehicleNumber || "—"} />
              </div>

              {/* ── Live Timer ─────────────────────────────────────── */}
              <div className={`rounded-xl p-6 text-center border transition-all ${
                expired 
                  ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40" 
                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/60"
              }`}>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  {expired ? "Session Expired" : "Time Remaining"}
                </p>
                <div className={`text-5xl font-black font-mono tracking-tight ${timerColor} transition-colors mb-3`}>
                  {String(hours).padStart(2,"0")}:{String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}
                </div>
                {!expired && (
                  <div className="max-w-md mx-auto h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full transition-colors ${hours === 0 && mins < 15 ? "bg-amber-500" : "bg-primary-600"}`}
                      style={{ width: `${Math.max(0, (timeLeft / totalDurationMs) * 100).toFixed(1)}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* ── Action Buttons ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            <button
              onClick={handleExtend}
              disabled={ending}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/70 shadow-sm transition-all disabled:opacity-50"
            >
              <FaPlus className="text-primary-600 dark:text-primary-400" /> Extend Parking
            </button>

            <button
              onClick={handleEndParking}
              disabled={ending}
              className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold transition-all shadow-sm ${
                expired
                  ? "bg-rose-600 text-white hover:bg-rose-700"
                  : "bg-rose-600 text-white hover:bg-rose-700"
              } disabled:opacity-50`}
            >
              {ending ? <><FaSpinner className="animate-spin" /> Ending Session...</> : <><FaStop /> {expired ? "End & Settle Overtime" : "End Parking Now"}</>}
            </button>
          </motion.div>

          {!expired && hours === 0 && mins < 15 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-4 text-center text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center justify-center gap-1.5">
              <FaExclamationTriangle size={12} />
              Session ending soon. Extend in advance to prevent overtime penalty charges.
            </motion.p>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}