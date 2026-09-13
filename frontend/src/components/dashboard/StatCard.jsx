import { motion } from "framer-motion";

export default function StatCard({ title, value, icon, color, trend }) {
    // Map color names to Tailwind classes
    const colorMap = {
        purple: "text-neon-purple shadow-neon-purple",
        blue: "text-neon-blue shadow-neon-blue",
        green: "text-neon-green shadow-neon-green",
        red: "text-neon-red shadow-neon-red",
    };

    const bgMap = {
        purple: "bg-neon-purple/10 border-neon-purple/20",
        blue: "bg-neon-blue/10 border-neon-blue/20",
        green: "bg-neon-green/10 border-neon-green/20",
        red: "bg-neon-red/10 border-neon-red/20",
    }

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`p-6 rounded-2xl border backdrop-blur-md relative overflow-hidden group ${bgMap[color] || "bg-dark-card border-white/10"}`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg bg-dark-bg/50 ${colorMap[color] || "text-white"}`}>
                    {icon}
                </div>
            </div>

            {trend && (
                <div className={`mt-4 text-sm font-medium flex items-center gap-1 ${trend > 0 ? "text-neon-green" : "text-neon-red"}`}>
                    <span>{trend > 0 ? "+" : ""}{trend}%</span>
                    <span className="text-gray-500">vs last week</span>
                </div>
            )}

            {/* Glow Effect */}
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity ${color === 'purple' ? 'bg-neon-purple' : color === 'blue' ? 'bg-neon-blue' : color === 'green' ? 'bg-neon-green' : 'bg-neon-red'}`}></div>
        </motion.div>
    );
}
