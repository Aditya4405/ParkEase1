import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaCar, FaHistory, FaUsers, FaChartBar, FaChartLine, FaFileAlt,
  FaCog, FaSignOutAlt, FaLock, FaWallet, FaPlus, FaParking, FaMoneyBillWave,
  FaExclamationTriangle, FaMapMarkerAlt, FaExchangeAlt, FaUndo,
  FaHeartbeat, FaWrench, FaBell, FaClipboardList, FaUserCheck
} from "react-icons/fa";
import { ownerParkingsAPI } from "../../api/api";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-semibold ${
    isActive
      ? "bg-[#EEF2FF] text-[#5B4DF5] font-bold shadow-sm dark:bg-indigo-950/50 dark:text-indigo-400"
      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
  }`;

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
    <aside className="w-64 flex flex-col fixed left-0 top-0 h-full bg-white dark:bg-[#0E1726] border-r border-slate-200/70 dark:border-slate-800 z-30 select-none transition-colors duration-200">
      {/* Logo Header */}
      <div className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5B4DF5] flex items-center justify-center font-bold text-white text-base shadow-sm">
              P
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-[#0F172A] dark:text-white font-heading">
              ParkEase
            </h2>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider font-semibold">
            {role === "ADMIN" ? "Platform Control Center" : role === "OWNER" ? "Partner Console" : "Smart Parking System"}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">

        {/* ── USER NAV ── */}
        {role === "USER" && (
          <>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-1.5 mt-1 font-bold">Main</p>
            <NavLink className={linkClass} to="/user/dashboard">
              <FaCar className="flex-shrink-0 text-sm" /> Dashboard
            </NavLink>
            <NavLink className={linkClass} to="/user/find-parking">
              <FaMapMarkerAlt className="flex-shrink-0 text-sm" /> Find Parking
            </NavLink>
            <NavLink className={linkClass} to="/user/active-parking">
              <FaLock className="flex-shrink-0 text-sm" /> Active Parking
            </NavLink>

            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-1.5 mt-4 font-bold">Account</p>
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
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-1.5 mt-1 font-bold">Management</p>
            <NavLink className={linkClass} to="/owner/dashboard">
              <FaChartBar className="flex-shrink-0 text-sm" /> Dashboard
            </NavLink>
            <NavLink className={linkClass} to="/owner/revenue">
              <FaMoneyBillWave className="flex-shrink-0 text-sm" /> Revenue
            </NavLink>
            <NavLink className={linkClass} to="/owner/bookings">
              <FaHistory className="flex-shrink-0 text-sm" /> Bookings
            </NavLink>

            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-1.5 mt-4 font-bold">Quick Actions</p>
            <NavLink className={linkClass} to="/owner/add-parking">
              <FaPlus className="flex-shrink-0 text-sm" /> Add Parking
            </NavLink>

            {parkings.length > 0 && (
              <>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-1.5 mt-4 font-bold">My Parkings</p>
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
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-1 mt-1 font-bold">Overview</p>
            <NavLink className={linkClass} to="/admin/dashboard">
              <FaChartBar className="flex-shrink-0 text-sm" /> Dashboard
            </NavLink>

            {/* MANAGEMENT */}
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-1 mt-3 font-bold">Management</p>
            <NavLink className={linkClass} to="/admin/users">
              <FaUsers className="flex-shrink-0 text-sm" /> Users
            </NavLink>
            <NavLink className={linkClass} to="/admin/parkings">
              <FaParking className="flex-shrink-0 text-sm" /> Parking Lots
            </NavLink>
            <NavLink className={linkClass} to="/admin/bookings">
              <FaHistory className="flex-shrink-0 text-sm" /> Bookings
            </NavLink>
            <NavLink className={linkClass} to="/admin/owner-approvals">
              <FaUserCheck className="flex-shrink-0 text-sm" /> Owner Approvals
            </NavLink>

            {/* FINANCE */}
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-1 mt-3 font-bold">Finance</p>
            <NavLink className={linkClass} to="/admin/revenue">
              <FaMoneyBillWave className="flex-shrink-0 text-sm" /> Revenue
            </NavLink>
            <NavLink className={linkClass} to="/admin/transactions">
              <FaExchangeAlt className="flex-shrink-0 text-sm" /> Transactions
            </NavLink>
            <NavLink className={linkClass} to="/admin/refunds">
              <FaUndo className="flex-shrink-0 text-sm" /> Refunds
            </NavLink>

            {/* OPERATIONS */}
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-1 mt-3 font-bold">Operations</p>
            <NavLink className={linkClass} to="/admin/live-parking">
              <FaMapMarkerAlt className="flex-shrink-0 text-sm" /> Live Parking
            </NavLink>
            <NavLink className={linkClass} to="/admin/slot-health">
              <FaHeartbeat className="flex-shrink-0 text-sm" /> Slot Health
            </NavLink>
            <NavLink className={linkClass} to="/admin/ghost-slots">
              <FaExclamationTriangle className="flex-shrink-0 text-sm" /> Ghost Slots
            </NavLink>
            <NavLink className={linkClass} to="/admin/maintenance">
              <FaWrench className="flex-shrink-0 text-sm" /> Maintenance
            </NavLink>

            {/* ANALYTICS */}
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-1 mt-3 font-bold">Analytics</p>
            <NavLink className={linkClass} to="/admin/analytics">
              <FaChartLine className="flex-shrink-0 text-sm" /> Analytics
            </NavLink>
            <NavLink className={linkClass} to="/admin/reports">
              <FaFileAlt className="flex-shrink-0 text-sm" /> Reports & Export
            </NavLink>

            {/* SYSTEM */}
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-1 mt-3 font-bold">System</p>
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
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 w-full text-left cursor-pointer"
        >
          <FaSignOutAlt className="flex-shrink-0 text-sm" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
