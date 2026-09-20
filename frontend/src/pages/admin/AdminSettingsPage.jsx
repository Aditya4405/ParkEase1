import { useState } from "react";
import { toast } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaMoon, FaSun, FaDesktop, FaSave
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

export default function AdminSettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [anomalyAlerts, setAnomalyAlerts] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [financialAlerts, setFinancialAlerts] = useState(true);

  const handleSavePreferences = () => {
    toast.success("Settings and preferences saved successfully!");
  };

  return (
    <DashboardLayout role="ADMIN">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Platform Settings & Preferences</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure system appearance, automated alert notifications, and security protocols
          </p>
        </div>

        <button
          onClick={handleSavePreferences}
          className="parkease-btn-primary flex items-center gap-2 py-2 px-4 text-xs cursor-pointer w-fit"
        >
          <FaSave size={12} />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="space-y-6 max-w-4xl">

        {/* 1. Theme & Appearance Section */}
        <div className="parkease-card rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Appearance & Interface Theme</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Choose your preferred color theme across all administrator views.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Light */}
            <div
              onClick={() => setTheme("light")}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                theme === "light"
                  ? "bg-primary-50/60 dark:bg-primary-950/40 border-primary-500 shadow-xs"
                  : "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-lg text-amber-500 shadow-xs">
                <FaSun />
              </div>
              <div className="text-center">
                <p className="font-bold text-xs text-slate-900 dark:text-white">Light Theme</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Clean high-contrast SaaS mode</p>
              </div>
            </div>

            {/* Dark */}
            <div
              onClick={() => setTheme("dark")}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                theme === "dark"
                  ? "bg-primary-50/60 dark:bg-primary-950/40 border-primary-500 shadow-xs"
                  : "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-lg text-primary-400 shadow-xs">
                <FaMoon />
              </div>
              <div className="text-center">
                <p className="font-bold text-xs text-slate-900 dark:text-white">Dark Theme</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Signature Deep Navy styling</p>
              </div>
            </div>

            {/* System */}
            <div
              onClick={() => setTheme("system")}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                theme === "system"
                  ? "bg-primary-50/60 dark:bg-primary-950/40 border-primary-500 shadow-xs"
                  : "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-lg text-slate-600 dark:text-slate-300 shadow-xs">
                <FaDesktop />
              </div>
              <div className="text-center">
                <p className="font-bold text-xs text-slate-900 dark:text-white">System Synchronized</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Adapts to OS ({resolvedTheme})</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Automated Alerts & Notifications */}
        <div className="parkease-card rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Real-Time Operational Alerts</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Control which automated notifications appear in the TopBar Bell</p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Ghost Slot & Hardware Anomalies</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Instant alerts when slot states desynchronize from active sessions.</p>
              </div>
              <input
                type="checkbox"
                checked={anomalyAlerts}
                onChange={(e) => setAnomalyAlerts(e.target.checked)}
                className="w-4 h-4 accent-primary-600 cursor-pointer"
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">High Occupancy Warnings</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Alerts when parking lots cross 80% and 95% capacity thresholds.</p>
              </div>
              <input
                type="checkbox"
                checked={bookingAlerts}
                onChange={(e) => setBookingAlerts(e.target.checked)}
                className="w-4 h-4 accent-primary-600 cursor-pointer"
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Financial & Refund Disputes</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Urgent notifications for customer refund claims and payment inquiries.</p>
              </div>
              <input
                type="checkbox"
                checked={financialAlerts}
                onChange={(e) => setFinancialAlerts(e.target.checked)}
                className="w-4 h-4 accent-primary-600 cursor-pointer"
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">System Maintenance Updates</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Database backups and automated cleanup job summaries.</p>
              </div>
              <input
                type="checkbox"
                checked={systemAlerts}
                onChange={(e) => setSystemAlerts(e.target.checked)}
                className="w-4 h-4 accent-primary-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 3. Security & Session Information */}
        <div className="parkease-card rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Security & Active Session</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Cryptographic token expiration and role authorization</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Authenticated Role</span>
              <p className="font-bold text-purple-600 dark:text-purple-400 mt-0.5">ROLE_ADMIN (Super Administrator)</p>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">JWT Token Expiry</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">24 Hours (Rolling Refresh)</p>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
