import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaRupeeSign, FaCheckCircle,
  FaExclamationTriangle, FaBan, FaHistory, FaShieldAlt,
  FaSpinner, FaTimesCircle,
} from "react-icons/fa";
import { bookingsAPI, dashboardAPI } from "../../api/api";
import { toast, ToastContainer } from "react-toastify";

function StatusBadge({ status }) {
  const map = {
    SUCCESS: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60",
    PAID:    "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60",
    ACTIVE:  "bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 border-primary-200 dark:border-primary-800/60",
    PENDING: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60",
    PAYMENT_PENDING: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60",
    FAILED:  "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60",
    SUSPENDED: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60",
    CANCELLED: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60",
    COMPLETED: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status] || map.PENDING}`}>
      {status}
    </span>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="mb-8">
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
        <span className="text-primary-600 dark:text-primary-400">{icon}</span> {title}
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
      <ToastContainer position="top-right" autoClose={3000} style={{ zIndex: 9999, top: "5rem", right: "1rem" }} />
      <DashboardLayout role="USER">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Payments & Invoices</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage transaction history, account status, and dues</p>
          </div>

          {/* ── Account Status Banner ─────────────────────────── */}
          <AnimatePresence>
            {isBlocked && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className={`mb-8 p-5 rounded-2xl border flex items-start gap-4 shadow-sm ${
                  accountStatus === "SUSPENDED" 
                    ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60" 
                    : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60"
                }`}
              >
                <div className={`p-2.5 rounded-xl ${accountStatus === "SUSPENDED" ? "bg-rose-100 dark:bg-rose-900/60 text-rose-600" : "bg-amber-100 dark:bg-amber-900/60 text-amber-600"}`}>
                  <FaBan className="text-xl" />
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-sm uppercase tracking-wide ${accountStatus === "SUSPENDED" ? "text-rose-700 dark:text-rose-300" : "text-amber-700 dark:text-amber-300"}`}>
                    {accountStatus === "SUSPENDED" ? "Account Suspended" : "Payment Pending — Bookings Paused"}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                    {accountStatus === "SUSPENDED"
                      ? "Your account has been suspended due to 48h+ unpaid dues. Clear dues to restore booking access immediately."
                      : `You have an outstanding payment balance of ₹${outstanding}. Clear dues to enable new parking reservations.`}
                  </p>
                </div>
                <button onClick={clearDues} className="px-4 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 shadow-sm transition-all whitespace-nowrap">
                  Pay ₹{outstanding}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Account Status Card ─────────────────────────── */}
          <Section title="Account Standing" icon={<FaShieldAlt />}>
            <div className="parkease-card rounded-2xl p-6 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${
                  isBlocked
                    ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 border border-rose-200 dark:border-rose-800/60"
                    : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200 dark:border-emerald-800/60"
                }`}>
                  {isBlocked ? <FaBan /> : <FaShieldAlt />}
                </div>
                <div>
                  <p className={`font-bold text-base ${isBlocked ? "text-rose-600 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400"}`}>
                    {accountStatus === "SUSPENDED" ? "SUSPENDED" : accountStatus === "PAYMENT_PENDING" ? "PAYMENT PENDING" : "GOOD STANDING"}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                    {isBlocked ? `${warnings.length}/5 warnings issued` : "All dues settled · Unrestricted booking access"}
                  </p>
                </div>
              </div>
              <StatusBadge status={accountStatus === "ACTIVE" ? "ACTIVE" : accountStatus} />
            </div>
          </Section>

          {/* ── Stats Cards ─────────────────────────────────── */}
          {stats && (
            <Section title="Financial Summary" icon={<FaRupeeSign />}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Bookings",  value: stats.totalBookings,     color: "text-primary-600 dark:text-primary-400" },
                  { label: "Completed",       value: stats.completedBookings, color: "text-emerald-600 dark:text-emerald-400" },
                  { label: "Active Sessions", value: stats.activeBookings,    color: "text-amber-600 dark:text-amber-400" },
                  { label: "Total Paid",      value: `₹${totalSpent.toFixed(0)}`, color: "text-slate-900 dark:text-white" },
                ].map(s => (
                  <div key={s.label} className="parkease-card rounded-2xl p-5 text-center shadow-sm">
                    <p className={`font-bold text-2xl tracking-tight ${s.color}`}>{s.value}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1 uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── Outstanding Dues ─────────────────────────────── */}
          {isBlocked && (
            <Section title="Outstanding Dues" icon={<FaExclamationTriangle />}>
              <div className="parkease-card border-rose-200 dark:border-rose-900/50 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
                    <FaTimesCircle className="text-lg" />
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-white font-semibold text-sm">Unpaid Overtime Penalty</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Includes overtime parking penalty charges</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-rose-600 dark:text-rose-400 font-bold text-xl">₹{outstanding}</span>
                  <button onClick={clearDues} className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700 transition-all shadow-sm">
                    Pay Now
                  </button>
                </div>
              </div>
            </Section>
          )}

          {/* ── Payment History ─────────────────────────────── */}
          <Section title="Transaction Receipts" icon={<FaHistory />}>
            {loading ? (
              <div className="flex justify-center py-12"><FaSpinner className="text-primary-600 text-3xl animate-spin" /></div>
            ) : completedBookings.length === 0 ? (
              <div className="parkease-card rounded-2xl p-8 text-center text-slate-500 dark:text-slate-400 text-sm shadow-sm">
                No past transactions found.
              </div>
            ) : (
              <div className="space-y-3">
                {completedBookings.slice(0, 15).map((b) => (
                  <motion.div key={b.id} whileHover={{ y: -2 }}
                    className="parkease-card rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <FaCheckCircle className="text-base" />
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-white font-semibold text-sm">{b.parkingName}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                          Slot {b.slotCode} · {b.vehicleNumber} · {fmtDate(b.startTime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status="SUCCESS" />
                      <span className="font-bold text-slate-900 dark:text-white text-base">₹{b.amount}</span>
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
                <div className={`p-4 rounded-xl border shadow-sm ${
                  warnings.length >= 5 
                    ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60"
                    : warnings.length >= 3 
                      ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60"
                      : "bg-primary-50 dark:bg-primary-950/40 border-primary-200 dark:border-primary-800/60"
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-bold text-sm ${warnings.length >= 5 ? "text-rose-700 dark:text-rose-300" : warnings.length >= 3 ? "text-amber-700 dark:text-amber-300" : "text-primary-700 dark:text-primary-300"}`}>
                        {warnings.length >= 5 ? "⚠️ MAXIMUM WARNINGS REACHED" : warnings.length >= 3 ? "⚠️ HIGH WARNING COUNT" : "Active Warnings"}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                        {warnings.length >= 5
                          ? "Your account may be suspended permanently. Settle all penalties immediately."
                          : `${5 - warnings.length} warning${5 - warnings.length !== 1 ? "s" : ""} remaining before account restriction.`}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                      warnings.length >= 5 
                        ? "border-rose-400 text-rose-600 bg-rose-100 dark:bg-rose-900/60"
                        : warnings.length >= 3 
                          ? "border-amber-400 text-amber-600 bg-amber-100 dark:bg-amber-900/60"
                          : "border-primary-400 text-primary-600 bg-primary-100 dark:bg-primary-900/60"
                    }`}>
                      {warnings.length}/5
                    </div>
                  </div>
                </div>

                {warnings.map((w) => (
                  <motion.div key={w.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="parkease-card border-rose-200 dark:border-rose-900/50 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
                        <FaExclamationTriangle />
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-white font-semibold text-sm">{w.parkingName}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Slot #{w.slotId} · {fmtDate(w.date)}</p>
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">{w.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-rose-600 dark:text-rose-400 font-bold text-lg">₹{w.amount}</span>
                      <button onClick={() => payPenalty(w)} className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700 transition-all shadow-sm">
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