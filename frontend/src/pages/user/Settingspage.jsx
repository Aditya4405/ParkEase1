import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useTheme } from "../../context/ThemeContext";
import { toast } from "react-toastify";

// ── Toggle Switch ─────────────────────────────────────────────────────────────
const Toggle = ({ value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
      value ? "bg-primary-600" : "bg-slate-200 dark:bg-slate-700"
    }`}
  >
    <div
      className={`w-4 h-4 rounded-full bg-white transition-transform transform shadow-sm ${
        value ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

// ── Dropdown ──────────────────────────────────────────────────────────────────
const Dropdown = ({ value, onChange, options }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 py-2 pl-3 pr-8 text-xs font-semibold focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 cursor-pointer"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
    <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
      ▼
    </div>
  </div>
);

// ── Card ──────────────────────────────────────────────────────────────────────
const Card = ({ title, subtitle, children }) => (
  <div className="parkease-card rounded-2xl mb-5 overflow-hidden shadow-sm">
    {title && (
      <div className="px-6 pt-5 pb-1">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
    )}
    <div>{children}</div>
  </div>
);

// ── Row ───────────────────────────────────────────────────────────────────────
const Row = ({ label, sublabel, right, noBorder }) => (
  <div
    className={`flex items-center justify-between px-6 py-4 gap-4 ${
      noBorder ? "" : "border-b border-slate-100 dark:border-slate-800/80"
    }`}
  >
    <div>
      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</div>
      {sublabel && (
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sublabel}</div>
      )}
    </div>
    <div className="shrink-0">{right}</div>
  </div>
);

// ── Password Input ────────────────────────────────────────────────────────────
const PassInput = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase block mb-1.5">
      {label}
    </label>
    <input
      type="password"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="parkease-input text-sm"
    />
  </div>
);

// ── Buttons ───────────────────────────────────────────────────────────────────
const PrimaryBtn = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="parkease-btn-primary py-2.5 px-5 text-xs font-bold"
  >
    {children}
  </button>
);

const SecondaryBtn = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="py-2.5 px-5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
  >
    {children}
  </button>
);

// ── TABS ──────────────────────────────────────────────────────────────────────
const USER_TABS = ["Profile", "Notifications", "Preferences", "Security", "Privacy"];
const OWNER_TABS = ["Profile", "Operations", "Notifications", "Security"];
const ADMIN_TABS = ["Profile", "Moderation", "Notifications", "Security"];

