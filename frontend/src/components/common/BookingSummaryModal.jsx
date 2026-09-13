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
                        className="relative bg-[#0f1629] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden"
                    >
                        {/* Top gradient bar */}
                        <div className="h-1 w-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue" />

                        <div className="p-7">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-white">
                                        Booking Summary
                                    </h3>
                                    <p className="text-gray-400 text-sm mt-1">
                                        Review your booking before payment
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                                >
                                    <FaTimes size={18} />
                                </button>
                            </div>

                            {/* Info Grid */}
                            <div className="bg-white/5 rounded-xl border border-white/10 divide-y divide-white/5 mb-6">
                                <InfoRow
                                    icon={<FaParking className="text-neon-blue" />}
                                    label="Parking"
                                    value={parkingName}
                                />
                                <InfoRow
                                    icon={<span className="text-neon-purple font-bold text-sm">#</span>}
                                    label="Slot ID"
                                    value={
                                        <span className="font-mono text-neon-purple font-bold bg-neon-purple/10 px-2 py-0.5 rounded border border-neon-purple/20">
                                            {slot.id}
                                        </span>
                                    }
                                />
                                <InfoRow
                                    icon={<FaRupeeSign className="text-neon-green" />}
                                    label="Rate per hour"
                                    value={
                                        <span className="text-neon-green font-bold">
                                            ₹{RATE_PER_HOUR}/hr
                                        </span>
                                    }
                                />
                            </div>

                            {/* Duration Selector */}
                            <div className="mb-6">
                                <label className="flex items-center gap-2 text-gray-300 text-sm font-semibold mb-3">
                                    <FaClock className="text-neon-blue" />
                                    Select Duration
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((hr) => (
                                        <button
                                            key={hr}
                                            onClick={() => setDuration(hr)}
                                            className={`py-2.5 rounded-lg text-sm font-bold transition-all border ${duration === hr
                                                    ? "bg-neon-blue text-white border-neon-blue shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                                    : "bg-white/5 text-gray-400 border-white/10 hover:border-white/30 hover:text-white"
                                                }`}
                                        >
                                            {hr}h
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Total Amount */}
                            <div className="bg-gradient-to-r from-neon-green/10 to-transparent border border-neon-green/20 rounded-xl p-4 mb-6 flex justify-between items-center">
                                <span className="text-gray-300 font-semibold">Total Amount</span>
                                <span className="text-3xl font-black text-neon-green">
                                    ₹{totalAmount}
                                </span>
                            </div>

                            {/* Cancellation Policy */}
                            <div className="flex items-start gap-2 mb-6 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                                <FaInfoCircle className="text-yellow-500 mt-0.5 shrink-0" />
                                <p className="text-xs text-yellow-200/70 leading-relaxed">
                                    <span className="font-bold text-yellow-400">Cancellation Policy:</span>{" "}
                                    Free cancellation within 15 minutes of booking. After that, a
                                    cancellation fee of ₹20 applies.
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3.5 rounded-xl font-bold text-gray-300 border border-white/10 hover:border-white/30 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleProceedToPay}
                                    className="flex-1 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-neon-blue to-neon-purple hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all flex items-center justify-center gap-2"
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
            <span className="flex items-center gap-2 text-gray-400 text-sm">
                {icon}
                {label}
            </span>
            <span className="text-white font-semibold text-sm">{value}</span>
        </div>
    );
}
