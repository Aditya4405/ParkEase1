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
                        className="relative bg-white dark:bg-[#131C31] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-sm z-10 overflow-hidden transition-colors duration-200"
                    >
                        <div className="h-1.5 w-full bg-[#5B4DF5]" />
                        <div className="p-6 md:p-7">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Profile</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mt-0.5">{user?.role}</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                    <FaTimes size={15} />
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
                                    className="w-full py-2.5 rounded-xl font-bold text-white bg-[#5B4DF5] hover:bg-[#4F41E5] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4 text-sm cursor-pointer"
                                >
                                    <FaSave /> Save Changes
                                </button>
                            </form>

                            <button
                                onClick={onLogout}
                                className="w-full mt-3 py-2.5 rounded-xl font-bold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
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
            <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5">
                {label}
            </label>
            <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm">
                    {icon}
                </span>
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5B4DF5] focus:ring-2 focus:ring-[#5B4DF5]/15 transition-all text-sm font-medium"
                />
            </div>
        </div>
    );
}
