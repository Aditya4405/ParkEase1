import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { useLocation } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaUsers, FaParking, FaMoneyBillWave, FaCar,
  FaCheckCircle, FaClock, FaTimesCircle, FaSpinner,
  FaBuilding, FaShieldAlt, FaChartBar, FaExclamationTriangle,
  FaBan, FaUserCheck, FaTrash, FaWrench, FaSearch,
} from "react-icons/fa";
import { api } from "../../api/api";

// ── Helpers ───────────────────────────────────────────────────────────────────
function StatTile({ label, value, icon, color }) {
  const colors = {
    blue:   "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400",
    green:  "from-neon-green/20 to-green-600/10 border-neon-green/30 text-neon-green",
    purple: "from-neon-purple/20 to-purple-600/10 border-neon-purple/30 text-neon-purple",
    red:    "from-neon-red/20 to-red-600/10 border-neon-red/30 text-neon-red",
    yellow: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 text-yellow-400",
    gray:   "from-gray-500/20 to-gray-600/10 border-gray-500/30 text-gray-400",
  };
  return (
    <motion.div whileHover={{ y: -3 }}
      className={`bg-gradient-to-br ${colors[color] || colors.blue} border rounded-2xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-400 text-xs uppercase tracking-wider">{label}</p>
        <span className="text-xl opacity-80">{icon}</span>
      </div>
      <p className="text-3xl font-black text-white">{value}</p>
    </motion.div>
  );
}

function StatusBadge({ status }) {
  const map = {
    ACTIVE:          "bg-neon-blue/20 text-neon-blue border-neon-blue/30 animate-pulse",
    COMPLETED:       "bg-neon-green/20 text-neon-green border-neon-green/30",
    CANCELLED:       "bg-neon-red/20 text-neon-red border-neon-red/30",
    PENDING:         "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    SUSPENDED:       "bg-neon-red/20 text-neon-red border-neon-red/30",
    PAYMENT_PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${map[status] || map.PENDING}`}>
      {status}
    </span>
  );
}

function SectionSpinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <FaSpinner className="text-neon-blue text-4xl animate-spin" />
    </div>
  );
}

