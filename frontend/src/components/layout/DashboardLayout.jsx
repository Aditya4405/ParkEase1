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
    <div className="min-h-screen bg-dark-bg text-white flex">
      <Sidebar role={role} />

      <main className="flex-1 ml-64 relative overflow-hidden bg-dark-bg">
        {/* TopBar is z-40 — always above page content */}
        <TopBar
          onSearch={onSearch}
          searchTerm={searchTerm}
          userInfo={userInfo}
          toggleProfile={() => setShowProfile(true)}
        />

        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-64 w-[500px] h-[500px] bg-neon-blue/10 rounded-full blur-[120px] pointer-events-none" />

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
