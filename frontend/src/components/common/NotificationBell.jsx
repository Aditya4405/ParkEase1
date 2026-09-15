import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaBell, FaTimes, FaCheckDouble } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api";

export default function NotificationBell({ isAdmin }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (isAdmin) {
      try {
        setLoading(true);
        const data = await api.get("/admin/notifications");
        if (Array.isArray(data) && data.length > 0) {
          setNotifications(data);
        } else {
          // Default initial notifications if empty
          setNotifications([
            {
              id: 1,
              type: "WARNING",
              title: "High Occupancy Warning",
              message: "City Center Parking reached 92% occupancy.",
              createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
              read: false,
              targetUrl: "/admin/live-parking"
            },
            {
              id: 2,
              type: "INFO",
              title: "System Backup Completed",
              message: "Automated daily snapshot completed successfully.",
              createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
              read: true,
              targetUrl: "/admin/dashboard"
            }
          ]);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        setLoading(false);
      }
    } else {
      setNotifications([
        {
          id: 1,
          type: "INFO",
          title: "Welcome to ParkEase",
          message: "Easily find and book real-time parking spaces.",
          createdAt: new Date().toISOString(),
          read: false
        }
      ]);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [isAdmin]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    if (isAdmin) {
      try {
        await api.patch(`/admin/notifications/${id}/read`);
      } catch (e) {}
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (isAdmin) {
      try {
        await api.post("/admin/notifications/mark-all-read");
      } catch (e) {}
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

  const formatTime = (iso) => {
    if (!iso) return "recently";
    const date = new Date(iso);
    const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  const filteredNotifications =
    filter === "ALL"
      ? notifications
      : notifications.filter((n) => n.type === filter);

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer group"
      >
        <FaBell size={14} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-red rounded-full flex items-center justify-center text-white text-[9px] font-black shadow-lg animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-full right-0 mt-2 w-96 bg-[#0f1629] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white">Notification Center</h3>
                  <p className="text-[11px] text-gray-400">
                    {unreadCount} unread update{unreadCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-neon-blue hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors"
                      title="Mark all as read"
                    >
                      <FaCheckDouble size={10} /> Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <FaTimes size={13} />
                  </button>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1 p-2 border-b border-white/5 bg-black/20 text-[11px] font-semibold">
                {["ALL", "CRITICAL", "WARNING", "INFO"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      filter === tab
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-xs">
                    No notifications in this category.
                  </div>
                ) : (
                  filteredNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.id);
                        if (n.targetUrl) {
                          setIsOpen(false);
                          navigate(n.targetUrl);
                        }
                      }}
                      className={`p-3.5 flex items-start gap-3 hover:bg-white/5 transition-all cursor-pointer ${
                        !n.read ? "bg-white/[0.03]" : "opacity-80"
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-xs font-bold truncate ${!n.read ? "text-white" : "text-gray-300"}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-gray-500 flex-shrink-0">
                            {formatTime(n.createdAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                      {!n.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-neon-blue flex-shrink-0 mt-2" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {isAdmin && (
                <div className="p-2.5 border-t border-white/10 bg-black/20 text-center">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/admin/notifications");
                    }}
                    className="text-xs text-neon-blue hover:text-blue-300 font-bold transition-colors"
                  >
                    View All Platform Notifications →
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
