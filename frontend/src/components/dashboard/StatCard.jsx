import { motion } from "framer-motion";

export default function StatCard({ title, value, icon, color, trend }) {
    // Map subtle accent for icon container
    const iconStyleMap = {
        purple: "bg-[#EEF2FF] text-[#5B4DF5] dark:bg-indigo-950/60 dark:text-indigo-400",
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
        green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
        red: "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400",
    };

    return (
        <motion.div
            whileHover={{ y: -3 }}
            className="p-5 md:p-6 rounded-2xl bg-white dark:bg-[#131C31] border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden"
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">{title}</p>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5 tracking-tight font-heading">{value}</h3>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shadow-sm ${iconStyleMap[color] || "bg-[#EEF2FF] text-[#5B4DF5] dark:bg-indigo-950/60 dark:text-indigo-400"}`}>
                    {icon}
                </div>
            </div>

            {trend !== undefined && trend !== null && (
                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold">
                    <span className={`px-2 py-0.5 rounded-full ${trend >= 0 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"}`}>
                        {trend > 0 ? "+" : ""}{trend}%
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 font-normal">vs last week</span>
                </div>
            )}
        </motion.div>
    );
}

