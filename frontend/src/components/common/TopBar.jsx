import { FiSearch } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import NotificationBell from "./NotificationBell";

export default function TopBar({ onSearch, searchTerm, userInfo, toggleProfile }) {
    return (
        /* z-40 ensures TopBar is ALWAYS above page content (which is z-10) */
        <header className="fixed top-0 right-0 left-64 z-40 h-16 bg-dark-bg/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8">
            {/* Search Bar */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-80 focus-within:border-neon-blue/40 transition-colors">
                <FiSearch className="text-gray-400 flex-shrink-0" />
                <input
                    type="text"
                    placeholder="Search parking..."
                    value={searchTerm || ""}
                    onChange={(e) => onSearch && onSearch(e.target.value)}
                    className="bg-transparent text-white placeholder-gray-500 text-sm outline-none w-full"
                />
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <NotificationBell />

                {/* Profile Button — always clickable */}
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleProfile && toggleProfile(); }}
                    className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 hover:bg-white/10 transition-all cursor-pointer"
                >
                    <FaUserCircle className="text-neon-blue flex-shrink-0" size={24} />
                    <div className="text-left hidden sm:block">
                        <p className="text-sm font-medium text-white leading-tight">
                            {userInfo?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-400 leading-tight">
                            {userInfo?.role || "Member"}
                        </p>
                    </div>
                </button>
            </div>
        </header>
    );
}
