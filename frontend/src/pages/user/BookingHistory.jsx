import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { FaCalendarAlt, FaCheckCircle, FaClock, FaMapMarkerAlt, FaCar, FaTimesCircle, FaSpinner } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { bookingsAPI } from "../../api/api";

export default function BookingHistory() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [bookings,  setBookings]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [cancelling,setCancelling]= useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await bookingsAPI.getAll();
      setBookings(data || []);
    } catch (err) {
      toast.error("Failed to load bookings: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    setCancelling(id);
    try {
      await bookingsAPI.cancel(id);
      toast.success("Booking cancelled.");
      await load();
    } catch (err) {
      toast.error(err.message || "Failed to cancel booking.");
    } finally {
      setCancelling(null);
    }
  };

  const filtered = activeTab === "ALL"
    ? bookings
    : bookings.filter(b => b.status === activeTab);

  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60";
      case "ACTIVE":
        return "bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 border-primary-200 dark:border-primary-800/60";
      case "PENDING":
        return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60";
      case "CANCELLED":
        return "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    }
  };

  const fmtTime = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const fmtDuration = (start, end) => {
    if (!start || !end) return "—";
    const ms = new Date(end) - new Date(start);
    if (ms <= 0) return "—";
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} style={{ zIndex: 9999, top: "5rem", right: "1rem" }} />
      <DashboardLayout role="USER">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Booking History</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Track and manage your past and active parking sessions</p>
          </div>

          <div className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 flex flex-wrap gap-1 shadow-sm">
            {["ALL", "ACTIVE", "PENDING", "COMPLETED", "CANCELLED"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-sm font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <FaSpinner className="text-primary-600 text-3xl animate-spin" />
          </div>
        ) : (
          <div className="parkease-card rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-4 px-6">Parking Spot</th>
                    <th className="py-4 px-6">Slot / Vehicle</th>
                    <th className="py-4 px-6">Schedule & Duration</th>
                    <th className="py-4 px-6">Amount</th>
                    <th className="py-4 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((b) => (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={b.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm shrink-0">
                            <FaCar />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white text-sm">{b.parkingName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5"><FaMapMarkerAlt size={10} className="text-slate-400" /> {b.parkingLocation}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs font-bold bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-md border border-primary-200/70 dark:border-primary-800/50">
                          {b.slotCode}
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">{b.vehicleNumber || "—"}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-slate-800 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5">
                          <FaCalendarAlt className="text-slate-400" size={11} /> {fmtTime(b.startTime)}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1.5 mt-1 font-medium">
                          <FaClock className="text-slate-400" size={11} /> {fmtDuration(b.startTime, b.endTime)}
                        </p>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-white text-sm">
                        {b.amount != null ? `₹${b.amount}` : "—"}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(b.status)} inline-flex items-center gap-1.5`}>
                            {b.status === "COMPLETED" && <FaCheckCircle size={10} />}
                            {b.status}
                          </span>
                          {b.status === "ACTIVE" && (
                            <button
                              onClick={() => handleCancel(b.id)}
                              disabled={cancelling === b.id}
                              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-800/60 transition-all disabled:opacity-50"
                              title="Cancel Booking"
                            >
                              {cancelling === b.id ? <FaSpinner className="animate-spin" size={12} /> : <FaTimesCircle size={12} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                        No bookings found in this category.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}