const fmtTime   = (iso) => !iso ? "—" : new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const fmtMoney  = (n)   => `₹${(n || 0).toFixed(0)}`;

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const location = useLocation();

  // Derive active section from URL path
  const getSection = (path) => {
    if (path.includes("/users"))       return "users";
    if (path.includes("/parkings"))    return "parkings";
    if (path.includes("/bookings"))    return "bookings";
    if (path.includes("/revenue"))     return "revenue";
    if (path.includes("/ghost-slots")) return "ghost-slots";
    return "overview";
  };

  const section = getSection(location.pathname);

  // Data states per section
  const [stats,      setStats]      = useState(null);
  const [users,      setUsers]      = useState([]);
  const [parkings,   setParkings]   = useState([]);
  const [bookings,   setBookings]   = useState([]);
  const [revenue,    setRevenue]    = useState(null);
  const [ghosts,     setGhosts]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");

  // Load data based on active section
  const load = useCallback(async () => {
    setLoading(true);
    setSearch("");
    try {
      if (section === "overview") {
        const data = await api.get("/admin/stats");
        setStats(data);
      } else if (section === "users") {
        const data = await api.get("/admin/users");
        setUsers(data);
      } else if (section === "parkings") {
        const data = await api.get("/admin/parkings");
        setParkings(data);
      } else if (section === "bookings") {
        const data = await api.get("/admin/bookings");
        setBookings(data);
      } else if (section === "revenue") {
        const data = await api.get("/admin/revenue");
        setRevenue(data);
      } else if (section === "ghost-slots") {
        const data = await api.get("/admin/ghost-slots");
        setGhosts(data);
      }
    } catch (err) {
      toast.error("Failed to load data: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [section]);

  useEffect(() => { load(); }, [load]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleUserStatus = async (userId, status) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status });
      toast.success(`User ${status.toLowerCase()}`);
      const data = await api.get("/admin/users");
      setUsers(data);
    } catch (err) { toast.error(err.message); }
  };

  const handleDeleteParking = async (parkingId, name) => {
    if (!window.confirm(`Delete "${name}" and all its slots? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/parkings/${parkingId}`);
      toast.success("Parking deleted.");
      const data = await api.get("/admin/parkings");
      setParkings(data);
    } catch (err) { toast.error(err.message); }
  };

  const handleFixAllGhosts = async () => {
    try {
      const res = await api.post("/admin/ghost-slots/fix-all", {});
      toast.success(`Fixed ${res.count} ghost slot(s).`);
      const data = await api.get("/admin/ghost-slots");
      setGhosts(data);
    } catch (err) { toast.error(err.message); }
  };

  // ── Search filter helpers ─────────────────────────────────────────────────
  const filterList = (list, keys) =>
    !search ? list : list.filter(item =>
      keys.some(k => String(item[k] || "").toLowerCase().includes(search.toLowerCase()))
    );

  return (
    <>
      <ToastContainer theme="dark" position="top-right" autoClose={3000}
        style={{ zIndex: 9999, top: "5rem", right: "1rem" }} />

      <DashboardLayout role="ADMIN">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1 capitalize">
              {section === "ghost-slots" ? "Ghost Slots" : section === "overview" ? "Admin Dashboard" : section}
            </h2>
            <p className="text-gray-400 text-sm">Platform-wide overview — ParkEase</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search bar for list pages */}
            {["users","parkings","bookings"].includes(section) && (
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                <FaSearch className="text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder={`Search ${section}...`}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-transparent text-white text-sm placeholder-gray-500 outline-none w-48"
                />
              </div>
            )}
            <div className="flex items-center gap-2 px-4 py-2 bg-neon-purple/10 border border-neon-purple/30 rounded-xl">
              <FaShieldAlt className="text-neon-purple" />
              <span className="text-neon-purple font-bold text-sm">ADMIN</span>
            </div>
          </div>
        </div>

        {loading ? <SectionSpinner /> : (
          <AnimatePresence mode="wait">
            <motion.div key={section}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >

              {/* ── OVERVIEW ─────────────────────────────────────────────── */}
              {section === "overview" && stats && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatTile label="Total Users"     value={stats.totalUsers}     icon={<FaUsers />}         color="blue" />
                    <StatTile label="Total Owners"    value={stats.totalOwners}    icon={<FaBuilding />}      color="purple" />
                    <StatTile label="Total Parkings"  value={stats.totalParkings}  icon={<FaParking />}       color="green" />
                    <StatTile label="Total Slots"     value={stats.totalSlots}     icon={<FaCar />}           color="gray" />
                    <StatTile label="Active Bookings" value={stats.activeBookings} icon={<FaClock />}         color="yellow" />
                    <StatTile label="Total Bookings"  value={stats.totalBookings}  icon={<FaChartBar />}      color="blue" />
                    <StatTile label="Platform Revenue" value={fmtMoney(stats.totalRevenue)} icon={<FaMoneyBillWave />} color="green" />
                    <StatTile label="Occupied Slots"  value={stats.occupiedSlots}  icon={<FaTimesCircle />}   color="red" />
                  </div>

                  {/* Slot Health */}
                  <div className="bg-dark-card/60 border border-white/5 rounded-2xl p-6 mb-8">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                      <FaCar className="text-neon-blue" /> Slot Health
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {[
                        { label: "Available",   value: stats.availableSlots,   color: "text-neon-green",  bar: "bg-neon-green" },
                        { label: "Occupied",    value: stats.occupiedSlots,    color: "text-neon-red",    bar: "bg-neon-red" },
                        { label: "Reserved",    value: stats.reservedSlots,    color: "text-yellow-400",  bar: "bg-yellow-400" },
                        { label: "Maintenance", value: stats.maintenanceSlots, color: "text-gray-400",    bar: "bg-gray-500" },
                        { label: "Disabled",    value: stats.disabledSlots,    color: "text-gray-600",    bar: "bg-gray-700" },
                      ].map(({ label, value, color, bar }) => {
                        const pct = stats.totalSlots > 0 ? ((value / stats.totalSlots) * 100).toFixed(1) : 0;
                        return (
                          <div key={label} className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <p className={`text-2xl font-black ${color}`}>{value}</p>
                            <p className="text-gray-500 text-xs uppercase mt-1">{label}</p>
                            <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
                            </div>
                            <p className="text-gray-600 text-[10px] mt-1">{pct}%</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary + Slot breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-dark-card/60 border border-white/5 rounded-2xl p-6">
                      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <FaChartBar className="text-neon-blue" /> Platform Summary
                      </h3>
                      <div className="space-y-3">
                        {[
                          { label: "Registered Users",  value: stats.totalUsers },
                          { label: "Parking Owners",    value: stats.totalOwners },
                          { label: "Parking Lots",      value: stats.totalParkings },
                          { label: "Total Slots",       value: stats.totalSlots },
                          { label: "Bookings All Time", value: stats.totalBookings },
                          { label: "Active Right Now",  value: stats.activeBookings },
                          { label: "Platform Revenue",  value: fmtMoney(stats.totalRevenue) },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                            <span className="text-gray-400 text-sm">{label}</span>
                            <span className="text-white font-bold">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-dark-card/60 border border-white/5 rounded-2xl p-6">
                      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <FaCar className="text-neon-green" /> Recent Bookings
                      </h3>
                      <div className="space-y-2">
                        {(stats.recentBookings || []).slice(0, 5).map(b => (
                          <div key={b.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                            <div>
                              <p className="text-white text-sm font-medium">{b.userName}</p>
                              <p className="text-gray-500 text-xs">{b.parkingName} · {b.slotCode}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-neon-green font-bold text-sm">{b.amount != null ? `₹${b.amount}` : "—"}</p>
                              <StatusBadge status={b.status} />
                            </div>
                          </div>
                        ))}
                        {!(stats.recentBookings?.length) && <p className="text-gray-500 text-sm">No bookings yet.</p>}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── USERS ────────────────────────────────────────────────── */}
              {section === "users" && (
                <div className="bg-dark-card/60 border border-white/5 rounded-2xl overflow-hidden">
                  <div className="p-5 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-white font-bold">All Users ({users.length})</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                          <th className="py-3 px-5">Name</th>
                          <th className="py-3 px-5">Email / Phone</th>
                          <th className="py-3 px-5">Role</th>
                          <th className="py-3 px-5">Bookings</th>
                          <th className="py-3 px-5">Outstanding</th>
                          <th className="py-3 px-5">Status</th>
                          <th className="py-3 px-5">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filterList(users, ["name","email","role"]).map(u => (
                          <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="hover:bg-white/5 transition-colors text-sm">
                            <td className="py-3 px-5">
                              <p className="text-white font-medium">{u.name}</p>
                              <p className="text-gray-500 text-xs">ID: {u.id}</p>
                            </td>
                            <td className="py-3 px-5">
                              <p className="text-gray-300">{u.email}</p>
                              <p className="text-gray-500 text-xs">{u.phone || "—"}</p>
                            </td>
                            <td className="py-3 px-5">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                                u.role === "ADMIN" ? "bg-neon-purple/20 text-neon-purple border-neon-purple/30" :
                                u.role === "OWNER" ? "bg-neon-blue/20 text-neon-blue border-neon-blue/30" :
                                "bg-gray-500/20 text-gray-400 border-gray-500/30"
                              }`}>{u.role}</span>
                            </td>
                            <td className="py-3 px-5 text-gray-300">{u.totalBookings}</td>
                            <td className="py-3 px-5">
                              {u.outstanding > 0
                                ? <span className="text-neon-red font-bold">₹{u.outstanding}</span>
                                : <span className="text-gray-500">—</span>}
                            </td>
                            <td className="py-3 px-5"><StatusBadge status={u.accountStatus} /></td>
                            <td className="py-3 px-5">
                              <div className="flex gap-2">
                                {u.accountStatus !== "ACTIVE" && (
                                  <button onClick={() => handleUserStatus(u.id, "ACTIVE")}
                                    className="p-1.5 rounded-lg bg-neon-green/10 text-neon-green hover:bg-neon-green/20 border border-neon-green/20 transition-all"
                                    title="Activate">
                                    <FaUserCheck size={12} />
                                  </button>
                                )}
                                {u.accountStatus === "ACTIVE" && u.role !== "ADMIN" && (
                                  <button onClick={() => handleUserStatus(u.id, "SUSPENDED")}
                                    className="p-1.5 rounded-lg bg-neon-red/10 text-neon-red hover:bg-neon-red/20 border border-neon-red/20 transition-all"
                                    title="Suspend">
                                    <FaBan size={12} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                        {filterList(users, ["name","email","role"]).length === 0 && (
                          <tr><td colSpan={7} className="py-10 text-center text-gray-500">No users found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── PARKINGS ─────────────────────────────────────────────── */}
              {section === "parkings" && (
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm">{parkings.length} parking lots registered</p>
                  {filterList(parkings, ["name","location","ownerName"]).map((p, i) => (
                    <motion.div key={p.id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-dark-card/60 border border-white/5 rounded-2xl p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-neon-blue">
                            <FaBuilding />
                          </div>
                          <div>
                            <p className="text-white font-bold">{p.name}</p>
                            <p className="text-gray-500 text-xs">{p.location}</p>
                            <p className="text-gray-600 text-xs mt-0.5">Owner: {p.ownerName} · {p.ownerEmail}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <p className="text-white font-bold">{p.totalSlots}</p>
                            <p className="text-gray-500 text-xs">Slots</p>
                          </div>
                          <div className="text-center">
                            <p className={`font-bold ${p.occupancyRate > 75 ? "text-neon-red" : "text-neon-blue"}`}>
                              {p.occupancyRate}%
                            </p>
                            <p className="text-gray-500 text-xs">Occupancy</p>
                          </div>
                          <div className="text-center">
                            <p className="text-neon-blue font-bold">{p.bookingCount}</p>
                            <p className="text-gray-500 text-xs">Bookings</p>
                          </div>
                          <div className="text-center">
                            <p className="text-neon-green font-bold">{fmtMoney(p.revenue)}</p>
                            <p className="text-gray-500 text-xs">Revenue</p>
                          </div>
                          <button onClick={() => handleDeleteParking(p.id, p.name)}
                            className="p-2 rounded-lg bg-neon-red/10 text-neon-red hover:bg-neon-red/20 border border-neon-red/20 transition-all"
                            title="Delete Parking">
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </div>
                      {/* Occupancy bar */}
                      <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${p.occupancyRate > 75 ? "bg-neon-red" : "bg-neon-blue"}`}
                          style={{ width: `${p.occupancyRate}%` }} />
                      </div>
                    </motion.div>
                  ))}
                  {filterList(parkings, ["name","location","ownerName"]).length === 0 && (
                    <div className="text-center py-20 text-gray-500">No parkings found.</div>
                  )}
                </div>
              )}

              {/* ── BOOKINGS ─────────────────────────────────────────────── */}
              {section === "bookings" && (
                <div className="bg-dark-card/60 border border-white/5 rounded-2xl overflow-hidden">
                  <div className="p-5 border-b border-white/5">
                    <h3 className="text-white font-bold">All Bookings ({bookings.length})</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                          <th className="py-3 px-5">ID</th>
                          <th className="py-3 px-5">User</th>
                          <th className="py-3 px-5">Parking · Slot</th>
                          <th className="py-3 px-5">Vehicle</th>
                          <th className="py-3 px-5">Start → End</th>
                          <th className="py-3 px-5">Amount</th>
                          <th className="py-3 px-5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filterList(bookings, ["userName","parkingName","slotCode","vehicleNumber"]).map(b => (
                          <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="hover:bg-white/5 transition-colors text-sm">
                            <td className="py-3 px-5 font-mono text-gray-500">#{b.id}</td>
                            <td className="py-3 px-5">
                              <p className="text-white font-medium">{b.userName}</p>
                              <p className="text-gray-500 text-xs">{b.userEmail}</p>
                            </td>
                            <td className="py-3 px-5">
                              <p className="text-white">{b.parkingName}</p>
                              <p className="text-gray-500 text-xs font-mono">{b.slotCode} · {b.vehicleType}</p>
                            </td>
                            <td className="py-3 px-5 font-mono text-gray-300">{b.vehicleNumber}</td>
                            <td className="py-3 px-5 text-gray-400 text-xs">
                              <p>{fmtTime(b.startTime)}</p>
                              <p>{fmtTime(b.endTime)}</p>
                            </td>
                            <td className="py-3 px-5 font-bold text-neon-green">
                              {b.amount != null ? `₹${b.amount}` : "—"}
                            </td>
                            <td className="py-3 px-5"><StatusBadge status={b.status} /></td>
                          </motion.tr>
                        ))}
                        {filterList(bookings, ["userName","parkingName","slotCode","vehicleNumber"]).length === 0 && (
                          <tr><td colSpan={7} className="py-10 text-center text-gray-500">No bookings found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── REVENUE ──────────────────────────────────────────────── */}
              {section === "revenue" && revenue && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StatTile label="Total Revenue"      value={fmtMoney(revenue.totalRevenue)}     icon={<FaMoneyBillWave />} color="green" />
                    <StatTile label="Total Transactions" value={revenue.totalTransactions}           icon={<FaCheckCircle />}   color="blue" />
                    <StatTile label="Parking Lots"       value={revenue.revenueByParking?.length || 0} icon={<FaBuilding />}   color="purple" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Revenue by parking */}
                    <div className="bg-dark-card/60 border border-white/5 rounded-2xl p-6">
                      <h3 className="text-white font-bold mb-4">Revenue by Parking</h3>
                      <div className="space-y-3">
                        {(revenue.revenueByParking || []).map(r => (
                          <div key={r.parking}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300">{r.parking}</span>
                              <span className="text-neon-green font-bold">{fmtMoney(r.revenue)} <span className="text-gray-500 font-normal text-xs">({r.percentage}%)</span></span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-neon-green" style={{ width: `${r.percentage}%` }} />
                            </div>
                          </div>
                        ))}
                        {!(revenue.revenueByParking?.length) && <p className="text-gray-500 text-sm">No data yet.</p>}
                      </div>
                    </div>

                    {/* Revenue by vehicle type */}
                    <div className="bg-dark-card/60 border border-white/5 rounded-2xl p-6">
                      <h3 className="text-white font-bold mb-4">Revenue by Vehicle Type</h3>
                      <div className="space-y-3">
                        {(revenue.revenueByVehicle || []).map(r => {
                          const colors = { CAR: "bg-neon-blue", BIKE: "bg-neon-purple", LARGE: "bg-yellow-400", SMALL: "bg-neon-green" };
                          return (
                            <div key={r.vehicleType}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-300">{r.vehicleType}</span>
                                <span className="text-white font-bold">{fmtMoney(r.revenue)} <span className="text-gray-500 font-normal text-xs">({r.percentage}%)</span></span>
                              </div>
                              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${colors[r.vehicleType] || "bg-gray-400"}`} style={{ width: `${r.percentage}%` }} />
                              </div>
                            </div>
                          );
                        })}
                        {!(revenue.revenueByVehicle?.length) && <p className="text-gray-500 text-sm">No data yet.</p>}
                      </div>
                    </div>
                  </div>

                  {/* Transactions table */}
                  <div className="bg-dark-card/60 border border-white/5 rounded-2xl overflow-hidden">
                    <div className="p-5 border-b border-white/5">
                      <h3 className="text-white font-bold">Recent Transactions (Last 20)</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                            <th className="py-3 px-5">User</th>
                            <th className="py-3 px-5">Parking · Slot</th>
                            <th className="py-3 px-5">Vehicle</th>
                            <th className="py-3 px-5">Time</th>
                            <th className="py-3 px-5">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {(revenue.transactions || []).map(t => (
                            <tr key={t.bookingId} className="hover:bg-white/5 transition-colors text-sm">
                              <td className="py-3 px-5 text-white">{t.userName}</td>
                              <td className="py-3 px-5">
                                <p className="text-gray-300">{t.parkingName}</p>
                                <p className="text-gray-500 text-xs font-mono">{t.slotCode}</p>
                              </td>
                              <td className="py-3 px-5">
                                <p className="font-mono text-gray-300">{t.vehicleNumber}</p>
                                <p className="text-gray-500 text-xs">{t.vehicleType}</p>
                              </td>
                              <td className="py-3 px-5 text-gray-400 text-xs">
                                <p>{fmtTime(t.startTime)}</p>
                                <p>{fmtTime(t.endTime)}</p>
                              </td>
                              <td className="py-3 px-5 font-bold text-neon-green">{fmtMoney(t.amount)}</td>
                            </tr>
                          ))}
                          {!(revenue.transactions?.length) && (
                            <tr><td colSpan={5} className="py-10 text-center text-gray-500">No transactions yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* ── GHOST SLOTS ───────────────────────────────────────────── */}
              {section === "ghost-slots" && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-gray-400 text-sm">
                        Slots marked OCCUPIED/RESERVED with no active booking — stuck slots that need releasing.
                      </p>
                    </div>
                    {ghosts.length > 0 && (
                      <button onClick={handleFixAllGhosts}
                        className="flex items-center gap-2 px-5 py-2.5 bg-neon-green hover:bg-green-400 text-black font-bold rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all">
                        <FaWrench /> Fix All ({ghosts.length})
                      </button>
                    )}
                  </div>

                  {ghosts.length === 0 ? (
                    <div className="text-center py-24 bg-dark-card/30 rounded-2xl border border-dashed border-neon-green/20">
                      <FaCheckCircle className="text-neon-green text-5xl mx-auto mb-4" />
                      <p className="text-neon-green font-bold text-lg">All slots are healthy!</p>
                      <p className="text-gray-500 text-sm mt-1">No ghost slots detected.</p>
                    </div>
                  ) : (
                    <div className="bg-dark-card/60 border border-white/5 rounded-2xl overflow-hidden">
                      <div className="p-5 border-b border-white/5 flex items-center gap-3">
                        <FaExclamationTriangle className="text-yellow-400" />
                        <h3 className="text-white font-bold">{ghosts.length} Ghost Slot{ghosts.length > 1 ? "s" : ""} Detected</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                              <th className="py-3 px-5">Slot Code</th>
                              <th className="py-3 px-5">Parking</th>
                              <th className="py-3 px-5">Vehicle Type</th>
                              <th className="py-3 px-5">Stuck Status</th>
                              <th className="py-3 px-5">Rate/hr</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {ghosts.map(g => (
                              <motion.tr key={g.slotId} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="hover:bg-white/5 transition-colors text-sm">
                                <td className="py-3 px-5 font-mono text-neon-purple font-bold">{g.slotCode}</td>
                                <td className="py-3 px-5 text-white">{g.parkingName}</td>
                                <td className="py-3 px-5 text-gray-400">{g.vehicleType}</td>
                                <td className="py-3 px-5"><StatusBadge status={g.status} /></td>
                                <td className="py-3 px-5 text-gray-300">₹{g.costPerHour}</td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}

            </motion.div>
          </AnimatePresence>
        )}
      </DashboardLayout>
    </>
  );
}