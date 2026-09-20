import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaChartLine, FaCar, FaClock
} from "react-icons/fa";
import { api } from "../../api/api";

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("7d");
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async (r) => {
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
  }, [range]);

  useEffect(() => {
    fetchAnalytics(range);
  }, [range, fetchAnalytics]);

  const fmtMoney = (n) => `₹${(n || 0).toLocaleString("en-IN")}`;

  const maxHourlyCount = Math.max(
    ...(analytics?.peakHours?.map((h) => h.count) || [1]),
    1
  );

  return (
    <DashboardLayout role="ADMIN">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Platform Analytics & Insights</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Historical demand curves, peak parking rush hours, and vehicle segmentation
          </p>
        </div>
        <div className="flex gap-2">
          {["7d", "30d", "90d"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                range === r
                  ? "bg-primary-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-2xl p-6 text-center text-rose-700 dark:text-rose-400 mb-6 flex flex-col items-center gap-3">
          <FaChartLine size={24} className="text-rose-500" />
          <p className="text-sm font-semibold">{error}</p>
          <button
            onClick={() => fetchAnalytics(range)}
            className="px-4 py-2 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Retry Analytics Calculation
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="parkease-card rounded-2xl p-6 animate-pulse space-y-4 shadow-sm">
            <div className="h-5 w-60 bg-slate-200 dark:bg-slate-850 rounded"></div>
            <div className="grid grid-cols-7 gap-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 parkease-card rounded-2xl p-6 animate-pulse h-56 shadow-sm"></div>
            <div className="parkease-card rounded-2xl p-6 animate-pulse h-56 shadow-sm"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">

          {/* 1. Daily Booking & Revenue Trend */}
          <div className="parkease-card rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <FaChartLine className="text-primary-600 dark:text-primary-400" /> Activity & Revenue Trajectory
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Daily verified bookings and completed settlements</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {analytics?.timeline?.map((day, idx) => (
                <div key={idx} className="bg-slate-50/70 dark:bg-slate-850/50 rounded-xl p-3.5 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between text-center">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{day.date}</span>
                  <div className="my-3">
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{day.bookings}</p>
                    <span className="text-[10px] text-primary-600 dark:text-primary-400 font-bold">Bookings</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{fmtMoney(day.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Peak Hours Heatmap (24h) & Vehicle Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Peak Hours */}
            <div className="lg:col-span-2 parkease-card rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <FaClock className="text-purple-600 dark:text-purple-400" /> 24-Hour Demand Curve
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Hourly rush distribution across the platform</p>

              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 items-end h-40 pt-4">
                {analytics?.peakHours?.map((h, idx) => {
                  const heightPct = Math.round((h.count / maxHourlyCount) * 100);
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                      <div
                        style={{ height: `${Math.max(heightPct, 8)}%` }}
                        className={`w-full rounded-md transition-all ${
                          heightPct > 70
                            ? "bg-rose-500"
                            : heightPct > 40
                            ? "bg-amber-500"
                            : "bg-primary-600"
                        } group-hover:opacity-80`}
                        title={`${h.hour}: ${h.count} bookings`}
                      />
                      <span className="text-[9px] font-mono text-slate-400 truncate w-full text-center">
                        {h.hour.split(":")[0]}h
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Vehicle Breakdown */}
            <div className="parkease-card rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <FaCar className="text-emerald-600 dark:text-emerald-400" /> Vehicle Demographics
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Distribution of reserved vehicle types</p>

              <div className="space-y-4">
                {analytics?.vehicleBreakdown?.map((v, idx) => (
                  <div key={idx} className="space-y-1.5 bg-slate-50/70 dark:bg-slate-850/50 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">{v.type}</span>
                      <span className="font-bold text-primary-600 dark:text-primary-400">{v.count} Bookings</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${Math.min((v.count / (analytics.totalBookings || 1)) * 100, 100)}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-primary-600 to-indigo-500"
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
