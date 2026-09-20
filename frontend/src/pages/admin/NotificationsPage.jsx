import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaCheckCircle, FaExclamationTriangle, FaInfoCircle,
  FaSpinner, FaCheckDouble
} from "react-icons/fa";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.get("/admin/notifications");
      setNotifications(data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/admin/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {}
  };

  const markAllAsRead = async () => {
    try {
      await api.post("/admin/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error("Failed to mark all as read");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "CRITICAL":
      case "WARNING":
        return <FaExclamationTriangle className="text-amber-500" />;
      case "SUCCESS":
        return <FaCheckCircle className="text-emerald-500" />;
      case "INFO":
      default:
        return <FaInfoCircle className="text-primary-600 dark:text-primary-400" />;
    }
  };

  const fmtTime = (iso) => !iso ? "—" : new Date(iso).toLocaleString("en-IN", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });

  const filtered =
    filter === "ALL"
      ? notifications
      : notifications.filter((n) => n.type === filter);

  return (
    <DashboardLayout role="ADMIN">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">System Notification Center</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Platform alerts, capacity warnings, payment notices, and infrastructure reports
          </p>
        </div>

        {notifications.some((n) => !n.read) && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all cursor-pointer"
          >
            <FaCheckDouble size={11} /> Mark All as Read
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {["ALL", "CRITICAL", "WARNING", "INFO"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filter === tab
                ? "bg-primary-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <FaSpinner className="text-primary-600 text-3xl animate-spin" />
          <p className="text-xs text-slate-400">Loading alerts...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="parkease-card rounded-2xl p-12 text-center text-slate-400 text-xs shadow-sm">
          No notifications found in this category.
        </div>
      ) : (
        <div className="parkease-card rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-sm">
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markAsRead(n.id);
                if (n.targetUrl) navigate(n.targetUrl);
              }}
              className={`p-4 flex items-start gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${
                !n.read ? "bg-primary-50/30 dark:bg-primary-950/20" : ""
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-xs font-bold ${!n.read ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}>
                    {n.title}
                  </h3>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 flex-shrink-0">
                    {fmtTime(n.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {n.message}
                </p>
              </div>

              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-primary-600 flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
