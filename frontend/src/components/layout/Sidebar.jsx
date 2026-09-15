import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaCar, FaHistory, FaUsers, FaChartBar, FaChartLine, FaFileAlt,
  FaCog, FaSignOutAlt, FaLock, FaWallet, FaPlus, FaParking, FaMoneyBillWave,
  FaExclamationTriangle, FaMapMarkerAlt, FaExchangeAlt, FaUndo,
  FaHeartbeat, FaWrench, FaBell, FaClipboardList
} from "react-icons/fa";
import { ownerParkingsAPI } from "../../api/api";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
    isActive
      ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/40 shadow-[0_0_12px_rgba(59,130,246,0.2)]"
      : "text-gray-400 dark:text-slate-400 hover:bg-white/5 dark:hover:bg-white/5 hover:text-white dark:hover:text-white"
  }`;

const plainClass =
  "flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-semibold text-gray-400 dark:text-slate-400 hover:bg-white/5 hover:text-white w-full text-left cursor-pointer";

export default function Sidebar({ role }) {
  const navigate = useNavigate();
  const [parkings, setParkings] = useState([]);

  useEffect(() => {
    if (role === "OWNER") {
      ownerParkingsAPI.getAll()
        .then(data => setParkings(data || []))
        .catch(err => console.error("Sidebar parking fetch error:", err));
    }
  }, [role]);

  return (
    <aside className="w-64 flex flex-col fixed left-0 top-0 h-full bg-[#0d1527] border-r border-white/10 z-30 select-none">
      {/* Logo Header */}
      <div className="p-5 pb-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center font-black text-white text-sm shadow-md">
              P
            </div>
            <h2 className="text-xl font-black bg-gradient-to-r from-neon-blue via-blue-400 to-neon-purple bg-clip-text text-transparent">
              ParkEase
            </h2>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">
            {role === "ADMIN" ? "Platform Control Center" : "Smart Parking System"}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">

        {/* ── USER NAV ── */}
        {role === "USER" && (
          <>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest px-3 mb-1.5 mt-1 font-bold">Main</p>
            <NavLink className={linkClass} to="/user/dashboard">
              <FaCar className="flex-shrink-0 text-sm" /> Dashboard
            </NavLink>
            <NavLink className={linkClass} to="/user/find-parking">
              <FaMapMarkerAlt className="flex-shrink-0 text-sm" /> Find Parking
            </NavLink>
            <NavLink className={linkClass} to="/user/active-parking">
              <FaLock className="flex-shrink-0 text-sm" /> Active Parking
            </NavLink>

            <p className="text-[10px] text-gray-500 uppercase tracking-widest px-3 mb-1.5 mt-4 font-bold">Account</p>
            <NavLink className={linkClass} to="/user/bookings">
              <FaHistory className="flex-shrink-0 text-sm" /> My Bookings
            </NavLink>
            <NavLink className={linkClass} to="/user/payments">
              <FaWallet className="flex-shrink-0 text-sm" /> Payments
            </NavLink>
          </>
        )}

        {/* ── OWNER NAV ── */}
        {role === "OWNER" && (
          <>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest px-3 mb-1.5 mt-1 font-bold">Management</p>
            <NavLink className={linkClass} to="/owner/dashboard">
              <FaChartBar className="flex-shrink-0 text-sm" /> Dashboard
            </NavLink>
            <NavLink className={linkClass} to="/owner/revenue">
              <FaMoneyBillWave className="flex-shrink-0 text-sm" /> Revenue
            </NavLink>
            <NavLink className={linkClass} to="/owner/bookings">
              <FaHistory className="flex-shrink-0 text-sm" /> Bookings
            </NavLink>

            <p className="text-[10px] text-gray-500 uppercase tracking-widest px-3 mb-1.5 mt-4 font-bold">Quick Actions</p>
            <NavLink className={linkClass} to="/owner/add-parking">
              <FaPlus className="flex-shrink-0 text-sm" /> Add Parking
            </NavLink>

            {parkings.length > 0 && (
              <>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest px-3 mb-1.5 mt-4 font-bold">My Parkings</p>
                {parkings.map(p => (
                  <NavLink key={p.id} className={linkClass} to={`/owner/parking/${p.id}/dashboard`}>
                    <FaParking className="flex-shrink-0 text-sm" /> <span className="truncate">{p.name}</span>
                  </NavLink>
                ))}
              </>
            )}
          </>
        )}

        {/* ── ADMIN NAV (ENTERPRISE CONTROL CENTER) ── */}
        {role === "ADMIN" && (
          <>
            {/* OVERVIEW */}
            <p className="text-[10px] text-gray-500 uppercase tracking-widest px-3 mb-1 mt-1 font-bold">Overview</p>
            <NavLink className={linkClass} to="/admin/dashboard">
              <FaChartBar className="flex-shrink-0 text-sm" /> Dashboard
            </NavLink>

            {/* MANAGEMENT */}
            <p className="text-[10px] text-gray-500 uppercase tracking-widest px-3 mb-1 mt-3 font-bold">Management</p>
            <NavLink className={linkClass} to="/admin/users">
              <FaUsers className="flex-shrink-0 text-sm" /> Users
            </NavLink>
            <NavLink className={linkClass} to="/admin/parkings">
              <FaParking className="flex-shrink-0 text-sm" /> Parking Lots
            </NavLink>
            <NavLink className={linkClass} to="/admin/bookings">
              <FaHistory className="flex-shrink-0 text-sm" /> Bookings
            </NavLink>

            {/* FINANCE */}
            <p className="text-[10px] text-gray-500 uppercase tracking-widest px-3 mb-1 mt-3 font-bold">Finance</p>
            <NavLink className={linkClass} to="/admin/revenue">
              <FaMoneyBillWave className="flex-shrink-0 text-sm text-neon-green" /> Revenue
            </NavLink>
            <NavLink className={linkClass} to="/admin/transactions">
              <FaExchangeAlt className="flex-shrink-0 text-sm" /> Transactions
            </NavLink>
            <NavLink className={linkClass} to="/admin/refunds">
              <FaUndo className="flex-shrink-0 text-sm" /> Refunds
            </NavLink>

            {/* OPERATIONS */}
            <p className="text-[10px] text-gray-500 uppercase tracking-widest px-3 mb-1 mt-3 font-bold">Operations</p>
            <NavLink className={linkClass} to="/admin/live-parking">
              <FaMapMarkerAlt className="flex-shrink-0 text-sm text-neon-blue" /> Live Parking
            </NavLink>
            <NavLink className={linkClass} to="/admin/slot-health">
              <FaHeartbeat className="flex-shrink-0 text-sm text-emerald-400" /> Slot Health
            </NavLink>
            <NavLink className={linkClass} to="/admin/ghost-slots">
              <FaExclamationTriangle className="flex-shrink-0 text-sm text-amber-400" /> Ghost Slots
            </NavLink>
            <NavLink className={linkClass} to="/admin/maintenance">
              <FaWrench className="flex-shrink-0 text-sm" /> Maintenance
            </NavLink>

            {/* ANALYTICS */}
            <p className="text-[10px] text-gray-500 uppercase tracking-widest px-3 mb-1 mt-3 font-bold">Analytics</p>
            <NavLink className={linkClass} to="/admin/analytics">
              <FaChartLine className="flex-shrink-0 text-sm text-neon-purple" /> Analytics
            </NavLink>
            <NavLink className={linkClass} to="/admin/reports">
              <FaFileAlt className="flex-shrink-0 text-sm" /> Reports & Export
            </NavLink>

            {/* SYSTEM */}
            <p className="text-[10px] text-gray-500 uppercase tracking-widest px-3 mb-1 mt-3 font-bold">System</p>
            <NavLink className={linkClass} to="/admin/notifications">
              <FaBell className="flex-shrink-0 text-sm" /> Notifications
            </NavLink>
            <NavLink className={linkClass} to="/admin/audit-logs">
              <FaClipboardList className="flex-shrink-0 text-sm" /> Audit Logs
            </NavLink>
            <NavLink className={linkClass} to="/admin/settings">
              <FaCog className="flex-shrink-0 text-sm" /> Settings
            </NavLink>
          </>
        )}
      </nav>

      {/* Bottom Profile & Logout */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className={plainClass}
        >
          <FaSignOutAlt className="flex-shrink-0 text-neon-red text-sm" />
          <span className="text-neon-red">Logout</span>
        </button>
      </div>
    </aside>
  );
}
