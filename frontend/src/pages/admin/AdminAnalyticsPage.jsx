import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaChartLine, FaCar, FaMoneyBillWave, FaClock,
  FaSpinner, FaHistory, FaCalendarAlt
} from "react-icons/fa";
import { api } from "../../api/api";

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("7d");

  const [error, setError] = useState(null);

  const fetchAnalytics = async (r) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get(`/admin/analytics?range=${r || range}`);
      setAnalytics(data);
    } catch (err) {
      setError(err.message || "Failed to load platform analytics");
      toast.error(err.message || "Failed to load platform analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);

  const fmtMoney = (n) => `₹${(n || 0).toLocaleString("en-IN")}`;

  const maxHourlyCount = Math.max(
    ...(analytics?.peakHours?.map((h) => h.count) || [1]),
    1
  );

  return (
    <DashboardLayout role="ADMIN">
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Platform Analytics & Insights</h1>
          <p className="text-xs text-gray-400 mt-1">
            Historical demand curves, peak parking rush hours, and vehicle segmentation
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center text-red-400 mb-6 flex flex-col items-center gap-3">
          <FaChartLine size={24} className="text-red-400" />
          <p className="text-sm font-semibold">{error}</p>
          <button
            onClick={() => fetchAnalytics(range)}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Retry Analytics Calculation
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 animate-pulse space-y-4">
            <div className="h-5 w-60 bg-white/10 rounded"></div>
            <div className="grid grid-cols-7 gap-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-24 bg-white/5 rounded-xl"></div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#1e293b] border border-white/10 rounded-2xl p-6 animate-pulse h-56"></div>
            <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 animate-pulse h-56"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">

          {/* 1. Daily Booking & Revenue Trend (7 Days) */}
          <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-base font-black text-white mb-1 flex items-center gap-2">
              <FaChartLine className="text-neon-blue" /> 7-Day Activity & Revenue Trajectory
            </h2>
            <p className="text-xs text-gray-400 mb-6">Daily verified bookings and completed settlements</p>

            <div className="grid grid-cols-7 gap-3">
              {analytics?.timeline?.map((day, idx) => (
                <div key={idx} className="bg-black/20 rounded-xl p-3.5 border border-white/5 flex flex-col justify-between text-center">
                  <span className="text-[10px] font-bold text-gray-400">{day.date}</span>
                  <div className="my-3">
                    <p className="text-lg font-black text-white">{day.bookings}</p>
                    <span className="text-[10px] text-neon-blue font-bold">Bookings</span>
                  </div>
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[11px] font-black text-neon-green">{fmtMoney(day.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Peak Hours Heatmap (24h) & Vehicle Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Peak Hours (2 Columns) */}
            <div className="lg:col-span-2 bg-[#1e293b] border border-white/10 rounded-2xl p-6 shadow-xl">
              <h2 className="text-base font-black text-white mb-1 flex items-center gap-2">
                <FaClock className="text-neon-purple" /> 24-Hour Peak Demand Curve
              </h2>
              <p className="text-xs text-gray-400 mb-5">Hourly rush distribution across the platform</p>

              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 items-end h-40 pt-4">
                {analytics?.peakHours?.map((h, idx) => {
                  const heightPct = Math.round((h.count / maxHourlyCount) * 100);
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                      <div
                        style={{ height: `${Math.max(heightPct, 8)}%` }}
                        className={`w-full rounded-md transition-all ${
                          heightPct > 70
                            ? "bg-neon-red"
                            : heightPct > 40
                            ? "bg-amber-400"
                            : "bg-neon-blue"
                        } group-hover:opacity-80`}
                        title={`${h.hour}: ${h.count} bookings`}
                      />
                      <span className="text-[8px] font-mono text-gray-500 truncate w-full text-center">
                        {h.hour.split(":")[0]}h
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Vehicle Breakdown (1 Column) */}
            <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 shadow-xl">
              <h2 className="text-base font-black text-white mb-1 flex items-center gap-2">
                <FaCar className="text-neon-green" /> Vehicle Demographics
              </h2>
              <p className="text-xs text-gray-400 mb-5">Distribution of reserved vehicle types</p>

              <div className="space-y-4">
                {analytics?.vehicleBreakdown?.map((v, idx) => (
                  <div key={idx} className="space-y-1.5 bg-black/20 p-3 rounded-xl border border-white/5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-white">{v.type}</span>
                      <span className="font-black text-neon-blue">{v.count} Bookings</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                      <div
                        style={{ width: `${Math.min((v.count / (analytics.totalBookings || 1)) * 100, 100)}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-neon-blue to-neon-purple"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}
    </DashboardLayout>
  );
}
