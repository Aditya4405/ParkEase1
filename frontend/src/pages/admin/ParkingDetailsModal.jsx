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
        case "OCCUPIED": return "bg-neon-red/15 border-neon-red/30 text-neon-red";
        case "AVAILABLE": return "bg-neon-green/15 border-neon-green/30 text-neon-green";
        case "RESERVED": return "bg-yellow-500/15 border-yellow-500/30 text-yellow-400";
        case "MAINTENANCE": return "bg-gray-500/15 border-gray-500/30 text-gray-400";
        default: return "bg-white/5 border-white/10 text-gray-400";
    }
};

const statusBadge = (value) => {
    const map = {
        APPROVED: "bg-neon-green/20 text-neon-green",
        PENDING: "bg-yellow-500/20 text-yellow-300",
        REJECTED: "bg-neon-red/20 text-neon-red",
        SUSPENDED: "bg-gray-500/20 text-gray-300",
        OPEN: "bg-neon-red/20 text-neon-red",
        IN_REVIEW: "bg-yellow-500/20 text-yellow-300",
        RESOLVED: "bg-neon-green/20 text-neon-green",
    };
    return `inline-flex items-center rounded-xl px-3 py-1 text-xs font-semibold tracking-wide ${map[value] || "bg-white/10 text-gray-300"}`;
};

