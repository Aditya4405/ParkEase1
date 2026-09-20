import { useMemo } from "react";
import {
    FaTimes,
    FaCar,
    FaMotorcycle,
    FaTruck,
    FaCarSide,
    FaMapMarkerAlt,
    FaUser,
    FaChartBar,
    FaExclamationTriangle,
    FaRupeeSign,
} from "react-icons/fa";

const vehicleIcon = (type) => {
    switch (type) {
        case "CAR": return <FaCar />;
        case "BIKE": return <FaMotorcycle />;
        case "LARGE": return <FaTruck />;
        case "SMALL": return <FaCarSide />;
        default: return <FaCar />;
    }
};

const statusColor = (status) => {
    switch (status) {
        case "OCCUPIED": return "bg-primary-50 dark:bg-primary-950/40 border-primary-200 dark:border-primary-800/60 text-primary-700 dark:text-primary-300";
        case "AVAILABLE": return "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300";
        case "RESERVED": return "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300";
        case "MAINTENANCE": return "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400";
        default: return "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-500";
    }
};

const statusBadge = (value) => {
    const map = {
        APPROVED: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60",
        PENDING: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60",
        REJECTED: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60",
        SUSPENDED: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700",
        OPEN: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60",
        IN_REVIEW: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60",
        RESOLVED: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60",
    };
    return `inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${map[value] || "bg-slate-100 text-slate-700 border-slate-200"}`;
};

