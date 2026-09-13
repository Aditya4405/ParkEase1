import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaRupeeSign, FaClock, FaParking, FaCheckCircle,
  FaExclamationTriangle, FaBan, FaHistory, FaShieldAlt,
  FaSpinner, FaTimesCircle,
} from "react-icons/fa";
import { bookingsAPI, dashboardAPI } from "../../api/api";
import { toast, ToastContainer } from "react-toastify";

function StatusBadge({ status }) {
  const map = {
    SUCCESS: "bg-neon-green/20 text-neon-green border-neon-green/30",
    PAID:    "bg-neon-green/20 text-neon-green border-neon-green/30",
    ACTIVE:  "bg-neon-blue/20  text-neon-blue  border-neon-blue/30",
    PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    PAYMENT_PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    FAILED:  "bg-neon-red/20   text-neon-red   border-neon-red/30",
    SUSPENDED: "bg-neon-red/20 text-neon-red   border-neon-red/30",
    CANCELLED: "bg-neon-red/20 text-neon-red   border-neon-red/30",
    COMPLETED: "bg-neon-green/20 text-neon-green border-neon-green/30",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${map[status] || map.PENDING}`}>
      {status}
    </span>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-neon-blue">{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

export default function PaymentsDashboard() {
  const navigate = useNavigate();

  const [accountStatus, setAccountStatus] = useState("ACTIVE");
  const [outstanding,   setOutstanding]   = useState(0);
  const [warnings,      setWarnings]      = useState([]);
  const [bookings,      setBookings]      = useState([]);
  const [stats,         setStats]         = useState(null);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    // LocalStorage account state
    const status = localStorage.getItem("parkease_account_status") || "ACTIVE";
    const owed   = Number(localStorage.getItem("parkease_outstanding") || 0);
    const warns  = JSON.parse(localStorage.getItem("parkease_warnings") || "[]");
    setAccountStatus(status);
    setOutstanding(owed);
    setWarnings(warns);

    // Load from backend
    const load = async () => {
      setLoading(true);
      try {
        const [bookData, statsData] = await Promise.all([
          bookingsAPI.getAll(),
          dashboardAPI.getStats(),
        ]);
        setBookings(bookData || []);
        setStats(statsData);
      } catch (err) {
        toast.error("Failed to load payment data: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const isBlocked = accountStatus === "PAYMENT_PENDING" || accountStatus === "SUSPENDED";

  const clearDues = () => {
    navigate("/user/payment", {
      state: {
        intent: "final",
        slotId: "DUES",
        parkingName: "Outstanding Dues",
        totalAmount: outstanding,
        penaltyAmount: outstanding,
        duration: 0,
        ratePerHour: 0,
      },
    });
  };

  const payPenalty = (warning) => {
    navigate("/user/payment", {
      state: {
        intent: "penalty",
        slotId: warning.slotId,
        parkingName: warning.parkingName,
        totalAmount: warning.amount,
        penaltyAmount: warning.amount,
        duration: 0,
        ratePerHour: 0,
      },
    });
  };

  const fmtDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  // Derive payment-like rows from bookings for history
  const completedBookings = bookings.filter(b => b.status === "COMPLETED" && b.amount);
  const totalSpent = stats?.totalAmountSpent || 0;

  return (
    <>
      <ToastContainer theme="dark" position="top-right" autoClose={3000} style={{ zIndex: 9999, top: "5rem", right: "1rem" }} />
      <DashboardLayout role="USER">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white mb-1">Payments</h2>
            <p className="text-gray-400 text-sm">Your parking financial overview</p>
          </div>

          {/* ── Account Status Banner ─────────────────────────── */}
          <AnimatePresence>
            {isBlocked && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className={`mb-8 p-5 rounded-2xl border flex items-start gap-4 ${
                  accountStatus === "SUSPENDED" ? "bg-neon-red/10 border-neon-red/40" : "bg-yellow-500/10 border-yellow-500/30"
                }`}
              >
                <FaBan className={`text-2xl shrink-0 mt-0.5 ${accountStatus === "SUSPENDED" ? "text-neon-red" : "text-yellow-400"}`} />
                <div className="flex-1">
                  <p className={`font-black text-sm uppercase tracking-wide ${accountStatus === "SUSPENDED" ? "text-neon-red" : "text-yellow-400"}`}>
                    {accountStatus === "SUSPENDED" ? "Account Suspended" : "Payment Pending — Bookings Blocked"}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {accountStatus === "SUSPENDED"
                      ? "Your account has been suspended due to 48h+ unpaid dues. Clear dues to restore access."
                      : `You have an outstanding payment of ₹${outstanding}. Clear dues to make new bookings.`}
                  </p>
                </div>
                <button onClick={clearDues} className="px-4 py-2 bg-neon-blue text-white rounded-xl font-bold text-sm hover:bg-blue-500 transition-all whitespace-nowrap">
                  Pay ₹{outstanding}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Account Status Card ─────────────────────────── */}
          <Section title="Account Status" icon={<FaShieldAlt />}>
            <div className="bg-dark-card/60 border border-white/5 rounded-2xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center ${
                  isBlocked
                    ? "bg-neon-red/10 border-neon-red/40 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                    : "bg-neon-green/10 border-neon-green/40 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                }`}>
                  {isBlocked ? <FaBan className="text-neon-red text-xl" /> : <FaShieldAlt className="text-neon-green text-xl" />}
                </div>
                <div>
                  <p className={`font-black text-lg ${isBlocked ? "text-neon-red" : "text-neon-green"}`}>
                    {accountStatus === "SUSPENDED" ? "SUSPENDED" : accountStatus === "PAYMENT_PENDING" ? "PAYMENT PENDING" : "ACTIVE"}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {isBlocked ? `${warnings.length}/5 warnings issued` : "All dues cleared · Bookings enabled"}
                  </p>
                </div>
              </div>
              <StatusBadge status={accountStatus === "ACTIVE" ? "ACTIVE" : accountStatus} />
            </div>
          </Section>

          {/* ── Stats Cards ─────────────────────────────────── */}
          {stats && (
            <Section title="Summary" icon={<FaRupeeSign />}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Bookings",  value: stats.totalBookings,     color: "text-neon-blue" },
                  { label: "Completed",       value: stats.completedBookings, color: "text-neon-green" },
                  { label: "Active",          value: stats.activeBookings,    color: "text-yellow-400" },
                  { label: "Total Spent",     value: `₹${totalSpent.toFixed(0)}`, color: "text-neon-purple" },
                ].map(s => (
                  <div key={s.label} className="bg-dark-card/60 border border-white/5 rounded-2xl p-4 text-center">
                    <p className={`font-black text-2xl ${s.color}`}>{s.value}</p>
                    <p className="text-gray-500 text-xs mt-1 uppercase">{s.label}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── Outstanding Dues ─────────────────────────────── */}
          {isBlocked && (
            <Section title="Outstanding Dues" icon={<FaExclamationTriangle />}>
              <div className="bg-dark-card/60 border border-neon-red/20 rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neon-red/10 border border-neon-red/30 flex items-center justify-center">
                    <FaTimesCircle className="text-neon-red" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Unpaid Overtime Penalty</p>
                    <p className="text-gray-400 text-xs">Includes base + overtime penalty</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-neon-red font-black text-xl">₹{outstanding}</span>
                  <button onClick={clearDues} className="px-4 py-2 bg-neon-red text-white rounded-xl font-bold text-sm hover:bg-red-500 transition-all">
                    Pay Now
                  </button>
                </div>
              </div>
            </Section>
          )}

          {/* ── Payment History ─────────────────────────────── */}
          <Section title="Payment History" icon={<FaHistory />}>
            {loading ? (
              <div className="flex justify-center py-10"><FaSpinner className="text-neon-blue text-3xl animate-spin" /></div>
            ) : completedBookings.length === 0 ? (
              <div className="bg-dark-card/60 border border-white/5 rounded-2xl p-8 text-center text-gray-500">
                No completed payments yet.
              </div>
            ) : (
              <div className="space-y-3">
                {completedBookings.slice(0, 15).map((b) => (
                  <motion.div key={b.id} whileHover={{ x: 4 }}
                    className="bg-dark-card/60 border border-white/5 rounded-2xl p-5 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
                        <FaCheckCircle className="text-neon-green" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{b.parkingName}</p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          Slot {b.slotCode} · {b.vehicleNumber} · {fmtDate(b.startTime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status="SUCCESS" />
                      <span className="font-black text-neon-green">₹{b.amount}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Section>

          {/* ── Warnings & Penalties ─────────────────────────── */}
          {warnings.length > 0 && (
            <Section title={`Penalty Warnings (${warnings.length}/5)`} icon={<FaBan />}>
              <div className="space-y-3">
                <div className={`p-4 rounded-xl border ${
                  warnings.length >= 5 ? "bg-neon-red/10 border-neon-red/30"
                    : warnings.length >= 3 ? "bg-yellow-500/10 border-yellow-500/30"
                    : "bg-neon-blue/10 border-neon-blue/30"
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-black text-sm ${warnings.length >= 5 ? "text-neon-red" : warnings.length >= 3 ? "text-yellow-400" : "text-neon-blue"}`}>
                        {warnings.length >= 5 ? "⚠️ MAXIMUM WARNINGS REACHED" : warnings.length >= 3 ? "⚠️ HIGH WARNING COUNT" : "Active Warnings"}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        {warnings.length >= 5
                          ? "Your account may be suspended. Pay all penalties immediately."
                          : `${5 - warnings.length} warning${5 - warnings.length !== 1 ? "s" : ""} remaining before suspension.`}
                      </p>
                    </div>
                    <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-black text-lg ${
                      warnings.length >= 5 ? "border-neon-red text-neon-red bg-neon-red/10"
                        : warnings.length >= 3 ? "border-yellow-400 text-yellow-400 bg-yellow-500/10"
                        : "border-neon-blue text-neon-blue bg-neon-blue/10"
                    }`}>
                      {warnings.length}/5
                    </div>
                  </div>
                </div>

                {warnings.map((w) => (
                  <motion.div key={w.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="bg-dark-card/60 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-neon-red/20 border border-neon-red/30 flex items-center justify-center">
                        <FaExclamationTriangle className="text-neon-red" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{w.parkingName}</p>
                        <p className="text-gray-500 text-xs mt-0.5">Slot #{w.slotId} · {fmtDate(w.date)}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-neon-red/20 text-neon-red border border-neon-red/30">{w.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-neon-red font-black text-lg">₹{w.amount}</span>
                      <button onClick={() => payPenalty(w)} className="px-4 py-2 bg-neon-red text-white rounded-xl font-bold text-sm hover:bg-red-500 transition-all">
                        Pay Now
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Section>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}