export default function ParkingDetailsModal({ parking, complaints = [], onClose, onStatusChange }) {
    const slots = parking?.slots || [];

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
            { pct: occ, color: "#ef4444" },
            { pct: avl, color: "#22c55e" },
            { pct: res, color: "#eab308" },
            { pct: mnt, color: "#6b7280" },
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 md:p-8 overflow-y-auto">
            <div className="bg-dark-card/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-5xl shadow-2xl my-4">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-3xl font-bold text-white">{parking.name}</h2>
                            <span className={statusBadge(parking.status)}>{parking.status}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1.5">
                                <FaMapMarkerAlt className="text-neon-blue" /> {parking.location}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <FaUser className="text-neon-purple" /> {parking.owner}
                                {parking.ownerEmail && <span className="text-gray-500 ml-1">({parking.ownerEmail})</span>}
                            </span>
                            <span className="text-gray-500">Submitted: {parking.submitted}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* Stats Row */}
                <div className="p-6 border-b border-white/5">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                            <p className="text-3xl font-bold text-white">{stats.total}</p>
                            <p className="text-xs text-gray-400 mt-1">Total Slots</p>
                        </div>
                        <div className="bg-neon-red/10 border border-neon-red/20 rounded-xl p-3 text-center">
                            <p className="text-3xl font-bold text-neon-red">{stats.occupied}</p>
                            <p className="text-xs text-gray-400 mt-1">Occupied</p>
                        </div>
                        <div className="bg-neon-green/10 border border-neon-green/20 rounded-xl p-3 text-center">
                            <p className="text-3xl font-bold text-neon-green">{stats.available}</p>
                            <p className="text-xs text-gray-400 mt-1">Available</p>
                        </div>
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center">
                            <p className="text-3xl font-bold text-yellow-400">{stats.reserved}</p>
                            <p className="text-xs text-gray-400 mt-1">Reserved</p>
                        </div>
                        <div className="bg-gray-500/10 border border-gray-500/20 rounded-xl p-3 text-center">
                            <p className="text-3xl font-bold text-gray-400">{stats.maintenance}</p>
                            <p className="text-xs text-gray-400 mt-1">Maintenance</p>
                        </div>
                        <div className="bg-neon-purple/10 border border-neon-purple/20 rounded-xl p-3 text-center">
                            <p className="text-3xl font-bold text-neon-purple">₹{parking.pricePerHour || 0}</p>
                            <p className="text-xs text-gray-400 mt-1">Per Hour</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Slot Grid (spans 2 cols) */}
                    <div className="xl:col-span-2 space-y-5">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <FaChartBar className="text-neon-blue" /> Slot Breakdown
                        </h3>

                        {vehicleTypes.length === 0 ? (
                            <div className="text-center py-12 bg-white/5 rounded-xl border border-white/5 border-dashed">
                                <p className="text-gray-500">No slots configured for this parking.</p>
                            </div>
                        ) : (
                            vehicleTypes.map((type) => {
                                const typeSlots = slots.filter((s) => s.vehicleType === type);
                                return (
                                    <div key={type} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                                        <h4 className="text-white font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                                            <span className="text-lg">{vehicleIcon(type)}</span>
                                            {type} Slots
                                            <span className="text-xs text-gray-500 font-normal ml-1">({typeSlots.length})</span>
                                        </h4>
                                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                            {typeSlots.map((slot) => (
                                                <div
                                                    key={slot.slotId}
                                                    className={`h-14 rounded-lg border flex flex-col items-center justify-center text-xs font-bold transition-all ${statusColor(slot.status)}`}
                                                >
                                                    <span className="text-[10px] opacity-70">{slot.slotId}</span>
                                                    <span className="text-sm mt-0.5">{vehicleIcon(slot.vehicleType)}</span>
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
                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
                            <h4 className="text-lg font-bold text-white mb-4">Occupancy</h4>
                            <div className="flex items-center justify-center py-2">
                                <div
                                    className="w-36 h-36 rounded-full relative"
                                    style={{ background: `conic-gradient(${conicGradient})` }}
                                >
                                    <div className="absolute inset-3 rounded-full bg-dark-card border border-white/10 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-black text-white">{stats.occupancyRate}%</span>
                                        <span className="text-[10px] text-gray-400">occupied</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-neon-red" /> Occupied ({stats.occupied})</div>
                                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-neon-green" /> Available ({stats.available})</div>
                                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Reserved ({stats.reserved})</div>
                                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-500" /> Maintenance ({stats.maintenance})</div>
                            </div>
                        </div>

                        {/* Earnings */}
                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
                            <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <FaRupeeSign className="text-neon-green" /> Earnings
                            </h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Total Revenue</span>
                                    <span className="text-neon-green font-bold text-lg">₹{(parking.totalEarnings || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Commission (10%)</span>
                                    <span className="text-neon-purple font-bold">₹{Math.round((parking.totalEarnings || 0) * 0.1).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center border-t border-white/5 pt-2">
                                    <span className="text-gray-400 text-sm">Owner Payout</span>
                                    <span className="text-white font-bold">₹{Math.round((parking.totalEarnings || 0) * 0.9).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Analytics Insights */}
                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
                            <h4 className="text-lg font-bold text-white mb-3">Analytics</h4>
                            <div className="space-y-2">
                                <div className="bg-neon-blue/10 border border-neon-blue/20 rounded-lg p-2.5">
                                    <p className="text-white text-sm font-semibold">Peak Hours</p>
                                    <p className="text-gray-400 text-xs">12:00 PM – 2:00 PM (31% of traffic)</p>
                                </div>
                                <div className="bg-neon-green/10 border border-neon-green/20 rounded-lg p-2.5">
                                    <p className="text-white text-sm font-semibold">Avg. Stay</p>
                                    <p className="text-gray-400 text-xs">2.4 hours per booking</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Complaints */}
                {relatedComplaints.length > 0 && (
                    <div className="px-6 pb-4">
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                            <FaExclamationTriangle className="text-yellow-400" /> Complaints ({relatedComplaints.length})
                        </h3>
                        <div className="space-y-2">
                            {relatedComplaints.map((c) => (
                                <div key={c.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-white text-sm font-semibold">{c.issue}</p>
                                        <p className="text-xs text-gray-500">{c.id} • {c.source} • Severity: {c.severity}</p>
                                    </div>
                                    <span className={statusBadge(c.status)}>{c.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/5 flex flex-wrap justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-semibold hover:bg-white/10 transition-all"
                    >
                        Close
                    </button>
                    {parking.status === "PENDING" ? (
                        <>
                            <button
                                onClick={() => onStatusChange?.(parking.id, "APPROVED")}
                                className="px-5 py-2.5 rounded-xl bg-neon-green/20 text-neon-green font-semibold hover:bg-neon-green/30 transition-all"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => onStatusChange?.(parking.id, "REJECTED")}
                                className="px-5 py-2.5 rounded-xl bg-neon-red/20 text-neon-red font-semibold hover:bg-neon-red/30 transition-all"
                            >
                                Reject
                            </button>
                        </>
                    ) : parking.status !== "REJECTED" && (
                        <button
                            onClick={() => onStatusChange?.(parking.id, "SUSPENDED")}
                            className="px-5 py-2.5 rounded-xl bg-gray-500/20 text-gray-300 font-semibold hover:bg-gray-500/30 transition-all"
                        >
                            Suspend
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
