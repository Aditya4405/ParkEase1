import { motion } from "framer-motion";

const money = (amount) => `₹${Math.round(amount || 0).toLocaleString("en-IN")}`;

export default function RevenueChart({ revenueData }) {
    const rawData = revenueData?.dailyRevenue || [];
    const maxAmount = Math.max(...rawData.map((item) => Number(item.amount) || 0), 0);
    const data = rawData.slice(-7).map((item) => ({
        day: item.day,
        amount: money(item.amount),
        value: maxAmount > 0 ? Math.max(8, Math.round(((Number(item.amount) || 0) / maxAmount) * 100)) : 0,
    }));

    return (
        <div className="parkease-card rounded-2xl p-6 relative overflow-hidden shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">7-Day Revenue Velocity</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Daily income generated across completed parking sessions</p>
                </div>
            </div>

            <div className="relative h-48 flex items-end justify-between gap-4 px-2">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                    <div className="w-full h-px border-t border-dashed border-slate-200 dark:border-slate-800"></div>
                    <div className="w-full h-px border-t border-dashed border-slate-200 dark:border-slate-800"></div>
                    <div className="w-full h-px border-t border-dashed border-slate-200 dark:border-slate-800"></div>
                    <div className="w-full h-px border-t border-dashed border-slate-200 dark:border-slate-800"></div>
                    <div className="w-full h-px bg-slate-200 dark:bg-slate-800"></div>
                </div>

                {data.length === 0 && (
                    <div className="relative z-10 w-full h-full flex items-center justify-center text-slate-400 text-xs">
                        No completed booking transactions recorded yet.
                    </div>
                )}

                {data.map((item, index) => (
                    <div key={index} className="flex flex-col items-center gap-2 group w-full relative z-10 h-full justify-end">
                        <div className="relative w-full flex justify-center items-end h-[85%]">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${item.value}%` }}
                                transition={{ duration: 0.7, delay: index * 0.08, type: "spring" }}
                                className="w-full max-w-[28px] bg-gradient-to-t from-primary-600 to-indigo-500 hover:from-primary-700 hover:to-indigo-600 rounded-t-lg relative transition-all shadow-xs cursor-pointer"
                            >
                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg z-20 pointer-events-none whitespace-nowrap">
                                    {item.amount}
                                    <div className="absolute bottom-[-3px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-slate-900 transform rotate-45"></div>
                                </div>
                            </motion.div>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{item.day}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

