import { FiActivity } from "react-icons/fi";

/**
 * OccupancyChart - A simple visual representation of parking occupancy
 * Placeholder component for the admin dashboard.
 * Replace with a real chart library (e.g. Recharts) when backend is ready.
 */
export default function OccupancyChart({ data }) {
    const slots = data || [
        { label: "City Mall", occupied: 72, total: 100 },
        { label: "Tech Park", occupied: 45, total: 80 },
        { label: "Station Rd", occupied: 90, total: 120 },
        { label: "Airport", occupied: 30, total: 60 },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <FiActivity className="text-neon-blue" />
                <span className="text-sm text-gray-400">Real-time occupancy across all locations</span>
            </div>
            {slots.map((slot, i) => {
                const pct = Math.round((slot.occupied / slot.total) * 100);
                const color = pct > 80 ? "bg-red-500" : pct > 60 ? "bg-yellow-500" : "bg-neon-blue";
                return (
                    <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-300">{slot.label}</span>
                            <span className="text-gray-400">
                                {slot.occupied}/{slot.total}{" "}
                                <span className={pct > 80 ? "text-red-400" : "text-neon-blue"}>({pct}%)</span>
                            </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${color}`}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
