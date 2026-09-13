import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaTimes,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaSignOutAlt,
    FaSave,
} from "react-icons/fa";

export default function ProfileModal({ isOpen, onClose, user, onSave, onLogout }) {
    const [form, setForm] = useState({ name: "", email: "", phone: "" });

    useEffect(() => {
        if (user) setForm({ name: user.name, email: user.email, phone: user.phone });
    }, [user]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...user, ...form });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 20 }}
                        className="relative bg-[#0f1629] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm z-10 overflow-hidden"
                    >
                        <div className="h-1 w-full bg-gradient-to-r from-neon-blue to-neon-purple" />
                        <div className="p-7">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Edit Profile</h3>
                                    <p className="text-gray-500 text-sm">{user?.role}</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Field
                                    icon={<FaUser />}
                                    label="Full Name"
                                    type="text"
                                    value={form.name}
                                    onChange={(v) => setForm({ ...form, name: v })}
                                />
                                <Field
                                    icon={<FaEnvelope />}
                                    label="Email"
                                    type="email"
                                    value={form.email}
                                    onChange={(v) => setForm({ ...form, email: v })}
                                />
                                <Field
                                    icon={<FaPhone />}
                                    label="Phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={(v) => setForm({ ...form, phone: v })}
                                />

                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-neon-blue to-neon-purple hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center gap-2 mt-2"
                                >
                                    <FaSave /> Save Changes
                                </button>
                            </form>

                            <button
                                onClick={onLogout}
                                className="w-full mt-3 py-3 rounded-xl font-bold text-neon-red border border-neon-red/20 hover:bg-neon-red/10 transition-all flex items-center justify-center gap-2"
                            >
                                <FaSignOutAlt /> Logout
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function Field({ icon, label, type, value, onChange }) {
    return (
        <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                {label}
            </label>
            <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    {icon}
                </span>
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-blue/50 focus:bg-neon-blue/5 transition-all text-sm"
                />
            </div>
        </div>
    );
}
