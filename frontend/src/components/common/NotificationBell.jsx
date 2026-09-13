import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaBell, FaTimes } from "react-icons/fa";

// Dummy notifications for testing
const DUMMY_NOTIFICATIONS = [
    {
        id: 1,
        type: "warning",
        title: "Penalty Warning",
        message: "You have 1 unpaid parking penalty. Pay now to avoid account suspension.",
        timestamp: new Date(Date.now() - 1800000),
        read: false,
    },
    {
        id: 2,
        type: "success",
        title: "Thank You!",
        message: "Thanks for using our parking service! Your last booking was smooth.",
        timestamp: new Date(Date.now() - 3600000),
        read: false,
    },
    {
        id: 3,
        type: "info",
        title: "Maintenance Notice",
        message: "City Mall Parking is under maintenance today. Book alternative venues.",
        timestamp: new Date(Date.now() - 86400000),
        read: true,
    },
];

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS);
    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const deleteNotification = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case "warning":
                return <FaExclamationTriangle className="text-neon-red" />;
            case "success":
                return <FaCheckCircle className="text-neon-green" />;
            case "info":
                return <FaInfoCircle className="text-neon-blue" />;
            default:
                return <FaInfoCircle className="text-gray-400" />;
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return "yesterday";
        return `${diffDays}d ago`;
    };

    return (
        <div className="relative">
            {/* Notification Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all group"
            >
                <FaBell size={16} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-neon-red rounded-full flex items-center justify-center text-white text-[10px] font-black border-2 border-dark-bg">
                        {unreadCount}
                    </span>
                )}
                <span className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/5 transition-colors" />
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-40"
                        />

                        {/* Dropdown Menu */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute top-full right-0 mt-2 w-96 bg-[#0f1629] border border-white/10 rounded-2xl shadow-xl z-50"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-white/10">
                                <div>
                                    <h3 className="text-sm font-black text-white">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <p className="text-xs text-gray-400">
                                            {unreadCount} new notification{unreadCount !== 1 ? "s" : ""}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <FaTimes size={18} className="text-gray-400" />
                                </button>
                            </div>

                            {/* Notifications List */}
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-8 text-center"
                                    >
                                        <FaBell size={32} className="text-gray-600 mx-auto mb-3 opacity-50" />
                                        <p className="text-gray-400 text-sm">No notifications yet</p>
                                        <p className="text-gray-500 text-xs mt-1">
                                            Stay tuned for updates about your parking!
                                        </p>
                                    </motion.div>
                                ) : (
                                    <div className="divide-y divide-white/5">
                                        {notifications.map((notification) => (
                                            <motion.div
                                                key={notification.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10 }}
                                                onClick={() => markAsRead(notification.id)}
                                                className={`p-4 cursor-pointer transition-all group hover:bg-white/5 ${
                                                    !notification.read ? "bg-white/[0.02]" : ""
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {/* Icon */}
                                                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        {getNotificationIcon(notification.type)}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1">
                                                                <p className={`text-sm font-bold ${
                                                                    !notification.read ? "text-white" : "text-gray-400"
                                                                }`}>
                                                                    {notification.title}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                                                    {notification.message}
                                                                </p>
                                                            </div>
                                                            {!notification.read && (
                                                                <span className="w-2 h-2 bg-neon-blue rounded-full flex-shrink-0 mt-1.5" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-600 mt-2">
                                                            {formatTime(notification.timestamp)}
                                                        </p>
                                                    </div>

                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteNotification(notification.id);
                                                        }}
                                                        className="w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-600 hover:text-gray-300 transition-all flex-shrink-0 opacity-0 group-hover:opacity-100"
                                                    >
                                                        <FaTimes size={14} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div className="border-t border-white/10 p-3 text-center">
                                    <button className="text-xs text-neon-blue hover:text-neon-blue/80 font-medium transition-colors">
                                        View All Notifications
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
