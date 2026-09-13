import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaRupeeSign, FaExclamationTriangle, FaParking,
  FaSkullCrossbones, FaArrowLeft, FaBan, FaCheckCircle, FaClock,
} from "react-icons/fa";
import { paymentsAPI } from "../../api/api";

export default function FinalBillPage() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const {
    booking         = {},
    baseAmount      = 0,
    penaltyAmount   = 0,
    paymentId,                       // already-initiated penalty paymentId from ActiveParking
    overtimeDisplay = { h: 0, m: 0, s: 0 },
  } = location.state || {};

  // Payable = only the penalty (base was already paid at booking time)
  const totalPayable = penaltyAmount;

  const [showModal, setShowModal] = useState(false);
  const [loading,   setLoading]   = useState(false);

  // ── Pay Now → navigate to PaymentPage with all context ───────────────────
  const handlePayNow = () => {
    navigate("/user/payment", {
      state: {
        intent:       "final",
        paymentId,                    // pass existing paymentId so confirm works
        bookingId:    booking.bookingId,
        slotId:       booking.slotId || "—",
        parkingName:  booking.parkingName || "Parking",
        ratePerHour:  booking.ratePerHour || 0,
        duration:     booking.duration || 0,
        baseAmount,
        penaltyAmount,
        totalAmount:  totalPayable,
        vehicleNumber: booking.vehicleNumber,
      },
    });
  };

  // ── Pay Later → call backend /pay-later, flag account ────────────────────
  const confirmPayLater = async () => {
    setLoading(true);
    try {
      // Tell backend to release slot and flag account
      if (booking.bookingId) {
        await paymentsAPI.penaltyPayLater(booking.bookingId);
      }
    } catch {
      // If backend call fails, handle locally anyway
    }

    // Add warning to localStorage
    const warnings = JSON.parse(localStorage.getItem("parkease_warnings") || "[]");
    warnings.push({
      id:          Date.now(),
      bookingId:   booking.bookingId,
      amount:      penaltyAmount,
      parkingName: booking.parkingName,
      slotId:      booking.slotId,
      date:        new Date().toISOString(),
      status:      "UNPAID",
    });
    localStorage.setItem("parkease_warnings", JSON.stringify(warnings));
    localStorage.setItem("parkease_account_status", "PAYMENT_PENDING");
    localStorage.setItem("parkease_outstanding", String(penaltyAmount));
    localStorage.removeItem("parkease_active_booking");

    if (warnings.length >= 5) {
      localStorage.setItem("parkease_account_status", "SUSPENDED");
      toast.error("5 warnings reached. Account suspended until dues are cleared.");
    } else {
      toast.warn(`Warning ${warnings.length}/5 added. Pay your dues soon to keep booking.`);
    }

    setLoading(false);
    setShowModal(false);
    setTimeout(() => navigate("/user/payments"), 1200);
  };

  return (
    <>
      <ToastContainer theme="dark" position="top-right" autoClose={3000} style={{ zIndex: 9999, top: "5rem", right: "1rem" }} />
      <DashboardLayout role="USER">
        <div className="max-w-xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate(-1)} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-all">
              <FaArrowLeft />
            </button>
            <div>
              <h2 className="text-3xl font-bold text-white">Final Bill</h2>
              <p className="text-gray-400 text-sm">Session ended with overtime charges</p>
            </div>
          </div>

          {/* Overtime Alert */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-5 bg-neon-red/10 border border-neon-red/40 rounded-2xl flex items-center gap-4"
          >
            <FaSkullCrossbones className="text-neon-red text-3xl shrink-0 animate-pulse" />
            <div>
              <p className="text-neon-red font-black uppercase tracking-wide text-sm mb-0.5">Overtime Penalty Applied</p>
              <p className="text-gray-400 text-xs">
                You exceeded your booking by&nbsp;
                <span className="text-white font-bold">
                  {String(overtimeDisplay.h).padStart(2,"0")}:{String(overtimeDisplay.m).padStart(2,"0")}:{String(overtimeDisplay.s).padStart(2,"0")}
                </span>
              </p>
            </div>
          </motion.div>

          {/* Bill Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0f1629] border border-white/10 rounded-2xl overflow-hidden mb-6"
          >
            <div className="h-1 w-full bg-gradient-to-r from-neon-red to-orange-500" />
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-5">Bill Summary</h3>

              <div className="space-y-4">
                <BillRow label="Parking" value={booking.parkingName || "—"} icon={<FaParking className="text-neon-blue" />} />
                <BillRow label="Slot"
                  value={<span className="font-mono text-neon-purple font-bold">#{booking.slotId || "—"}</span>}
                  icon={<span className="text-neon-purple">#</span>} />
                {booking.vehicleNumber && (
                  <BillRow label="Vehicle" value={booking.vehicleNumber} icon={<span className="text-gray-400">🚗</span>} />
                )}
                <BillRow label="Duration" value={`${booking.duration || "?"}h`} icon={<FaClock className="text-yellow-400" />} />

                <div className="border-t border-white/10 pt-4 space-y-3">
                  <BillRow
                    label="Base Parking Fare"
                    value={<span className="text-neon-green font-black">₹{baseAmount}</span>}
                    icon={<FaCheckCircle className="text-neon-green" />}
                    sub="Already paid at booking"
                  />
                  <BillRow
                    label="Overtime Penalty"
                    value={<span className="text-neon-red font-black">₹{penaltyAmount}</span>}
                    icon={<FaExclamationTriangle className="text-neon-red" />}
                    sub="₹10 per 15 min overtime"
                  />
                </div>

                <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                  <span className="text-gray-300 font-bold">Amount Due Now</span>
                  <span className="text-4xl font-black text-neon-red">₹{totalPayable}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
            >
              <FaBan className="text-yellow-400" /> Pay Later
            </button>
            <button
              onClick={handlePayNow}
              className="flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-neon-red to-orange-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:shadow-[0_0_30px_rgba(239,68,68,0.7)] transition-all"
            >
              <FaRupeeSign /> Pay ₹{totalPayable} Now
            </button>
          </div>

          <p className="text-center text-gray-600 text-xs mt-4">
            "Pay Later" releases your slot but adds a warning to your account.
            5 warnings = account suspension.
          </p>
        </div>

        {/* ── Pay Later Confirmation Modal ──────────────────────────── */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#0f1629] border border-yellow-500/30 rounded-2xl p-8 w-full max-w-sm"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-500/50 flex items-center justify-center mx-auto mb-4">
                    <FaExclamationTriangle className="text-yellow-400 text-2xl" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">Defer Payment?</h3>
                  <p className="text-gray-400 text-sm">
                    Your slot will be released immediately.<br />
                    A warning will be added to your account.<br />
                    You won't be able to book until dues are cleared.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowModal(false)} disabled={loading}
                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 transition-all disabled:opacity-50">
                    Cancel
                  </button>
                  <button onClick={confirmPayLater} disabled={loading}
                    className="flex-1 py-3 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-bold border border-yellow-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <><div className="w-4 h-4 border-2 border-yellow-400/40 border-t-yellow-400 rounded-full animate-spin" /> Deferring...</> : "Yes, Pay Later"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </DashboardLayout>
    </>
  );
}

function BillRow({ label, value, icon, sub }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm">{icon}</span>
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          {sub && <p className="text-gray-600 text-xs">{sub}</p>}
        </div>
      </div>
      <span className="text-white font-semibold text-sm">{value}</span>
    </div>
  );
}