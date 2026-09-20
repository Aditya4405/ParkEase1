import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    FaTimes,
    FaParking,
    FaClock,
    FaRupeeSign,
    FaInfoCircle,
    FaCreditCard,
} from "react-icons/fa";

const RATE_PER_HOUR = 50; // ₹50/hr — your backend friend can pass this as a prop later

export default function BookingSummaryModal({ slot, parkingName, onClose }) {
    const navigate = useNavigate();
    const [duration, setDuration] = useState(1);

    const totalAmount = RATE_PER_HOUR * duration;

    const handleProceedToPay = () => {
        navigate("/user/payment", {
            state: {
                slotId: slot.id,
                parkingName,
                duration,
                ratePerHour: RATE_PER_HOUR,
                totalAmount,
            },
        });
    };

    return (
        <AnimatePresence>
            {slot && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ scale: 0.85, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.85, opacity: 0, y: 30 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="relative bg-white dark:bg-[#131C31] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md z-10 overflow-hidden transition-colors duration-200"
                    >
                        {/* Top gradient bar */}
                        <div className="h-1.5 w-full bg-[#5B4DF5]" />

                        <div className="p-6 md:p-7">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        Booking Summary
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                                        Review your booking before payment
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                    <FaTimes size={16} />
                                </button>
                            </div>

                            {/* Info Grid */}
                            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 mb-6">
                                <InfoRow
                                    icon={<FaParking className="text-[#5B4DF5]" />}
                                    label="Parking"
                                    value={parkingName}
                                />
                                <InfoRow
                                    icon={<span className="text-[#5B4DF5] font-bold text-sm">#</span>}
                                    label="Slot ID"
                                    value={
                                        <span className="font-mono text-[#5B4DF5] dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                                            {slot.id}
                                        </span>
                                    }
                                />
                                <InfoRow
                                    icon={<FaRupeeSign className="text-emerald-600 dark:text-emerald-400" />}
                                    label="Rate per hour"
                                    value={
                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                            ₹{RATE_PER_HOUR}/hr
                                        </span>
                                    }
                                />
                            </div>

                            {/* Duration Selector */}
                            <div className="mb-6">
                                <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm font-semibold mb-3">
                                    <FaClock className="text-[#5B4DF5]" />
                                    Select Duration
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((hr) => (
                                        <button
                                            key={hr}
                                            onClick={() => setDuration(hr)}
                                            className={`py-2.5 rounded-xl text-sm font-bold transition-all border cursor-pointer ${duration === hr
                                                    ? "bg-[#5B4DF5] text-white border-[#5B4DF5] shadow-md"
                                                    : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                                                }`}
                                        >
                                            {hr}h
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Total Amount */}
                            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl p-4 mb-6 flex justify-between items-center">
                                <span className="text-emerald-900 dark:text-emerald-200 font-semibold text-sm">Total Amount</span>
                                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                                    ₹{totalAmount}
                                </span>
                            </div>

                            {/* Cancellation Policy */}
                            <div className="flex items-start gap-2 mb-6 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl">
                                <FaInfoCircle className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                <p className="text-xs text-amber-800 dark:text-amber-200/90 leading-relaxed">
                                    <span className="font-bold text-amber-900 dark:text-amber-300">Cancellation Policy:</span>{" "}
                                    Free cancellation within 15 minutes of booking. After that, a
                                    cancellation fee of ₹20 applies.
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 rounded-xl font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleProceedToPay}
                                    className="flex-1 py-3 rounded-xl font-bold text-white bg-[#5B4DF5] hover:bg-[#4F41E5] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                                >
                                    <FaCreditCard />
                                    Proceed to Pay
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function InfoRow({ icon, label, value }) {
    return (
        <div className="flex items-center justify-between px-4 py-3">
            <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                {icon}
                {label}
            </span>
            <span className="text-slate-900 dark:text-white font-semibold text-sm">{value}</span>
        </div>
    );
}
