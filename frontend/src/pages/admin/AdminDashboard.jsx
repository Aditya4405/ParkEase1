import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaUsers, FaParking, FaMoneyBillWave, FaCar,
  FaCheckCircle, FaTimesCircle, FaSyncAlt, FaFileDownload,
  FaExclamationTriangle, FaShieldAlt, FaChartLine, FaArrowUp,
  FaChevronRight, FaHeartbeat
} from "react-icons/fa";
import { api } from "../../api/api";
import { CardSkeleton, TableSkeleton } from "../../components/common/Skeleton";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState("30d");
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverview = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await api.get("/admin/stats");
      setStats(data);
    } catch (err) {
      setError(err.message || "Failed to load admin stats");
      toast.error(err.message || "Failed to load admin stats");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const handleExportSummary = () => {
    if (!stats) return;
    const csvContent = "data:text/csv;charset=utf-8," +
      "Metric,Value\n" +
      `Total Users,${stats.totalUsers}\n` +
      `Total Owners,${stats.totalOwners}\n` +
      `Total Parking Lots,${stats.totalParkings}\n` +
      `Total Slots,${stats.totalSlots}\n` +
      `Active Bookings,${stats.activeBookings}\n` +
      `Total Bookings,${stats.totalBookings}\n` +
      `Platform Revenue,₹${stats.totalRevenue}\n` +
      `Occupancy Rate,${stats.occupancyRate}%\n` +
      `Available Slots,${stats.availableSlots}\n` +
      `Occupied Slots,${stats.occupiedSlots}\n` +
      `Maintenance Slots,${stats.maintenanceSlots}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `parkease_summary_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Executive summary exported as CSV!");
  };

  const fmtMoney = (n) => `₹${(n || 0).toLocaleString("en-IN")}`;
  const fmtTime = (iso) => !iso ? "—" : new Date(iso).toLocaleString("en-IN", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });

  return (
    <DashboardLayout role="ADMIN">
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Admin Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-neon-purple/20 text-neon-purple border border-neon-purple/30 flex items-center gap-1">
              <FaShieldAlt size={10} /> PLATFORM CONTROL
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Platform-wide real-time operations, analytics, and infrastructure health
          </p>
        </div>

        {/* Date Selector & Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-[#1e293b] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-medium outline-none cursor-pointer focus:border-neon-blue/40"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 3 Months</option>
          </select>

          <button
            onClick={fetchOverview}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <FaSyncAlt className={`${refreshing ? "animate-spin text-neon-blue" : ""}`} size={11} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportSummary}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-neon-blue to-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-500/20 hover:opacity-90 transition-all cursor-pointer"
          >
            <FaFileDownload size={11} />
            <span>Export Summary</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <CardSkeleton count={4} />
          <CardSkeleton count={4} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TableSkeleton rows={5} cols={4} />
            <TableSkeleton rows={5} cols={4} />
          </div>
        </div>
      ) : error ? (
        <div className="bg-[#1e293b] border border-neon-red/30 rounded-2xl p-12 text-center text-gray-300 flex flex-col items-center gap-3">
          <FaExclamationTriangle className="text-neon-red text-3xl" />
          <p className="text-sm font-bold text-white">Unable to aggregate platform telemetry</p>
          <p className="text-xs text-gray-400">{error}</p>
          <button
            onClick={fetchOverview}
            className="mt-2 px-4 py-2 bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue border border-neon-blue/40 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <FaSyncAlt size={12} /> Retry
          </button>
        </div>
      ) : (
        <div className="space-y-8">

          {/* ── 1. ATTENTION REQUIRED SECTION ── */}
          {stats?.attentionRequired?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-amber-500/10 via-[#1e293b] to-red-500/10 border border-amber-500/30 rounded-2xl p-5 shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                    <FaExclamationTriangle />
                  </span>
                  <div>
                    <h2 className="text-sm font-black text-white">Attention Required</h2>
                    <p className="text-[11px] text-gray-400">
                      {stats.attentionRequired.length} operational event{stats.attentionRequired.length !== 1 ? "s" : ""} require administrative review
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {stats.attentionRequired.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(item.actionUrl)}
                    className="p-3.5 bg-black/30 border border-white/5 hover:border-amber-400/40 rounded-xl flex items-start justify-between gap-3 cursor-pointer group transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                            item.severity === "CRITICAL"
                              ? "bg-neon-red/20 text-neon-red"
                              : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {item.severity}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold">{item.category}</span>
                      </div>
                      <p className="text-xs font-bold text-white mt-1.5 group-hover:text-amber-300 transition-colors">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{item.description}</p>
                    </div>
                    <FaChevronRight className="text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all text-xs flex-shrink-0 mt-3" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── 2. KPI METRICS CARDS ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Users */}
            <div
              onClick={() => navigate("/admin/users")}
              className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 hover:border-neon-blue/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Users</span>
                <FaUsers className="text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl font-black text-white">{stats?.totalUsers || 0}</p>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-neon-green font-semibold">
                <FaArrowUp size={9} /> <span>Active Platform Users</span>
              </div>
            </div>

            {/* Total Owners */}
            <div
              onClick={() => navigate("/admin/users")}
              className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 hover:border-neon-purple/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Parking Owners</span>
                <FaShieldAlt className="text-neon-purple group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl font-black text-white">{stats?.totalOwners || 0}</p>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-gray-400 font-semibold">
                <span>Verified Facilities</span>
              </div>
            </div>

            {/* Total Parking Lots */}
            <div
              onClick={() => navigate("/admin/parkings")}
              className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 hover:border-neon-blue/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Parking Lots</span>
                <FaParking className="text-neon-blue group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl font-black text-white">{stats?.totalParkings || 0}</p>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-gray-400 font-semibold">
                <span>{stats?.totalSlots || 0} Total Slots</span>
              </div>
            </div>

            {/* Platform Revenue */}
            <div
              onClick={() => navigate("/admin/revenue")}
              className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 hover:border-neon-green/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Platform Revenue</span>
                <FaMoneyBillWave className="text-neon-green group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl font-black text-white">{fmtMoney(stats?.totalRevenue)}</p>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-neon-green font-semibold">
                <FaCheckCircle size={9} /> <span>Settled Transactions</span>
              </div>
            </div>
          </div>

          {/* ── 3. PLATFORM OPERATIONS & LIVE OCCUPANCY ── */}
          <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="text-base font-black text-white">Platform Operations & Capacity</h2>
                <p className="text-xs text-gray-400">Live slot distribution and system occupancy rate</p>
              </div>
              <button
                onClick={() => navigate("/admin/live-parking")}
                className="text-xs text-neon-blue hover:text-blue-300 font-bold flex items-center gap-1"
              >
                Live Parking Monitor →
              </button>
            </div>

            {/* Occupancy Progress Bar */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-300">Overall Platform Occupancy</span>
                <span className="font-black text-neon-blue text-sm">{stats?.occupancyRate || 0}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-black/40 overflow-hidden flex">
                <div
                  style={{ width: `${stats?.occupancyRate || 0}%` }}
                  className="h-full bg-gradient-to-r from-neon-blue via-blue-500 to-neon-purple rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* Slot States Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] uppercase font-bold text-gray-400">Available</p>
                <p className="text-xl font-black text-neon-green mt-1">{stats?.availableSlots || 0}</p>
                <span className="text-[10px] text-gray-500">Ready for booking</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] uppercase font-bold text-gray-400">Occupied</p>
                <p className="text-xl font-black text-neon-blue mt-1">{stats?.occupiedSlots || 0}</p>
                <span className="text-[10px] text-gray-500">Vehicles parked</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] uppercase font-bold text-gray-400">Reserved</p>
                <p className="text-xl font-black text-amber-400 mt-1">{stats?.reservedSlots || 0}</p>
                <span className="text-[10px] text-gray-500">Booking active</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] uppercase font-bold text-gray-400">Maintenance</p>
                <p className="text-xl font-black text-purple-400 mt-1">{stats?.maintenanceSlots || 0}</p>
                <span className="text-[10px] text-gray-500">Under repair</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] uppercase font-bold text-gray-400">Disabled</p>
                <p className="text-xl font-black text-gray-400 mt-1">{stats?.disabledSlots || 0}</p>
                <span className="text-[10px] text-gray-500">Temporarily inactive</span>
              </div>
            </div>
          </div>

          {/* ── 4. RECENT ACTIVITY & TOP VENUES ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left 2 Columns: Recent Activity Stream */}
            <div className="lg:col-span-2 bg-[#1e293b] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-black text-white">Recent System Activity</h3>
                  <p className="text-xs text-gray-400">Real-time ledger of bookings, settlements, and admin actions</p>
                </div>
                <button
                  onClick={() => navigate("/admin/audit-logs")}
                  className="text-xs text-neon-blue hover:text-blue-300 font-bold"
                >
                  View Audit Trail →
                </button>
              </div>

              <div className="space-y-3">
                {stats?.recentActivities?.length === 0 ? (
                  <p className="text-xs text-gray-400 py-8 text-center">No recent activity recorded.</p>
                ) : (
                  stats?.recentActivities?.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 bg-black/20 rounded-xl border border-white/5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-sm">
                          {act.type === "BOOKING" ? (
                            <FaCar className="text-neon-blue" />
                          ) : act.type === "PAYMENT" ? (
                            <FaMoneyBillWave className="text-neon-green" />
                          ) : (
                            <FaShieldAlt className="text-neon-purple" />
                          )}
                        </span>
                        <div>
                          <p className="font-bold text-white">{act.actor} <span className="font-normal text-gray-400">— {act.action}</span></p>
                          <p className="text-[11px] text-gray-500 mt-0.5">{act.target}</p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        {act.amount != null && (
                          <p className="font-black text-neon-green">{fmtMoney(act.amount)}</p>
                        )}
                        <p className="text-[10px] text-gray-500 mt-0.5">{fmtTime(act.timestamp)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Top Performing Parkings */}
            <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-black text-white">Top Venues</h3>
                  <p className="text-xs text-gray-400">By booking volume & revenue</p>
                </div>
                <button
                  onClick={() => navigate("/admin/parkings")}
                  className="text-xs text-neon-blue hover:text-blue-300 font-bold"
                >
                  All Lots →
                </button>
              </div>

              <div className="space-y-3">
                {stats?.topParkings?.length === 0 ? (
                  <p className="text-xs text-gray-400 py-8 text-center">No parking venues found.</p>
                ) : (
                  stats?.topParkings?.map((p, idx) => (
                    <div
                      key={p.id}
                      onClick={() => navigate("/admin/parkings")}
                      className="p-3 bg-black/20 rounded-xl border border-white/5 hover:border-white/20 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white truncate max-w-[140px]">{p.name}</span>
                        <span className="font-black text-xs text-neon-green">{fmtMoney(p.revenue)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-400">
                        <span>{p.location}</span>
                        <span>{p.bookingCount} bookings</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}
    </DashboardLayout>
  );
}