import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaCar, FaHistory, FaUsers, FaChartBar,
  FaCog, FaSignOutAlt, FaLock, FaWallet, FaPlus, FaParking, FaMoneyBillWave,
  FaExclamationTriangle, FaMapMarkerAlt
} from "react-icons/fa";
import { ownerParkingsAPI } from "../../api/api";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${isActive
    ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/30 shadow-[0_0_10px_rgba(59,130,246,0.15)]"
    : "text-gray-400 hover:bg-white/8 hover:text-white"
  }`;

const plainClass =
  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium text-gray-400 hover:bg-white/8 hover:text-white w-full text-left";

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
  const settingsRoute = role === "OWNER"
    ? "/owner/settings"
    : role === "ADMIN"
      ? "/admin/settings"
      : "/user/settings";

  return (
    <aside className="w-64 flex flex-col text-white fixed left-0 top-0 h-full bg-dark-bg border-r border-white/5 z-20">
      {/* Logo */}
      <div className="p-6 pb-4 border-b border-white/5">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
          ParkEase
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">Smart Parking System</p>
      </div>

      {/* Primary Nav */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">

        {role === "USER" && (
          <>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest px-3 mb-2 mt-1">Main</p>
            <NavLink className={linkClass} to="/user/dashboard">
              <FaCar className="flex-shrink-0" /> Dashboard
            </NavLink>
            <NavLink className={linkClass} to="/user/find-parking">
              <FaMapMarkerAlt className="flex-shrink-0" /> Find Parking
            </NavLink>
            <NavLink className={linkClass} to="/user/active-parking">
              <FaLock className="flex-shrink-0" /> Active Parking
            </NavLink>

            <p className="text-[10px] text-gray-600 uppercase tracking-widest px-3 mb-2 mt-4">Account</p>
            <NavLink className={linkClass} to="/user/bookings">
              <FaHistory className="flex-shrink-0" /> My Bookings
            </NavLink>
            <NavLink className={linkClass} to="/user/payments">
              <FaWallet className="flex-shrink-0" /> Payments
            </NavLink>
          </>
        )}

        {role === "OWNER" && (
          <>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest px-3 mb-2 mt-1">Management</p>
            <NavLink className={linkClass} to="/owner/dashboard">
              <FaChartBar className="flex-shrink-0" /> Dashboard
            </NavLink>
            <NavLink className={linkClass} to="/owner/revenue">
              <FaMoneyBillWave className="flex-shrink-0" /> Revenue
            </NavLink>
            <NavLink className={linkClass} to="/owner/bookings">
              <FaHistory className="flex-shrink-0" /> Bookings
            </NavLink>

            <p className="text-[10px] text-gray-600 uppercase tracking-widest px-3 mb-2 mt-4">Quick Actions</p>
            <NavLink className={linkClass} to="/owner/add-parking">
              <FaPlus className="flex-shrink-0" /> Add Parking
            </NavLink>

            {parkings.length > 0 && (
              <>
                <p className="text-[10px] text-gray-600 uppercase tracking-widest px-3 mb-2 mt-4">My Parkings</p>
                {parkings.map(p => (
                  <NavLink key={p.id} className={linkClass} to={`/owner/parking/${p.id}/dashboard`}>
                    <FaParking className="flex-shrink-0" /> <span className="truncate">{p.name}</span>
                  </NavLink>
                ))}
              </>
            )}
          </>
        )}

        {role === "ADMIN" && (
          <>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest px-3 mb-2 mt-1">Overview</p>
            <NavLink className={linkClass} to="/admin/dashboard">
              <FaChartBar className="flex-shrink-0" /> Dashboard
            </NavLink>

            <p className="text-[10px] text-gray-600 uppercase tracking-widest px-3 mb-2 mt-4">Manage</p>
            <NavLink className={linkClass} to="/admin/users">
              <FaUsers className="flex-shrink-0" /> Users
            </NavLink>
            <NavLink className={linkClass} to="/admin/parkings">
              <FaParking className="flex-shrink-0" /> Parkings
            </NavLink>
            <NavLink className={linkClass} to="/admin/bookings">
              <FaHistory className="flex-shrink-0" /> Bookings
            </NavLink>

            <p className="text-[10px] text-gray-600 uppercase tracking-widest px-3 mb-2 mt-4">Finance</p>
            <NavLink className={linkClass} to="/admin/revenue">
              <FaMoneyBillWave className="flex-shrink-0" /> Revenue
            </NavLink>

            <p className="text-[10px] text-gray-600 uppercase tracking-widest px-3 mb-2 mt-4">System</p>
            <NavLink className={linkClass} to="/admin/ghost-slots">
              <FaExclamationTriangle className="flex-shrink-0 text-neon-red" /> Ghost Slots
            </NavLink>
          </>
        )}
      </nav>

      {/* Bottom: Settings + Logout */}
      <div className="p-4 border-t border-white/5 space-y-1">
        <NavLink className={linkClass} to={settingsRoute}>
          <FaCog className="flex-shrink-0" /> Settings
        </NavLink>
        <button onClick={() => navigate("/")} className={plainClass}>
          <FaSignOutAlt className="flex-shrink-0 text-neon-red" />
          <span className="text-neon-red">Logout</span>
        </button>
      </div>
    </aside>
  );
}
