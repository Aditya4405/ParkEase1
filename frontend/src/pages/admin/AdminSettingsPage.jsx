import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
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
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Platform Settings & Preferences</h1>
          <p className="text-xs text-gray-400 mt-1">
            Configure system appearance, automated alert notifications, and security protocols
          </p>
        </div>

        <button
          onClick={handleSavePreferences}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-blue hover:bg-blue-600 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
        >
          <FaSave size={12} />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="space-y-6 max-w-4xl">

        {/* 1. Theme & Appearance Section */}
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 shadow-xl">
          <h2 className="text-base font-black text-white mb-1">Appearance & Interface Theme</h2>
          <p className="text-xs text-gray-400 mb-5">
            Choose your preferred color mode. Dark theme is the signature ParkEase aesthetic.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Dark */}
            <div
              onClick={() => setTheme("dark")}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                theme === "dark"
                  ? "bg-neon-blue/20 border-neon-blue text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  : "bg-black/20 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#0f172a] border border-white/10 flex items-center justify-center text-lg text-neon-purple">
                <FaMoon />
              </div>
              <div className="text-center">
                <p className="font-bold text-xs text-white">Dark Theme (Default)</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Signature Navy & Neon styling</p>
              </div>
            </div>

            {/* Light */}
            <div
              onClick={() => setTheme("light")}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                theme === "light"
                  ? "bg-neon-blue/20 border-neon-blue text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  : "bg-black/20 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-lg text-amber-500">
                <FaSun />
              </div>
              <div className="text-center">
                <p className="font-bold text-xs text-white">Light Theme</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Clean high-contrast SaaS mode</p>
              </div>
            </div>

            {/* System */}
            <div
              onClick={() => setTheme("system")}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                theme === "system"
                  ? "bg-neon-blue/20 border-neon-blue text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  : "bg-black/20 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-lg text-neon-blue">
                <FaDesktop />
              </div>
              <div className="text-center">
                <p className="font-bold text-xs text-white">System Synchronized</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Adapts to OS preferences ({resolvedTheme})</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Automated Alerts & Notifications */}
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h2 className="text-base font-black text-white">Real-Time Operational Alerts</h2>
            <p className="text-xs text-gray-400 mt-0.5">Control which automated notifications appear in the TopBar Bell</p>
          </div>

          <div className="divide-y divide-white/5 text-xs">
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Ghost Slot & Hardware Anomalies</p>
                <p className="text-gray-400 text-[11px]">Instant alerts when slot states desynchronize from active sessions.</p>
              </div>
              <input
                type="checkbox"
                checked={anomalyAlerts}
                onChange={(e) => setAnomalyAlerts(e.target.checked)}
                className="w-4 h-4 accent-neon-blue cursor-pointer"
              />
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">High Occupancy Warnings</p>
                <p className="text-gray-400 text-[11px]">Alerts when parking lots cross 80% and 95% capacity thresholds.</p>
              </div>
              <input
                type="checkbox"
                checked={bookingAlerts}
                onChange={(e) => setBookingAlerts(e.target.checked)}
                className="w-4 h-4 accent-neon-blue cursor-pointer"
              />
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Financial & Refund Disputes</p>
                <p className="text-gray-400 text-[11px]">Urgent notifications for customer refund claims and payment inquiries.</p>
              </div>
              <input
                type="checkbox"
                checked={financialAlerts}
                onChange={(e) => setFinancialAlerts(e.target.checked)}
                className="w-4 h-4 accent-neon-blue cursor-pointer"
              />
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">System Maintenance Updates</p>
                <p className="text-gray-400 text-[11px]">Database backups and automated cleanup job summaries.</p>
              </div>
              <input
                type="checkbox"
                checked={systemAlerts}
                onChange={(e) => setSystemAlerts(e.target.checked)}
                className="w-4 h-4 accent-neon-blue cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 3. Security & Session Information */}
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h2 className="text-base font-black text-white">Security & Active Session</h2>
            <p className="text-xs text-gray-400 mt-0.5">Cryptographic token expiration and role authorization</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-black/20 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase font-bold text-gray-400">Authenticated Role</span>
              <p className="font-black text-neon-purple mt-0.5">ROLE_ADMIN (Super Administrator)</p>
            </div>
            <div className="p-3 bg-black/20 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase font-bold text-gray-400">JWT Token Expiry</span>
              <p className="font-black text-white mt-0.5">24 Hours (Rolling Refresh)</p>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
