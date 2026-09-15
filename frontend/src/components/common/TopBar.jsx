import { useState, useEffect, useRef } from "react";
import { FiSearch, FiSun, FiMoon, FiMonitor } from "react-icons/fi";
import { FaUserCircle, FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import { useTheme } from "../../context/ThemeContext";
import { api } from "../../api/api";

export default function TopBar({ onSearch, searchTerm, userInfo, toggleProfile }) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const searchRef = useRef(null);
  const themeRef = useRef(null);

  const isAdmin = userInfo?.role === "ADMIN";

  // Handle global search API for Admin
  useEffect(() => {
    if (!isAdmin || !query.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.get(`/admin/search?q=${encodeURIComponent(query.trim())}`);
        setResults(data);
        setShowDropdown(true);
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isAdmin]);

  // Click outside listeners
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectResult = (url) => {
    setShowDropdown(false);
    setQuery("");
    navigate(url);
  };

  const hasResults =
    results &&
    (results.users?.length > 0 ||
      results.parkings?.length > 0 ||
      results.bookings?.length > 0 ||
      results.transactions?.length > 0);

  return (
    <header className="fixed top-0 right-0 left-64 z-40 h-16 bg-[#0f172a]/90 dark:bg-[#0f172a]/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-8 text-white">
      {/* Global Search Bar */}
      <div className="relative w-96" ref={searchRef}>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-full focus-within:border-neon-blue/50 focus-within:bg-white/10 transition-all">
          <FiSearch className="text-gray-400 flex-shrink-0 text-sm" />
          <input
            type="text"
            placeholder={isAdmin ? "Search users, parkings, bookings, txns..." : "Search parking..."}
            value={isAdmin ? query : searchTerm || ""}
            onChange={(e) => {
              if (isAdmin) {
                setQuery(e.target.value);
              } else if (onSearch) {
                onSearch(e.target.value);
              }
            }}
            onFocus={() => isAdmin && results && setShowDropdown(true)}
            className="bg-transparent text-white placeholder-gray-500 text-xs outline-none w-full font-medium"
          />
          {loading && <FaSpinner className="text-neon-blue animate-spin text-xs flex-shrink-0" />}
        </div>

        {/* Global Search Results Dropdown (Admin only) */}
        {isAdmin && showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f1629] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
            {loading && !results && (
              <div className="p-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin text-neon-blue" /> Searching platform...
              </div>
            )}

            {!loading && !hasResults && query.trim() && (
              <div className="p-4 text-center text-xs text-gray-400">
                No matching results for "{query}"
              </div>
            )}

            {results?.users?.length > 0 && (
              <div className="p-2 border-b border-white/5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1">Users</p>
                {results.users.map((u) => (
                  <button
                    key={`u-${u.id}`}
                    onClick={() => handleSelectResult(u.url)}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/5 flex items-center justify-between transition-colors text-xs"
                  >
                    <span className="font-semibold text-white">{u.title}</span>
                    <span className="text-gray-400 text-[11px]">{u.subtitle}</span>
                  </button>
                ))}
              </div>
            )}

            {results?.parkings?.length > 0 && (
              <div className="p-2 border-b border-white/5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1">Parking Lots</p>
                {results.parkings.map((p) => (
                  <button
                    key={`p-${p.id}`}
                    onClick={() => handleSelectResult(p.url)}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/5 flex items-center justify-between transition-colors text-xs"
                  >
                    <span className="font-semibold text-white">{p.title}</span>
                    <span className="text-gray-400 text-[11px]">{p.subtitle}</span>
                  </button>
                ))}
              </div>
            )}

            {results?.bookings?.length > 0 && (
              <div className="p-2 border-b border-white/5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1">Bookings</p>
                {results.bookings.map((b) => (
                  <button
                    key={`b-${b.id}`}
                    onClick={() => handleSelectResult(b.url)}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/5 flex items-center justify-between transition-colors text-xs"
                  >
                    <span className="font-semibold text-white">{b.title}</span>
                    <span className="text-gray-400 text-[11px]">{b.subtitle}</span>
                  </button>
                ))}
              </div>
            )}

            {results?.transactions?.length > 0 && (
              <div className="p-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1">Transactions</p>
                {results.transactions.map((t) => (
                  <button
                    key={`t-${t.id}`}
                    onClick={() => handleSelectResult(t.url)}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/5 flex items-center justify-between transition-colors text-xs"
                  >
                    <span className="font-semibold text-white">{t.title}</span>
                    <span className="text-neon-green text-[11px] font-semibold">{t.subtitle}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Dark / Light / System Theme Toggle */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title={`Current Theme: ${theme}`}
          >
            {theme === "dark" ? (
              <FiMoon size={15} className="text-neon-purple" />
            ) : theme === "light" ? (
              <FiSun size={15} className="text-amber-400" />
            ) : (
              <FiMonitor size={15} className="text-neon-blue" />
            )}
          </button>

          {showThemeMenu && (
            <div className="absolute right-0 mt-2 w-36 bg-[#0f1629] border border-white/10 rounded-xl shadow-2xl p-1 z-50 space-y-0.5">
              <button
                onClick={() => {
                  setTheme("dark");
                  setShowThemeMenu(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  theme === "dark" ? "bg-neon-blue/20 text-neon-blue" : "text-gray-300 hover:bg-white/5"
                }`}
              >
                <FiMoon size={13} /> Dark (Default)
              </button>
              <button
                onClick={() => {
                  setTheme("light");
                  setShowThemeMenu(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  theme === "light" ? "bg-neon-blue/20 text-neon-blue" : "text-gray-300 hover:bg-white/5"
                }`}
              >
                <FiSun size={13} /> Light
              </button>
              <button
                onClick={() => {
                  setTheme("system");
                  setShowThemeMenu(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  theme === "system" ? "bg-neon-blue/20 text-neon-blue" : "text-gray-300 hover:bg-white/5"
                }`}
              >
                <FiMonitor size={13} /> System
              </button>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <NotificationBell isAdmin={isAdmin} />

        {/* User Profile Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleProfile && toggleProfile();
          }}
          className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 hover:bg-white/10 transition-all cursor-pointer"
        >
          <FaUserCircle className="text-neon-blue flex-shrink-0" size={20} />
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-white leading-tight">
              {userInfo?.name || "User"}
            </p>
            <p className="text-[10px] text-gray-400 leading-tight">
              {userInfo?.role || "Member"}
            </p>
          </div>
        </button>
      </div>
    </header>
  );
}