// ── Settings Content ──────────────────────────────────────────────────────────
function SettingsContent({ role = "USER" }) {
  const { theme, toggleTheme } = useTheme();
  const tabs = role === "OWNER" ? OWNER_TABS : role === "ADMIN" ? ADMIN_TABS : USER_TABS;
  const [activeTab, setActiveTab] = useState(tabs[0]);

  // Profile
  const [firstName, setFirstName] = useState("Aditya");
  const [lastName, setLastName] = useState("User");
  const [email, setEmail] = useState("aditya@parkease.com");
  const [phone, setPhone] = useState("+91 98765 54321");
  const [address, setAddress] = useState("Mumbai, Maharashtra");

  // Notifications
  const [notif, setNotif] = useState({
    push: true,
    email: true,
    sms: false,
    peakTraffic: true,
    bookingExpiry: true,
    spotAvailability: true,
  });

  // Preferences
  const [mapStyle, setMapStyle] = useState("Satellite");
  const [language, setLanguage] = useState("English");
  const [radius, setRadius] = useState("5 km");
  const [currency, setCurrency] = useState("INR (₹)");
  const [defaultSort, setDefaultSort] = useState("Distance");

  // Security
  const [twoFA, setTwoFA] = useState(false);
  const [biometric, setBiometric] = useState(true);
  const [currPass, setCurrPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confPass, setConfPass] = useState("");

  // Privacy
  const [shareLocation, setShareLocation] = useState(true);
  const [dataCollection, setDataCollection] = useState(true);
  const [personalized, setPersonalized] = useState(true);

  const handleSave = () => {
    toast.success("Preferences updated successfully");
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          Settings & Preferences
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your profile, alerts, operational rules, and security
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap -mb-px border-b-2 ${
              activeTab === tab
                ? "border-primary-600 text-primary-600 dark:text-primary-400 font-bold bg-primary-50/50 dark:bg-primary-950/20"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── PROFILE ── */}
      {activeTab === "Profile" && (
        <div>
          <Card title="Personal Information" subtitle="Update your public profile details and address">
            <div className="flex items-center gap-5 px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-700 text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-sm">
                {firstName ? firstName[0].toUpperCase() : "P"}
              </div>
              <div>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {firstName} {lastName}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{email}</div>
                <div className="flex items-center gap-3 mt-3">
                  <button onClick={() => toast.info("Photo upload opened")} className="text-xs font-bold text-primary-600 hover:text-primary-700">
                    Change Avatar
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <button onClick={() => toast.info("Avatar reset to default")} className="text-xs font-medium text-slate-400 hover:text-slate-600">
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {[
                  { label: "FIRST NAME", value: firstName, set: setFirstName, ph: "First name" },
                  { label: "LAST NAME", value: lastName, set: setLastName, ph: "Last name" },
                  { label: "EMAIL ADDRESS", value: email, set: setEmail, ph: "Email" },
                  { label: "PHONE NUMBER", value: phone, set: setPhone, ph: "+91 XXXXX XXXXX" },
                ].map(({ label, value, set, ph }) => (
                  <div key={label}>
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase block mb-1.5">
                      {label}
                    </label>
                    <input
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      placeholder={ph}
                      className="parkease-input text-sm"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase block mb-1.5">
                  ADDRESS & CITY
                </label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Your address"
                  className="parkease-input text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6 pt-2">
              <PrimaryBtn onClick={handleSave}>Save Changes</PrimaryBtn>
              <SecondaryBtn onClick={() => toast.info("Changes discarded")}>Discard</SecondaryBtn>
            </div>
          </Card>
        </div>
      )}

      {/* ── OWNER OPERATIONS ── */}
      {role === "OWNER" && activeTab === "Operations" && (
        <div>
          <Card title="Parking Operations" subtitle="Configure lot automation and booking rules">
            <Row label="Auto-disable full slots" sublabel="Mark slots unavailable once occupancy reaches limit" right={<Toggle value={true} onChange={() => { }} />} />
            <Row label="Show live occupancy" sublabel="Display real-time occupancy metrics on dashboard widgets" right={<Toggle value={true} onChange={() => { }} />} />
            <Row label="Booking approval mode" sublabel="Instant auto-approval or manual approval for reservations" right={<Dropdown value="Instant" onChange={() => { }} options={["Instant", "Manual"]} />} noBorder />
          </Card>

          <Card title="Revenue & Currency" subtitle="Financial analytics display preferences">
            <Row label="Default revenue range" sublabel="Initial timeframe shown in analytics charts" right={<Dropdown value="This Week" onChange={() => { }} options={["Today", "This Week", "This Month"]} />} />
            <Row label="Display currency" sublabel="Currency formatted in balance tables" right={<Dropdown value="INR (₹)" onChange={() => { }} options={["INR (₹)", "USD ($)", "EUR (€)"]} />} noBorder />
          </Card>
        </div>
      )}

      {/* ── ADMIN MODERATION ── */}
      {role === "ADMIN" && activeTab === "Moderation" && (
        <div>
          <Card title="Moderation & Risk Rules" subtitle="Automated account governance parameters">
            <Row label="Auto-flag repeated dues" sublabel="Automatically flag accounts with unpaid penalty balances" right={<Toggle value={true} onChange={() => { }} />} />
            <Row label="Auto-review suspicious activity" sublabel="Queue unverified or high-velocity reservations for review" right={<Toggle value={true} onChange={() => { }} />} />
            <Row label="Suspension threshold" sublabel="Number of warnings triggering automated suspension" right={<Dropdown value="5 Warnings" onChange={() => { }} options={["3 Warnings", "5 Warnings", "7 Warnings"]} />} noBorder />
          </Card>

          <Card title="Alerting & Summaries" subtitle="Administrative dispatch rules">
            <Row label="Real-time incident alerts" sublabel="Receive alerts when accounts are blocked or disputes opened" right={<Toggle value={true} onChange={() => { }} />} />
            <Row label="Daily summary report" sublabel="Generate daily midnight recap of bookings & revenue" right={<Toggle value={false} onChange={() => { }} />} noBorder />
          </Card>
        </div>
      )}

      {/* ── NOTIFICATIONS ── */}
      {activeTab === "Notifications" && (
        <div>
          <Card title="Communication Channels" subtitle="Control alert channels for your account">
            <Row label="Push Notifications" sublabel="Receive real-time push alerts on your active device" right={<Toggle value={notif.push} onChange={(v) => setNotif((p) => ({ ...p, push: v }))} />} />
            <Row label="Email Notifications" sublabel="Get reservation invoices and receipt summaries via email" right={<Toggle value={notif.email} onChange={(v) => setNotif((p) => ({ ...p, email: v }))} />} />
            <Row label="SMS Alerts" sublabel="Receive text notifications for arrival and expiry" right={<Toggle value={notif.sms} onChange={(v) => setNotif((p) => ({ ...p, sms: v }))} />} noBorder />
          </Card>

          <Card title="Smart Parking Alerts" subtitle="Intelligent reminders to prevent parking penalties">
            <Row label="Peak Traffic Warnings" sublabel="Alerts ahead of congested hours near your booked spot" right={<Toggle value={notif.peakTraffic} onChange={(v) => setNotif((p) => ({ ...p, peakTraffic: v }))} />} />
            <Row label="Booking Expiry Reminders" sublabel="Remind 15 minutes before your slot reservation ends" right={<Toggle value={notif.bookingExpiry} onChange={(v) => setNotif((p) => ({ ...p, bookingExpiry: v }))} />} />
            <Row label="Spot Availability Alerts" sublabel="Notify when reserved spots become free" right={<Toggle value={notif.spotAvailability} onChange={(v) => setNotif((p) => ({ ...p, spotAvailability: v }))} />} noBorder />
          </Card>
        </div>
      )}

      {/* ── PREFERENCES ── */}
      {activeTab === "Preferences" && (
        <div>
          <Card title="Visual Theme" subtitle="Toggle system color mode">
            <Row 
              label="Dark Theme" 
              sublabel="Enable sleek dark contrast mode across the dashboard" 
              right={<Toggle value={theme === "dark"} onChange={toggleTheme} />} 
              noBorder
            />
          </Card>

          <Card title="Regional & Map Preferences" subtitle="Customize search parameters and locale">
            <Row label="Map View Style" sublabel="Default map tile layout" right={<Dropdown value={mapStyle} onChange={setMapStyle} options={["Satellite", "Standard", "Terrain"]} />} />
            <Row label="Language" sublabel="Interface display language" right={<Dropdown value={language} onChange={setLanguage} options={["English", "Hindi", "Marathi"]} />} />
            <Row label="Search Radius" sublabel="Default radius around your location" right={<Dropdown value={radius} onChange={setRadius} options={["1 km", "2 km", "5 km", "10 km"]} />} />
            <Row label="Currency" sublabel="Currency format for pricing" right={<Dropdown value={currency} onChange={setCurrency} options={["INR (₹)", "USD ($)", "EUR (€)"]} />} />
            <Row label="Default Sort" sublabel="Preferred sorting for spot recommendations" right={<Dropdown value={defaultSort} onChange={setDefaultSort} options={["Distance", "Price", "Availability"]} />} noBorder />
          </Card>

          <div className="flex gap-3 mt-4">
            <PrimaryBtn onClick={handleSave}>Save Preferences</PrimaryBtn>
            <SecondaryBtn onClick={() => toast.info("Reset to default preferences")}>Reset to Default</SecondaryBtn>
          </div>
        </div>
      )}

      {/* ── SECURITY ── */}
      {activeTab === "Security" && (
        <div>
          <Card title="Authentication & Verification" subtitle="Protect your account credentials">
            <Row label="Two-Factor Authentication" sublabel="Require an OTP code whenever logging in from new devices" right={<Toggle value={twoFA} onChange={setTwoFA} />} />
            <Row label="Biometric Sign-in" sublabel="Allow biometric authentication when available" right={<Toggle value={biometric} onChange={setBiometric} />} noBorder />
          </Card>

          <Card title="Change Password" subtitle="Ensure your password is at least 8 characters">
            <div className="px-6 py-5 flex flex-col gap-4">
              <PassInput label="CURRENT PASSWORD" value={currPass} onChange={setCurrPass} placeholder="••••••••" />
              <PassInput label="NEW PASSWORD" value={newPass} onChange={setNewPass} placeholder="••••••••" />
              <PassInput label="CONFIRM NEW PASSWORD" value={confPass} onChange={setConfPass} placeholder="••••••••" />
              {newPass && confPass && newPass !== confPass && (
                <div className="text-xs font-semibold text-rose-500">Passwords do not match</div>
              )}
              <div className="flex gap-3 pt-2">
                <PrimaryBtn onClick={() => {
                  if (!currPass || !newPass) {
                    toast.error("Please fill in current and new password");
                    return;
                  }
                  if (newPass !== confPass) {
                    toast.error("New passwords do not match");
                    return;
                  }
                  toast.success("Password updated successfully");
                  setCurrPass("");
                  setNewPass("");
                  setConfPass("");
                }}>
                  Update Password
                </PrimaryBtn>
                <SecondaryBtn onClick={() => { setCurrPass(""); setNewPass(""); setConfPass(""); }}>
                  Clear
                </SecondaryBtn>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── PRIVACY ── */}
      {activeTab === "Privacy" && (
        <div>
          <Card title="Location & Data Tracking" subtitle="Manage your geolocation permissions">
            <Row label="Share Precise Location" sublabel="Allow ParkEase to access GPS for finding closest parking spots" right={<Toggle value={shareLocation} onChange={setShareLocation} />} />
            <Row label="Telemetry & Diagnostics" sublabel="Share anonymous performance logs to help us improve" right={<Toggle value={dataCollection} onChange={setDataCollection} />} />
            <Row label="Personalized Recommendations" sublabel="Tailor parking spot recommendations based on your booking history" right={<Toggle value={personalized} onChange={setPersonalized} />} noBorder />
          </Card>

          <Card title="Account Records & Data" subtitle="Export or delete your personal data">
            <Row
              label="Download My Data"
              sublabel="Request a full JSON export of your reservations and receipts"
              right={
                <button onClick={() => toast.info("Data export requested")} className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-3.5 py-1.5 rounded-lg border border-primary-200 dark:border-primary-800/60 hover:bg-primary-100 transition-all">
                  Download
                </button>
              }
            />
            <Row
              label="Delete Account"
              sublabel="Permanently delete your user account and all booking records"
              right={
                <button onClick={() => toast.warn("Please contact support to permanently remove your account.")} className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 transition-all">
                  Delete
                </button>
              }
              noBorder
            />
          </Card>

          <div className="flex gap-3 mt-4">
            <PrimaryBtn onClick={handleSave}>Save Privacy Settings</PrimaryBtn>
            <SecondaryBtn onClick={() => toast.info("Settings reverted")}>Cancel</SecondaryBtn>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Settingspage({ role = "USER" }) {
  return (
    <DashboardLayout role={role}>
      <SettingsContent role={role} />
    </DashboardLayout>
  );
}