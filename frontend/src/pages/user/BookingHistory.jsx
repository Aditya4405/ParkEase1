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

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED": return "bg-neon-green/20 text-neon-green border-neon-green/30";
      case "ACTIVE":    return "bg-neon-blue/20 text-neon-blue border-neon-blue/30 animate-pulse";
      case "PENDING":   return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "CANCELLED": return "bg-neon-red/20 text-neon-red border-neon-red/30";
      default:          return "bg-gray-500/20 text-gray-400";
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
      <ToastContainer theme="dark" position="top-right" autoClose={3000} style={{ zIndex: 9999, top: "5rem", right: "1rem" }} />
      <DashboardLayout role="USER">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Booking History</h2>
            <p className="text-gray-400">Track your past and current parking sessions</p>
          </div>

          <div className="bg-dark-card/60 backdrop-blur-xl border border-white/10 rounded-lg p-1 flex">
            {["ALL", "ACTIVE", "PENDING", "COMPLETED", "CANCELLED"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 rounded-md text-xs font-bold transition-all ${
                  activeTab === tab ? "bg-neon-blue text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <FaSpinner className="text-neon-blue text-4xl animate-spin" />
          </div>
        ) : (
          <div className="bg-dark-card/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-sm uppercase tracking-wider">
                    <th className="py-4 px-6 font-semibold">Parking</th>
                    <th className="py-4 px-6 font-semibold">Slot / Vehicle</th>
                    <th className="py-4 px-6 font-semibold">Time</th>
                    <th className="py-4 px-6 font-semibold">Amount</th>
                    <th className="py-4 px-6 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((b) => (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={b.id}
                      className="hover:bg-white/5 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-neon-blue group-hover:bg-neon-blue/10 transition-colors">
                            <FaCar />
                          </div>
                          <div>
                            <p className="font-bold text-white">{b.parkingName}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1"><FaMapMarkerAlt /> {b.parkingLocation}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-neon-purple font-bold bg-neon-purple/10 px-2 py-1 rounded border border-neon-purple/20">
                          {b.slotCode}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{b.vehicleNumber}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-white text-sm flex items-center gap-1">
                          <FaCalendarAlt className="text-gray-500" /> {fmtTime(b.startTime)}
                        </p>
                        <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                          <FaClock className="text-gray-500" /> {fmtDuration(b.startTime, b.endTime)}
                        </p>
                      </td>
                      <td className="py-4 px-6 font-bold text-white">
                        {b.amount != null ? `₹${b.amount}` : "—"}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(b.status)} inline-flex items-center gap-1`}>
                            {b.status === "COMPLETED" && <FaCheckCircle />}
                            {b.status}
                          </span>
                          {b.status === "ACTIVE" && (
                            <button
                              onClick={() => handleCancel(b.id)}
                              disabled={cancelling === b.id}
                              className="p-2 rounded-lg bg-neon-red/10 text-neon-red hover:bg-neon-red/20 border border-neon-red/20 transition-all disabled:opacity-50"
                              title="Cancel Booking"
                            >
                              {cancelling === b.id ? <FaSpinner className="animate-spin" /> : <FaTimesCircle />}
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-gray-500">
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