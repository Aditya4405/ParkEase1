import { motion } from "framer-motion";

const money = (amount) => `₹${Math.round(amount || 0).toLocaleString("en-IN")}`;

export default function RevenueChart({ revenueData }) {
    const rawData = revenueData?.dailyRevenue || [];
    const maxAmount = Math.max(...rawData.map((item) => Number(item.amount) || 0), 0);
    const data = rawData.slice(-7).map((item) => ({
        day: item.day,
        amount: money(item.amount),
        value: maxAmount > 0 ? Math.max(6, Math.round(((Number(item.amount) || 0) / maxAmount) * 100)) : 0,
    }));

    return (
        <div className="bg-dark-card/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white">Revenue Trends</h3>
                    <p className="text-xs text-gray-400">Daily earnings from completed bookings</p>
                </div>
            </div>

            <div className="relative h-40 flex items-end justify-between gap-4 px-2">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                    <div className="w-full h-px bg-white/20 border-t border-dashed border-white/50"></div>
                    <div className="w-full h-px bg-white/20 border-t border-dashed border-white/50"></div>
                    <div className="w-full h-px bg-white/20 border-t border-dashed border-white/50"></div>
                    <div className="w-full h-px bg-white/20 border-t border-dashed border-white/50"></div>
                    <div className="w-full h-px bg-white"></div> {/* Base line */}
                </div>

                {data.length === 0 && (
                    <div className="relative z-10 w-full h-full flex items-center justify-center text-gray-500 text-sm">
                        No completed booking revenue yet.
                    </div>
                )}

                {data.map((item, index) => (
                    <div key={index} className="flex flex-col items-center gap-2 group w-full relative z-10 h-full justify-end">
                        <div className="relative w-full flex justify-center items-end h-[85%]">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${item.value}%` }}
                                transition={{ duration: 0.8, delay: index * 0.1, type: "spring" }}
                                className="w-full max-w-[24px] bg-gradient-to-t from-neon-purple/80 to-neon-blue rounded-t-md relative group-hover:from-neon-purple group-hover:to-neon-blue/80 transition-all shadow-[0_0_10px_rgba(139,92,246,0.3)] hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] cursor-pointer"
                            >
                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-dark-bg text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 border border-white/10 whitespace-nowrap shadow-xl z-20 pointer-events-none">
                                    {item.amount}
                                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-dark-bg border-r border-b border-white/10 transform rotate-45"></div>
                                </div>
                            </motion.div>
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{item.day}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
