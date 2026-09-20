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
      if (booking.bookingId) {
        await paymentsAPI.penaltyPayLater(booking.bookingId);
      }
    } catch {
      // If backend call fails, handle locally anyway
    }

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
      <ToastContainer position="top-right" autoClose={3000} style={{ zIndex: 9999, top: "5rem", right: "1rem" }} />
      <DashboardLayout role="USER">
        <div className="max-w-xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate(-1)} className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
              <FaArrowLeft />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Final Settlement</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Session ended with overtime charges</p>
            </div>
          </div>

          {/* Overtime Alert */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl flex items-center gap-4 shadow-sm"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 flex items-center justify-center shrink-0">
              <FaSkullCrossbones className="text-2xl" />
            </div>
            <div>
              <p className="text-rose-700 dark:text-rose-300 font-bold uppercase tracking-wider text-xs mb-0.5">Overtime Penalty Applied</p>
              <p className="text-slate-600 dark:text-slate-300 text-xs">
                You exceeded your booked reservation period by{" "}
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {String(overtimeDisplay.h).padStart(2,"0")}:{String(overtimeDisplay.m).padStart(2,"0")}:{String(overtimeDisplay.s).padStart(2,"0")}
                </span>
              </p>
            </div>
          </motion.div>

          {/* Bill Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="parkease-card rounded-2xl overflow-hidden mb-6 shadow-sm"
          >
            <div className="p-6 sm:p-7">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
                Fare Breakdown & Summary
              </h3>

              <div className="space-y-4">
                <BillRow label="Parking Facility" value={booking.parkingName || "—"} icon={<FaParking className="text-primary-600 dark:text-primary-400" />} />
                <BillRow label="Allocated Slot"
                  value={<span className="font-mono text-primary-600 dark:text-primary-400 font-bold">#{booking.slotId || "—"}</span>}
                  icon={<span className="text-primary-600 font-mono font-bold">#</span>} />
                {booking.vehicleNumber && (
                  <BillRow label="Vehicle Plate" value={booking.vehicleNumber} icon={<span className="text-slate-400">🚗</span>} />
                )}
                <BillRow label="Base Duration" value={`${booking.duration || "?"}h`} icon={<FaClock className="text-amber-500" />} />

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                  <BillRow
                    label="Base Parking Fare"
                    value={<span className="text-emerald-600 dark:text-emerald-400 font-bold">₹{baseAmount}</span>}
                    icon={<FaCheckCircle className="text-emerald-500" />}
                    sub="Settled at initial booking"
                  />
                  <BillRow
                    label="Overtime Penalty Charge"
                    value={<span className="text-rose-600 dark:text-rose-400 font-bold">₹{penaltyAmount}</span>}
                    icon={<FaExclamationTriangle className="text-rose-500" />}
                    sub="₹10 per 15 min overtime rate"
                  />
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-5 flex items-center justify-between">
                  <span className="text-slate-900 dark:text-white font-bold text-base">Net Payable Now</span>
                  <span className="text-3xl font-black text-rose-600 dark:text-rose-400">₹{totalPayable}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-sm"
            >
              <FaBan className="text-amber-500" /> Pay Later
            </button>
            <button
              onClick={handlePayNow}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all"
            >
              <FaRupeeSign /> Pay ₹{totalPayable} Securely
            </button>
          </div>

          <p className="text-center text-slate-500 dark:text-slate-400 text-xs mt-4">
            "Pay Later" immediately releases your vehicle slot, but registers an outstanding warning on your account.
          </p>
        </div>

        {/* ── Pay Later Confirmation Modal ──────────────────────────── */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 w-full max-w-sm shadow-2xl"
              >
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center mx-auto mb-4">
                    <FaExclamationTriangle className="text-2xl" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Defer Penalty Settlement?</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                    Your parking slot will be freed. A warning will be attached to your account profile, and new bookings will be paused until dues are cleared.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowModal(false)} disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700 transition-all text-xs">
                    Cancel
                  </button>
                  <button onClick={confirmPayLater} disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-all text-xs flex items-center justify-center gap-1.5 shadow-sm">
                    {loading ? "Processing..." : "Yes, Pay Later"}
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
      <div className="flex items-center gap-2.5">
        <span className="text-sm">{icon}</span>
        <div>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{label}</p>
          {sub && <p className="text-slate-400 dark:text-slate-500 text-xs">{sub}</p>}
        </div>
      </div>
      <span className="text-slate-900 dark:text-white font-semibold text-sm">{value}</span>
    </div>
  );
}