export default function ParkingDetailsModal({ parking, complaints = [], onClose, onStatusChange }) {
    const rawSlots = parking?.slots;
    const slots = useMemo(() => rawSlots || [], [rawSlots]);

    const stats = useMemo(() => {
        const occupied = slots.filter((s) => s.status === "OCCUPIED").length;
        const available = slots.filter((s) => s.status === "AVAILABLE").length;
        const reserved = slots.filter((s) => s.status === "RESERVED").length;
        const maintenance = slots.filter((s) => s.status === "MAINTENANCE").length;
        const total = slots.length;
        const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
        return { occupied, available, reserved, maintenance, total, occupancyRate };
    }, [slots]);

    const vehicleTypes = useMemo(() => {
        return [...new Set(slots.map((s) => s.vehicleType))];
    }, [slots]);

    const relatedComplaints = (complaints || []).filter(
        (c) => c.parkingName === parking?.name || c.parkingId === parking?.id
    );

    // Occupancy donut segments
    const segments = useMemo(() => {
        const total = stats.total || 1;
        const occ = (stats.occupied / total) * 100;
        const avl = (stats.available / total) * 100;
        const res = (stats.reserved / total) * 100;
        const mnt = (stats.maintenance / total) * 100;

        let offset = 0;
        const result = [];
        const colors = [
            { pct: occ, color: "#5B4DF5" },
            { pct: avl, color: "#10b981" },
            { pct: res, color: "#f59e0b" },
            { pct: mnt, color: "#64748b" },
        ];
        for (const seg of colors) {
            result.push({ offset, pct: seg.pct, color: seg.color });
            offset += seg.pct;
        }
        return result;
    }, [stats]);

    const conicGradient = segments
        .map((s) => `${s.color} ${s.offset}% ${s.offset + s.pct}%`)
        .join(", ");

    if (!parking) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-start justify-center p-4 md:p-8 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl my-4 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{parking.name}</h2>
                            <span className={statusBadge(parking.status)}>{parking.status}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <FaMapMarkerAlt className="text-primary-600 dark:text-primary-400" /> {parking.location}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <FaUser className="text-purple-600 dark:text-purple-400" /> {parking.owner}
                                {parking.ownerEmail && <span className="text-slate-400 ml-1">({parking.ownerEmail})</span>}
                            </span>
                            <span className="text-slate-400">Submitted: {parking.submitted}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* Stats Row */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/30">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-center shadow-xs">
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total Slots</p>
                        </div>
                        <div className="bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800/50 rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stats.occupied}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Occupied</p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.available}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Available</p>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.reserved}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Reserved</p>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">{stats.maintenance}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Maintenance</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">₹{parking.pricePerHour || 0}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Per Hour</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Slot Grid (spans 2 cols) */}
                    <div className="xl:col-span-2 space-y-5">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <FaChartBar className="text-primary-600 dark:text-primary-400" /> Slot Breakdown
                        </h3>

                        {vehicleTypes.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800 border-dashed">
                                <p className="text-slate-500 dark:text-slate-400 text-xs">No slots configured for this parking.</p>
                            </div>
                        ) : (
                            vehicleTypes.map((type) => {
                                const typeSlots = slots.filter((s) => s.vehicleType === type);
                                return (
                                    <div key={type} className="bg-slate-50/70 dark:bg-slate-850/50 border border-slate-200/70 dark:border-slate-800 rounded-xl p-4">
                                        <h4 className="text-slate-900 dark:text-white font-bold mb-3 flex items-center gap-2 text-xs uppercase tracking-wider">
                                            <span className="text-base">{vehicleIcon(type)}</span>
                                            {type} Slots
                                            <span className="text-xs text-slate-400 font-normal ml-1">({typeSlots.length})</span>
                                        </h4>
                                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                            {typeSlots.map((slot) => (
                                                <div
                                                    key={slot.slotId}
                                                    className={`h-14 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all ${statusColor(slot.status)}`}
                                                >
                                                    <span className="text-[10px] opacity-75">{slot.slotId}</span>
                                                    <span className="text-xs mt-0.5">{vehicleIcon(slot.vehicleType)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Right side: Occupancy + Earnings + Analytics */}
                    <div className="space-y-5">
                        {/* Occupancy Donut */}
                        <div className="bg-slate-50/70 dark:bg-slate-850/50 border border-slate-200/70 dark:border-slate-800 rounded-xl p-5">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Occupancy</h4>
                            <div className="flex items-center justify-center py-2">
                                <div
                                    className="w-36 h-36 rounded-full relative"
                                    style={{ background: `conic-gradient(${conicGradient})` }}
                                >
                                    <div className="absolute inset-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.occupancyRate}%</span>
                                        <span className="text-[10px] text-slate-400">occupied</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300"><span className="w-2 h-2 rounded-full bg-primary-600" /> Occupied ({stats.occupied})</div>
                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Available ({stats.available})</div>
                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300"><span className="w-2 h-2 rounded-full bg-amber-500" /> Reserved ({stats.reserved})</div>
                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300"><span className="w-2 h-2 rounded-full bg-slate-400" /> Maint. ({stats.maintenance})</div>
                            </div>
                        </div>

                        {/* Earnings */}
                        <div className="bg-slate-50/70 dark:bg-slate-850/50 border border-slate-200/70 dark:border-slate-800 rounded-xl p-5">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <FaRupeeSign className="text-emerald-600 dark:text-emerald-400" /> Earnings
                            </h4>
                            <div className="space-y-2.5">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 dark:text-slate-400 text-xs">Total Revenue</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-base">₹{(parking.totalEarnings || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 dark:text-slate-400 text-xs">Commission (10%)</span>
                                    <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">₹{Math.round((parking.totalEarnings || 0) * 0.1).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center border-t border-slate-200/80 dark:border-slate-700/80 pt-2">
                                    <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Owner Payout</span>
                                    <span className="text-slate-900 dark:text-white font-bold text-sm">₹{Math.round((parking.totalEarnings || 0) * 0.9).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Analytics Insights */}
                        <div className="bg-slate-50/70 dark:bg-slate-850/50 border border-slate-200/70 dark:border-slate-800 rounded-xl p-5">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Analytics</h4>
                            <div className="space-y-2">
                                <div className="bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800/50 rounded-lg p-2.5">
                                    <p className="text-primary-800 dark:text-primary-300 text-xs font-bold">Peak Hours</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">12:00 PM – 2:00 PM (31% of traffic)</p>
                                </div>
                                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg p-2.5">
                                    <p className="text-emerald-800 dark:text-emerald-300 text-xs font-bold">Avg. Stay Duration</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">2.4 hours per booking</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Complaints */}
                {relatedComplaints.length > 0 && (
                    <div className="px-6 pb-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <FaExclamationTriangle className="text-amber-500" /> Complaints ({relatedComplaints.length})
                        </h3>
                        <div className="space-y-2">
                            {relatedComplaints.map((c) => (
                                <div key={c.id} className="bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-900 dark:text-white text-xs font-semibold">{c.issue}</p>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{c.id} • {c.source} • Severity: {c.severity}</p>
                                    </div>
                                    <span className={statusBadge(c.status)}>{c.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap justify-end gap-3 bg-slate-50/50 dark:bg-slate-850/30">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-750 transition-all cursor-pointer shadow-xs"
                    >
                        Close
                    </button>
                    {parking.status === "PENDING" ? (
                        <>
                            <button
                                onClick={() => onStatusChange?.(parking.id, "APPROVED")}
                                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer shadow-sm"
                            >
                                Approve Facility
                            </button>
                            <button
                                onClick={() => onStatusChange?.(parking.id, "REJECTED")}
                                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all cursor-pointer shadow-sm"
                            >
                                Reject
                            </button>
                        </>
                    ) : parking.status !== "REJECTED" && (
                        <button
                            onClick={() => onStatusChange?.(parking.id, "SUSPENDED")}
                            className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer"
                        >
                            Suspend
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
