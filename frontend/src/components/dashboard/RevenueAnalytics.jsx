import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChartLine, FaCalendarAlt,
  FaCar, FaMotorcycle, FaTruck, FaCarSide, FaClock,
  FaFilter, FaStar, FaChevronDown, FaChevronUp,
} from "react-icons/fa";

// ── helpers ────────────────────────────────────────────
const fmt = (n) => `₹${Math.round(n || 0).toLocaleString("en-IN")}`;

const vehicleLabel = (type) => {
  const labels = { CAR: "Car", BIKE: "Bike", LARGE: "Large", SMALL: "Small" };
  return labels[type] || type || "Vehicle";
};

const toLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toDateKey = (iso) => (iso ? toLocalDateKey(new Date(iso)) : "");

const getPeakTimeSlots = (transactions) => {
  const byHour = {};
  transactions.forEach((t) => {
    if (!t.endTime) return;
    const hour = new Date(t.endTime).getHours();
    const label = `${String(hour).padStart(2, "0")}:00 - ${String(hour + 1).padStart(2, "0")}:00`;
    byHour[label] = (byHour[label] || 0) + t.amount;
  });

  return Object.entries(byHour)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([time, revenue]) => ({ time, revenue }));
};

const vehicleIcon = (type) => {
  switch (type) {
    case "Car": return <FaCar />;
    case "Bike": return <FaMotorcycle />;
    case "Large": return <FaTruck />;
    case "Small": return <FaCarSide />;
    default: return <FaCar />;
  }
};

const colorFor = (idx) => {
  const palette = [
    { bar: "from-neon-purple to-neon-blue", text: "text-neon-purple", bg: "bg-neon-purple", badge: "bg-neon-purple/15 text-neon-purple border-neon-purple/25" },
    { bar: "from-neon-blue to-cyan-400", text: "text-neon-blue", bg: "bg-neon-blue", badge: "bg-neon-blue/15 text-neon-blue border-neon-blue/25" },
    { bar: "from-neon-green to-emerald-400", text: "text-neon-green", bg: "bg-neon-green", badge: "bg-neon-green/15 text-neon-green border-neon-green/25" },
    { bar: "from-orange-400 to-yellow-400", text: "text-orange-400", bg: "bg-orange-400", badge: "bg-orange-400/15 text-orange-400 border-orange-400/25" },
  ];
  return palette[idx % palette.length];
};

