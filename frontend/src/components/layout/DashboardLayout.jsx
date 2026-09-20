import { useState } from "react";
import Sidebar from "../Sidebar";
import TopBar from "../common/TopBar";
import ProfileModal from "../common/ProfileModal";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function DashboardLayout({
  children,
  role,
  onSearch,
  searchTerm,
  userInfo: externalUserInfo,
  onSaveProfile,  // optional callback when profile is saved
}) {
  const navigate = useNavigate();

  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState(
    externalUserInfo || { name: "User", email: "", phone: "", role: role || "USER" }
  );

  // Keep internal profile in sync if parent passes updated userInfo on re-mount
  const userInfo = externalUserInfo || profile;

  const handleSave = (updated) => {
    setProfile(updated);
    if (onSaveProfile) onSaveProfile(updated);
    toast.success("Profile updated!", { theme: "dark", autoClose: 2000 });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      <Sidebar role={role} />

      <main className="flex-1 ml-64 relative overflow-hidden bg-[#FAFAFA] dark:bg-[#0B1120]">
        {/* TopBar is z-40 — always above page content */}
        <TopBar
          onSearch={onSearch}
          searchTerm={searchTerm}
          userInfo={userInfo}
          toggleProfile={() => setShowProfile(true)}
        />

        {/* Subtle Ambient Accent Gradient (matches landing page style) */}
        <div className="absolute top-0 right-0 w-[500px] h-[350px] bg-gradient-to-b from-indigo-100/50 dark:from-indigo-950/20 to-transparent rounded-full blur-3xl pointer-events-none opacity-60" />
        <div className="absolute top-48 left-10 w-[400px] h-[300px] bg-gradient-to-tr from-purple-100/40 dark:from-purple-950/15 to-transparent rounded-full blur-3xl pointer-events-none opacity-50" />

        {/* Page Content */}
        <div className="relative z-10 p-8 pt-24 min-h-screen">
          {children}
        </div>
      </main>

      {/* Profile Modal — always managed here, works on ALL pages */}
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        user={userInfo}
        onSave={handleSave}
        onLogout={() => navigate("/")}
      />
    </div>
  );
}
