import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaUsers, FaParking, FaMoneyBillWave, FaCar,
  FaCheckCircle, FaSyncAlt, FaFileDownload,
  FaExclamationTriangle, FaShieldAlt, FaArrowUp,
  FaChevronRight
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
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Admin Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800/60 flex items-center gap-1.5">
              <FaShieldAlt size={10} /> Platform Control
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Platform-wide real-time operations, analytics, and infrastructure telemetry
          </p>
        </div>

        {/* Date Selector & Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="parkease-input py-2 px-3 text-xs cursor-pointer font-medium"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 3 Months</option>
          </select>

          <button
            onClick={fetchOverview}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all cursor-pointer"
          >
            <FaSyncAlt className={`${refreshing ? "animate-spin text-primary-600" : ""}`} size={11} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportSummary}
            className="parkease-btn-primary flex items-center gap-1.5 py-2 px-4 text-xs"
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
        <div className="parkease-card rounded-2xl p-12 text-center text-slate-600 dark:text-slate-300 flex flex-col items-center gap-3 border-rose-200 dark:border-rose-900/40">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl">
            <FaExclamationTriangle />
          </div>
          <p className="text-base font-bold text-slate-900 dark:text-white">Unable to aggregate platform telemetry</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">{error}</p>
          <button
            onClick={fetchOverview}
            className="mt-2 px-4 py-2 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/40 dark:hover:bg-primary-900/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800/60 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
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
              className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                    <FaExclamationTriangle />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Attention Required</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
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
                    className="p-3.5 bg-white dark:bg-slate-850 border border-amber-200/70 dark:border-amber-800/30 hover:border-amber-400 rounded-xl flex items-start justify-between gap-3 cursor-pointer group shadow-sm transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            item.severity === "CRITICAL"
                              ? "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50"
                              : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50"
                          }`}
                        >
                          {item.severity}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{item.category}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.description}</p>
                    </div>
                    <FaChevronRight className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all text-xs flex-shrink-0 mt-3" />
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
              className="parkease-card rounded-2xl p-5 hover:border-primary-400/60 transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Users</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaUsers size={14} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stats?.totalUsers || 0}</p>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <FaArrowUp size={9} /> <span>Active Platform Users</span>
              </div>
            </div>

            {/* Total Owners */}
            <div
              onClick={() => navigate("/admin/users")}
              className="parkease-card rounded-2xl p-5 hover:border-primary-400/60 transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Parking Owners</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaShieldAlt size={14} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stats?.totalOwners || 0}</p>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>Verified Facilities</span>
              </div>
            </div>

            {/* Total Parking Lots */}
            <div
              onClick={() => navigate("/admin/parkings")}
              className="parkease-card rounded-2xl p-5 hover:border-primary-400/60 transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Parking Lots</span>
                <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaParking size={14} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stats?.totalParkings || 0}</p>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>{stats?.totalSlots || 0} Total Slots</span>
              </div>
            </div>

            {/* Platform Revenue */}
            <div
              onClick={() => navigate("/admin/revenue")}
              className="parkease-card rounded-2xl p-5 hover:border-emerald-400/60 transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Platform Revenue</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaMoneyBillWave size={14} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{fmtMoney(stats?.totalRevenue)}</p>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <FaCheckCircle size={10} /> <span>Settled Transactions</span>
              </div>
            </div>
          </div>

          {/* ── 3. PLATFORM OPERATIONS & LIVE OCCUPANCY ── */}
          <div className="parkease-card rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Platform Operations & Capacity</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Live slot distribution and system occupancy rate</p>
              </div>
              <button
                onClick={() => navigate("/admin/live-parking")}
                className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-bold flex items-center gap-1"
              >
                Live Parking Monitor →
              </button>
            </div>

            {/* Occupancy Progress Bar */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Overall Platform Occupancy</span>
                <span className="font-bold text-primary-600 dark:text-primary-400 text-sm">{stats?.occupancyRate || 0}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                <div
                  style={{ width: `${stats?.occupancyRate || 0}%` }}
                  className="h-full bg-gradient-to-r from-primary-600 to-indigo-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* Slot States Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Available</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats?.availableSlots || 0}</p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Ready for booking</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Occupied</p>
                <p className="text-xl font-bold text-primary-600 dark:text-primary-400 mt-1">{stats?.occupiedSlots || 0}</p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Vehicles parked</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Reserved</p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats?.reservedSlots || 0}</p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Booking active</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Maintenance</p>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats?.maintenanceSlots || 0}</p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Under repair</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Disabled</p>
                <p className="text-xl font-bold text-slate-600 dark:text-slate-300 mt-1">{stats?.disabledSlots || 0}</p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Temporarily inactive</span>
              </div>
            </div>
          </div>

          {/* ── 4. RECENT ACTIVITY & TOP VENUES ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left 2 Columns: Recent Activity Stream */}
            <div className="lg:col-span-2 parkease-card rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent System Activity</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Real-time ledger of bookings, settlements, and administrative actions</p>
                </div>
                <button
                  onClick={() => navigate("/admin/audit-logs")}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-bold"
                >
                  View Audit Trail →
                </button>
              </div>

              <div className="space-y-3">
                {stats?.recentActivities?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">No recent activity recorded.</p>
                ) : (
                  stats?.recentActivities?.map((act) => (
                    <div
                      key={act.id}
                      className="p-3.5 bg-slate-50/70 dark:bg-slate-850/50 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center flex-shrink-0 text-sm shadow-xs">
                          {act.type === "BOOKING" ? (
                            <FaCar className="text-primary-600 dark:text-primary-400" />
                          ) : act.type === "PAYMENT" ? (
                            <FaMoneyBillWave className="text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <FaShieldAlt className="text-purple-600 dark:text-purple-400" />
                          )}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{act.actor} <span className="font-normal text-slate-500 dark:text-slate-400">— {act.action}</span></p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{act.target}</p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        {act.amount != null && (
                          <p className="font-bold text-emerald-600 dark:text-emerald-400">{fmtMoney(act.amount)}</p>
                        )}
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{fmtTime(act.timestamp)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Top Performing Parkings */}
            <div className="parkease-card rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Top Venues</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">By booking volume & revenue</p>
                </div>
                <button
                  onClick={() => navigate("/admin/parkings")}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-bold"
                >
                  All Lots →
                </button>
              </div>

              <div className="space-y-3">
                {stats?.topParkings?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">No parking venues found.</p>
                ) : (
                  stats?.topParkings?.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => navigate("/admin/parkings")}
                      className="p-3.5 bg-slate-50/70 dark:bg-slate-850/50 rounded-xl border border-slate-200/60 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-800/80 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[140px]">{p.name}</span>
                        <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">{fmtMoney(p.revenue)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
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