// ─────────────────────────────────────────────────────────
export default function RevenueAnalytics({ revenueData, parkings = [] }) {
  const [timeRange, setTimeRange] = useState("week");
  const [parkingFilter, setParkingFilter] = useState("ALL");
  const [vehicleFilter, setVehicleFilter] = useState("ALL");
  const [showTable, setShowTable] = useState(false);
  const [tablePage, setTablePage] = useState(0);
  const PAGE_SIZE = 6;
  const todayKey = toLocalDateKey();
  const currentMonth = todayKey.slice(0, 7);

  const transactions = useMemo(() => {
    return (revenueData?.transactions || []).map((t) => ({
      date: t.date || toDateKey(t.endTime),
      day: t.endTime
        ? new Date(t.endTime).toLocaleDateString("en-IN", { weekday: "short" })
        : "",
      parking: t.parkingName,
      slot: t.slotCode,
      vehicle: t.vehicleNumber,
      vehicleType: vehicleLabel(t.vehicleType),
      amount: Number(t.amount) || 0,
      startTime: t.startTime,
      endTime: t.endTime,
    }));
  }, [revenueData]);

  const parkingLots = useMemo(() => {
    return [...new Set([
      ...parkings.map((p) => p.name).filter(Boolean),
      ...transactions.map((t) => t.parking).filter(Boolean),
    ])];
  }, [parkings, transactions]);

  const vehicleTypes = useMemo(() => {
    return [...new Set(transactions.map((t) => t.vehicleType).filter(Boolean))];
  }, [transactions]);

  // ── filtered transactions ─────────────────────────────
  const filtered = useMemo(() => {
    let txns = [...transactions];
    if (parkingFilter !== "ALL") txns = txns.filter((t) => t.parking === parkingFilter);
    if (vehicleFilter !== "ALL") txns = txns.filter((t) => t.vehicleType === vehicleFilter);
    if (timeRange === "today") txns = txns.filter((t) => t.date === todayKey);
    if (timeRange === "week") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 6);
      const cutoffKey = toLocalDateKey(cutoff);
      txns = txns.filter((t) => t.date && t.date >= cutoffKey);
    }
    if (timeRange === "month") {
      txns = txns.filter((t) => t.date?.startsWith(currentMonth));
    }
    return txns;
  }, [transactions, parkingFilter, vehicleFilter, timeRange, todayKey, currentMonth]);

  // ── overview numbers ──────────────────────────────────
  const totalFiltered = filtered.reduce((s, t) => s + t.amount, 0);

  const totalRevenue = Number(revenueData?.totalRevenue) || 0;
  const weekTotal = filtered.reduce((s, t) => s + t.amount, 0);

  const avgPerDay = Math.round(weekTotal / 7);

  const dayTotals = {};
  filtered.forEach((t) => {
    dayTotals[t.day] = (dayTotals[t.day] || 0) + t.amount;
  });
  const highestDay = Object.entries(dayTotals).sort((a, b) => b[1] - a[1])[0];

  // ── breakdowns ────────────────────────────────────────
  const byParking = useMemo(() => {
    const map = {};
    filtered.forEach((t) => { map[t.parking] = (map[t.parking] || 0) + t.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const byVehicle = useMemo(() => {
    const map = {};
    filtered.forEach((t) => { map[t.vehicleType] = (map[t.vehicleType] || 0) + t.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const maxParkingRev = byParking.length ? byParking[0][1] : 1;
  const maxVehicleRev = byVehicle.length ? byVehicle[0][1] : 1;

  // ── Peak time ─────────────────────────────────────────
  const peakSlots = useMemo(() => getPeakTimeSlots(filtered), [filtered]);

  // ── table ─────────────────────────────────────────────
  const tableData = useMemo(() => [...filtered], [filtered]);
  const totalPages = Math.ceil(tableData.length / PAGE_SIZE);
  const pageSlice = tableData.slice(tablePage * PAGE_SIZE, (tablePage + 1) * PAGE_SIZE);

  // ── card data ─────────────────────────────────────────
  const cards = [
    { title: "Filtered Revenue", value: fmt(weekTotal), icon: <FaChartLine />, color: "purple", trend: null },
    { title: "Total Revenue", value: fmt(totalRevenue), icon: <FaCalendarAlt />, color: "blue", trend: null },
    { title: "Avg / Day", value: fmt(avgPerDay), icon: <FaChartLine />, color: "green", trend: null },
    { title: "Best Day", value: highestDay ? `${highestDay[0]}` : "—", sub: highestDay ? fmt(highestDay[1]) : "", icon: <FaStar />, color: "orange" },
    { title: "Transactions", value: String(filtered.length), icon: <FaChartLine />, color: "red", trend: null },
  ];

  const cardColorMap = {
    purple: "bg-neon-purple/10 border-neon-purple/20 text-neon-purple",
    blue: "bg-neon-blue/10 border-neon-blue/20 text-neon-blue",
    green: "bg-neon-green/10 border-neon-green/20 text-neon-green",
    red: "bg-neon-red/10 border-neon-red/20 text-neon-red",
    orange: "bg-orange-400/10 border-orange-400/20 text-orange-400",
  };

  return (
    <div className="space-y-6">
      {/* ─── SECTION HEADER ──────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="w-2 h-8 rounded-full bg-neon-purple" />
          <div>
            <h3 className="text-xl font-bold text-white">Revenue Analytics</h3>
            <p className="text-xs text-gray-400">Deep-dive into your earnings breakdown</p>
          </div>
        </div>

        {/* ─── FILTERS ─────────────────────────────────── */}
        <div className="flex gap-3 flex-wrap items-center">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs"><FaFilter className="text-neon-blue" /> Filters</div>

          {/* Time Range */}
          <div className="bg-dark-card border border-white/10 rounded-lg p-0.5 flex">
            {[
              { key: "today", label: "Today" },
              { key: "week", label: "This Week" },
              { key: "month", label: "This Month" },
            ].map((r) => (
              <button
                key={r.key}
                onClick={() => setTimeRange(r.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  timeRange === r.key ? "bg-neon-purple text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Parking Filter */}
          <select
            value={parkingFilter}
            onChange={(e) => setParkingFilter(e.target.value)}
            className="bg-dark-card border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-neon-blue transition-colors"
          >
            <option value="ALL">All Parkings</option>
            {parkingLots.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Vehicle Type Filter */}
          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="bg-dark-card border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-neon-blue transition-colors"
          >
            <option value="ALL">All Vehicles</option>
            {vehicleTypes.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── OVERVIEW CARDS ──────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((c, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -4 }}
            className={`p-4 rounded-2xl border backdrop-blur-md relative overflow-hidden group ${cardColorMap[c.color]}`}
          >
            <div className="flex justify-between items-start">
              <p className="text-gray-400 text-[10px] uppercase tracking-wider font-medium">{c.title}</p>
              <span className={`p-2 rounded-lg bg-dark-bg/50 text-sm ${cardColorMap[c.color].split(" ").find((s) => s.startsWith("text-"))}`}>
                {c.icon}
              </span>
            </div>
            <h4 className="text-2xl font-bold text-white mt-1">{c.value}</h4>
            {c.sub && <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>}
            {c.trend !== null && c.trend !== undefined && (
              <p className={`text-[11px] mt-2 font-medium ${c.trend >= 0 ? "text-neon-green" : "text-neon-red"}`}>
                {c.trend >= 0 ? "+" : ""}{c.trend}% <span className="text-gray-500">vs last week</span>
              </p>
            )}
            <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full blur-[30px] opacity-20 group-hover:opacity-40 transition-opacity ${
              c.color === "purple" ? "bg-neon-purple" : c.color === "blue" ? "bg-neon-blue" : c.color === "green" ? "bg-neon-green" : c.color === "red" ? "bg-neon-red" : "bg-orange-400"
            }`} />
          </motion.div>
        ))}
      </div>

      {/* ─── BREAKDOWN SECTION ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Parking Lot */}
        <div className="bg-dark-card/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 relative overflow-hidden">
          <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-neon-blue" /> Revenue by Parking Lot
          </h4>
          <p className="text-[10px] text-gray-500 mb-5 ml-4">Breakdown for selected filters</p>

          {byParking.length === 0 && <p className="text-gray-500 text-sm text-center py-6">No data for filters</p>}

          <div className="space-y-4">
            {byParking.map(([name, rev], i) => {
              const c = colorFor(i);
              const pct = Math.round((rev / maxParkingRev) * 100);
              return (
                <div key={name}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm text-gray-300 font-medium truncate max-w-[60%]">{name}</span>
                    <span className={`text-sm font-bold ${c.text}`}>{fmt(rev)}</span>
                  </div>
                  <div className="w-full h-2 bg-dark-bg rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className={`h-full rounded-full bg-gradient-to-r ${c.bar} shadow-[0_0_8px_rgba(139,92,246,0.3)]`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* total footer */}
          {byParking.length > 0 && (
            <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Total</span>
              <span className="text-lg font-bold text-white">{fmt(totalFiltered)}</span>
            </div>
          )}
        </div>

        {/* Revenue by Vehicle Type */}
        <div className="bg-dark-card/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 relative overflow-hidden">
          <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-neon-green" /> Revenue by Vehicle Type
          </h4>
          <p className="text-[10px] text-gray-500 mb-5 ml-4">Earnings split by vehicle category</p>

          {byVehicle.length === 0 && <p className="text-gray-500 text-sm text-center py-6">No data for filters</p>}

          <div className="space-y-4">
            {byVehicle.map(([type, rev], i) => {
              const c = colorFor(i);
              const pct = Math.round((rev / maxVehicleRev) * 100);
              const share = totalFiltered > 0 ? ((rev / totalFiltered) * 100).toFixed(1) : 0;
              return (
                <div key={type}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm text-gray-300 font-medium flex items-center gap-2">
                      <span className={`${c.text} text-base`}>{vehicleIcon(type)}</span>
                      {type}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${c.badge}`}>{share}%</span>
                    </span>
                    <span className={`text-sm font-bold ${c.text}`}>{fmt(rev)}</span>
                  </div>
                  <div className="w-full h-2 bg-dark-bg rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className={`h-full rounded-full bg-gradient-to-r ${c.bar} shadow-[0_0_8px_rgba(34,197,94,0.3)]`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {byVehicle.length > 0 && (
            <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Total</span>
              <span className="text-lg font-bold text-white">{fmt(totalFiltered)}</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── PEAK REVENUE TIME ───────────────────────── */}
      <div className="bg-dark-card/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <FaClock className="text-orange-400" /> Peak Revenue Hours
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {peakSlots.map((p, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-xl border flex items-center gap-4 ${
                i === 0
                  ? "bg-orange-400/10 border-orange-400/20"
                  : "bg-white/5 border-white/5"
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                i === 0 ? "bg-orange-400/20 text-orange-400" : "bg-white/10 text-gray-400"
              }`}>
                #{i + 1}
              </div>
              <div>
                <p className={`text-lg font-bold ${i === 0 ? "text-orange-400" : "text-white"}`}>{p.time}</p>
                <p className="text-xs text-gray-400">{fmt(p.revenue)} earned</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── DETAILED TABLE ──────────────────────────── */}
      <div className="bg-dark-card/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
        <button
          onClick={() => { setShowTable(!showTable); setTablePage(0); }}
          className="w-full flex justify-between items-center px-6 py-4 text-left hover:bg-white/5 transition-colors"
        >
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-neon-red" /> Detailed Revenue Table
            <span className="text-[10px] text-gray-500 font-normal ml-2">{tableData.length} transactions</span>
          </h4>
          {showTable ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </button>

        <AnimatePresence>
          {showTable && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-t border-white/5 text-[10px] text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Parking</th>
                      <th className="px-6 py-3">Slot</th>
                      <th className="px-6 py-3">Vehicle</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageSlice.map((t, i) => (
                      <tr
                        key={`${t.date}-${t.slot}-${i}`}
                        className="border-t border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-3 text-gray-300 whitespace-nowrap">{t.date}</td>
                        <td className="px-6 py-3 text-white font-medium whitespace-nowrap">{t.parking}</td>
                        <td className="px-6 py-3">
                          <span className="px-2 py-0.5 bg-neon-purple/10 text-neon-purple border border-neon-purple/20 rounded text-xs font-mono font-bold">
                            {t.slot}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gray-400 font-mono text-xs whitespace-nowrap">{t.vehicle}</td>
                        <td className="px-6 py-3">
                          <span className="flex items-center gap-1.5 text-gray-300 text-xs">
                            {vehicleIcon(t.vehicleType)} {t.vehicleType}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right text-neon-green font-bold">{fmt(t.amount)}</td>
                      </tr>
                    ))}
                    {pageSlice.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500">No transactions match the selected filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-white/5">
                  <p className="text-xs text-gray-500">
                    Page {tablePage + 1} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      disabled={tablePage === 0}
                      onClick={() => setTablePage((p) => p - 1)}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 transition-all"
                    >
                      Prev
                    </button>
                    <button
                      disabled={tablePage >= totalPages - 1}
                      onClick={() => setTablePage((p) => p + 1)}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
