import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaBell, FaCheckCircle, FaExclamationTriangle, FaInfoCircle,
  FaTimes, FaSpinner, FaCheckDouble
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
        return <FaExclamationTriangle className="text-amber-400" />;
      case "SUCCESS":
        return <FaCheckCircle className="text-neon-green" />;
      case "INFO":
      default:
        return <FaInfoCircle className="text-neon-blue" />;
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
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">System Notification Center</h1>
          <p className="text-xs text-gray-400 mt-1">
            Platform alerts, capacity warnings, payment notices, and infrastructure reports
          </p>
        </div>

        {notifications.some((n) => !n.read) && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-neon-blue font-bold text-xs transition-colors"
          >
            <FaCheckDouble size={11} /> Mark All as Read
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {["ALL", "CRITICAL", "WARNING", "INFO"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filter === tab
                ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/40"
                : "bg-[#1e293b] text-gray-400 border border-white/10 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <FaSpinner className="text-neon-blue text-3xl animate-spin" />
          <p className="text-xs text-gray-400">Loading alerts...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-12 text-center text-gray-400 text-xs">
          No notifications found in this category.
        </div>
      ) : (
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl divide-y divide-white/5 overflow-hidden shadow-xl">
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markAsRead(n.id);
                if (n.targetUrl) navigate(n.targetUrl);
              }}
              className={`p-4 flex items-start gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer ${
                !n.read ? "bg-white/[0.03]" : ""
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-xs font-bold ${!n.read ? "text-white" : "text-gray-300"}`}>
                    {n.title}
                  </h3>
                  <span className="text-[11px] text-gray-500 flex-shrink-0">
                    {fmtTime(n.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  {n.message}
                </p>
              </div>

              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-neon-blue flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
