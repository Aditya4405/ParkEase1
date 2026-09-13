import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";

// ── Toggle ────────────────────────────────────────────────────────────────────
const Toggle = ({ value, onChange }) => (
  <div
    onClick={() => onChange(!value)}
    style={{
      width: 46,
      height: 26,
      borderRadius: 13,
      background: value ? "#3b82f6" : "rgba(255,255,255,0.15)",
      position: "relative",
      cursor: "pointer",
      transition: "background 0.2s",
      flexShrink: 0,
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 3,
        left: value ? 23 : 3,
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: "white",
        transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
      }}
    />
  </div>
);

// ── Dropdown ──────────────────────────────────────────────────────────────────
const Dropdown = ({ value, onChange, options }) => (
  <div style={{ position: "relative" }}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        appearance: "none",
        background: "#1e2638",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8,
        color: "#e2e8f0",
        padding: "8px 36px 8px 14px",
        fontSize: 14,
        fontFamily: "inherit",
        cursor: "pointer",
        outline: "none",
        minWidth: 120,
      }}
    >
      {options.map((o) => (
        <option key={o} value={o} style={{ background: "#1e2638" }}>
          {o}
        </option>
      ))}
    </select>
    <div
      style={{
        position: "absolute",
        right: 10,
        top: "50%",
        transform: "translateY(-50%)",
        pointerEvents: "none",
        color: "#94a3b8",
        fontSize: 10,
      }}
    >
      ▼
    </div>
  </div>
);

// ── Card ──────────────────────────────────────────────────────────────────────
const Card = ({ title, subtitle, children }) => (
  <div
    style={{
      background: "#131c2e",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 12,
      marginBottom: 16,
      overflow: "hidden",
    }}
  >
    {title && (
      <div style={{ padding: "20px 24px 0" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>{subtitle}</div>
        )}
      </div>
    )}
    <div>{children}</div>
  </div>
);

// ── Row ───────────────────────────────────────────────────────────────────────
const Row = ({ label, sublabel, right, noBorder }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "18px 24px",
      borderBottom: noBorder ? "none" : "1px solid rgba(255,255,255,0.05)",
      gap: 16,
    }}
  >
    <div>
      <div style={{ fontSize: 14, fontWeight: 500, color: "#e2e8f0" }}>{label}</div>
      {sublabel && (
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{sublabel}</div>
      )}
    </div>
    <div style={{ flexShrink: 0 }}>{right}</div>
  </div>
);

// ── Password Input ────────────────────────────────────────────────────────────
const PassInput = ({ label, value, onChange, placeholder }) => (
  <div>
    <label
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: "#64748b",
        letterSpacing: "0.8px",
        textTransform: "uppercase",
        display: "block",
        marginBottom: 6,
      }}
    >
      {label}
    </label>
    <input
      type="password"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        background: "#1a2235",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8,
        padding: "12px 14px",
        color: "#e2e8f0",
        fontSize: 14,
        fontFamily: "inherit",
        outline: "none",
        boxSizing: "border-box",
      }}
      onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
    />
  </div>
);

// ── Buttons ───────────────────────────────────────────────────────────────────
const PrimaryBtn = ({ children, onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: "#3b82f6",
      color: "white",
      border: "none",
      borderRadius: 8,
      padding: "11px 24px",
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: "inherit",
    }}
  >
    {children}
  </button>
);

const SecondaryBtn = ({ children, onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: "transparent",
      color: "#94a3b8",
      border: "none",
      borderRadius: 8,
      padding: "11px 20px",
      fontSize: 14,
      fontWeight: 500,
      cursor: "pointer",
      fontFamily: "inherit",
    }}
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
  const tabs = role === "OWNER" ? OWNER_TABS : role === "ADMIN" ? ADMIN_TABS : USER_TABS;
  const [activeTab, setActiveTab] = useState(tabs[0]);

  // Profile
  const [firstName, setFirstName] = useState("Akshaya");
  const [lastName, setLastName] = useState("Kumar");
  const [email, setEmail] = useState("akshaya@gmail.com");
  const [phone, setPhone] = useState("+91 98765 54321");
  const [address, setAddress] = useState("Bettiah, Bihar");

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
  const [darkMode, setDarkMode] = useState(true);
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

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        input::placeholder { color: #475569; }
        select option { background: #1e2638; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>
          Settings
        </h1>
        <p style={{ fontSize: 13, color: "#64748b" }}>
          Manage your account preferences and configuration
        </p>
      </div>

      {/* Tab Bar */}
      <div
        style={{
          display: "flex",
          gap: 4,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          marginBottom: 24,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? "#3b82f6" : "transparent",
              color: activeTab === tab ? "white" : "#94a3b8",
              border: "none",
              borderRadius: "8px 8px 0 0",
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: activeTab === tab ? 600 : 500,
              cursor: "pointer",
              fontFamily: "inherit",
              marginBottom: "-1px",
              transition: "all 0.15s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── PROFILE ── */}
      {activeTab === "Profile" && (
        <div>
          <Card title="Personal Information" subtitle="Update your profile details">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "20px 24px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div
                style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "#3b82f6",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26, fontWeight: 700, color: "white", flexShrink: 0,
                }}
              >
                R
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>
                  {firstName} {lastName}
                </div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{email}</div>
                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <PrimaryBtn>Change Photo</PrimaryBtn>
                  <SecondaryBtn>Remove</SecondaryBtn>
                </div>
              </div>
            </div>

            <div style={{ padding: "20px 24px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px 20px",
                  marginBottom: 16,
                }}
              >
                {[
                  { label: "FIRST NAME", value: firstName, set: setFirstName, ph: "First name" },
                  { label: "LAST NAME", value: lastName, set: setLastName, ph: "Last name" },
                  { label: "EMAIL ADDRESS", value: email, set: setEmail, ph: "Email" },
                  { label: "PHONE NUMBER", value: phone, set: setPhone, ph: "+91 XXXXX XXXXX" },
                ].map(({ label, value, set, ph }) => (
                  <div key={label}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", letterSpacing: "0.8px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                      {label}
                    </label>
                    <input
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      placeholder={ph}
                      style={{ width: "100%", background: "#1a2235", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "12px 14px", color: "#e2e8f0", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                      onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                    />
                  </div>
                ))}
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", letterSpacing: "0.8px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  HOME ADDRESS
                </label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Your address"
                  style={{ width: "100%", background: "#1a2235", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "12px 14px", color: "#e2e8f0", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, padding: "12px 24px 20px" }}>
              <PrimaryBtn>Save Changes</PrimaryBtn>
              <SecondaryBtn>Discard</SecondaryBtn>
            </div>
          </Card>
        </div>
      )}

      {/* ── OWNER OPERATIONS ── */}
      {role === "OWNER" && activeTab === "Operations" && (
        <div>
          <Card title="Parking Operations" subtitle="Configure owner dashboard behavior and lot operations">
            <Row label="Auto-disable full slots" sublabel="Mark slots unavailable once occupancy reaches limit" right={<Toggle value={true} onChange={() => { }} />} />
            <Row label="Show live occupancy" sublabel="Display occupancy trends on dashboard cards" right={<Toggle value={true} onChange={() => { }} />} />
            <Row label="Booking approval mode" sublabel="Instant approval or manual review for incoming bookings" right={<Dropdown value="Instant" onChange={() => { }} options={["Instant", "Manual"]} />} noBorder />
          </Card>

          <Card title="Revenue & Billing" subtitle="Owner-specific defaults for analytics and billing view">
            <Row label="Default revenue range" sublabel="Time range shown first in revenue widgets" right={<Dropdown value="This Week" onChange={() => { }} options={["Today", "This Week", "This Month"]} />} />
            <Row label="Currency" sublabel="Display currency on owner dashboard" right={<Dropdown value="INR (₹)" onChange={() => { }} options={["INR (₹)", "USD ($)", "EUR (€)"]} />} noBorder />
          </Card>
        </div>
      )}

      {/* ── ADMIN MODERATION ── */}
      {role === "ADMIN" && activeTab === "Moderation" && (
        <div>
          <Card title="Moderation Rules" subtitle="Controls for platform-level user and parking governance">
            <Row label="Auto-flag repeated dues" sublabel="Flag users with repeated unpaid penalties" right={<Toggle value={true} onChange={() => { }} />} />
            <Row label="Auto-review suspicious activity" sublabel="Send high-risk accounts to admin review queue" right={<Toggle value={true} onChange={() => { }} />} />
            <Row label="Default suspension threshold" sublabel="Warnings count before account suspension suggestion" right={<Dropdown value="5 Warnings" onChange={() => { }} options={["3 Warnings", "5 Warnings", "7 Warnings"]} />} noBorder />
          </Card>

          <Card title="System Visibility" subtitle="Admin dashboard alerting and notification preferences">
            <Row label="Real-time incident alerts" sublabel="Show immediate alerts for blocked users and major issues" right={<Toggle value={true} onChange={() => { }} />} />
            <Row label="Daily summary report" sublabel="Generate summary email for key platform metrics" right={<Toggle value={false} onChange={() => { }} />} noBorder />
          </Card>
        </div>
      )}

      {/* ── NOTIFICATIONS ── */}
      {activeTab === "Notifications" && (
        <div>
          <Card title="Push Notifications" subtitle="Control what alerts you receive on your device">
            <Row label="Push Notifications" sublabel="Receive alerts on your mobile device" right={<Toggle value={notif.push} onChange={(v) => setNotif((p) => ({ ...p, push: v }))} />} />
            <Row label="Email Notifications" sublabel="Get booking summaries and receipts via email" right={<Toggle value={notif.email} onChange={(v) => setNotif((p) => ({ ...p, email: v }))} />} />
            <Row label="SMS Alerts" sublabel="Text messages for booking confirmations" right={<Toggle value={notif.sms} onChange={(v) => setNotif((p) => ({ ...p, sms: v }))} />} noBorder />
          </Card>

          <Card title="Parking Alerts" subtitle="Smart notifications to help you park better">
            <Row label="Peak Traffic Warnings" sublabel="AI-powered alerts before high-demand periods" right={<Toggle value={notif.peakTraffic} onChange={(v) => setNotif((p) => ({ ...p, peakTraffic: v }))} />} />
            <Row label="Booking Expiry Reminders" sublabel="Get reminded 15 mins before your slot ends" right={<Toggle value={notif.bookingExpiry} onChange={(v) => setNotif((p) => ({ ...p, bookingExpiry: v }))} />} />
            <Row label="Spot Availability Updates" sublabel="Notify when preferred spots become available" right={<Toggle value={notif.spotAvailability} onChange={(v) => setNotif((p) => ({ ...p, spotAvailability: v }))} />} noBorder />
          </Card>

          <div style={{ background: "#131c2e", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
              ⚡
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                Peak Traffic · <span style={{ color: "#3b82f6" }}>5–7 PM</span>
              </div>
              <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 3 }}>
                High demand expected. Plan ahead for City Mall — this is what your alert will look like.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PREFERENCES ── */}
      {activeTab === "Preferences" && (
        <div>
          <Card title="App Appearance" subtitle="Customize how ParkEase looks">
            <Row label="Dark Mode" sublabel="Use dark theme across the app" right={<Toggle value={darkMode} onChange={setDarkMode} />} />
            <Row label="Map View Style" sublabel="Default map display when browsing parking" right={<Dropdown value={mapStyle} onChange={setMapStyle} options={["Satellite", "Standard", "Terrain"]} />} />
            <Row label="Language" sublabel="App display language" right={<Dropdown value={language} onChange={setLanguage} options={["English", "Hindi", "Marathi"]} />} noBorder />
          </Card>

          <Card title="Parking Preferences" subtitle="Default settings for finding spots">
            <Row label="Search Radius" sublabel="Default area to search for parking spots" right={<Dropdown value={radius} onChange={setRadius} options={["1 km", "2 km", "5 km", "10 km"]} />} />
            <Row label="Currency" sublabel="Currency for displaying parking prices" right={<Dropdown value={currency} onChange={setCurrency} options={["INR (₹)", "USD ($)", "EUR (€)"]} />} />
            <Row label="Default Sort" sublabel="How parking results are ordered by default" right={<Dropdown value={defaultSort} onChange={setDefaultSort} options={["Distance", "Price", "Availability"]} />} noBorder />
          </Card>

          <div style={{ display: "flex", gap: 12 }}>
            <PrimaryBtn>Save Preferences</PrimaryBtn>
            <SecondaryBtn>Reset to Default</SecondaryBtn>
          </div>
        </div>
      )}

      {/* ── SECURITY ── */}
      {activeTab === "Security" && (
        <div>
          <Card title="Authentication" subtitle="Secure your account with extra protection">
            <Row label="Two-Factor Authentication" sublabel="Require a verification code when signing in" right={<Toggle value={twoFA} onChange={setTwoFA} />} />
            <Row label="Biometric Login" sublabel="Use fingerprint or face ID to log in" right={<Toggle value={biometric} onChange={setBiometric} />} noBorder />
          </Card>

          <Card title="Password" subtitle="Update your account password">
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              <PassInput label="CURRENT PASSWORD" value={currPass} onChange={setCurrPass} placeholder="••••" />
              <PassInput label="NEW PASSWORD" value={newPass} onChange={setNewPass} placeholder="••••••" />
              <PassInput label="CONFIRM NEW PASSWORD" value={confPass} onChange={setConfPass} placeholder="••••••" />
              {newPass && confPass && newPass !== confPass && (
                <div style={{ fontSize: 12, color: "#ef4444" }}>Passwords do not match</div>
              )}
              <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
                <PrimaryBtn>Update Password</PrimaryBtn>
                <SecondaryBtn>Cancel</SecondaryBtn>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── PRIVACY ── */}
      {activeTab === "Privacy" && (
        <div>
          <Card title="Location & Data" subtitle="Control how your data is used">
            <Row label="Share Location" sublabel="Allow ParkEase to access your location for finding nearby spots" right={<Toggle value={shareLocation} onChange={setShareLocation} />} />
            <Row label="Data Collection" sublabel="Help improve the app by sharing anonymous usage data" right={<Toggle value={dataCollection} onChange={setDataCollection} />} />
            <Row label="Personalized Recommendations" sublabel="Use your parking history to suggest better spots" right={<Toggle value={personalized} onChange={setPersonalized} />} noBorder />
          </Card>

          <Card title="Account Data" subtitle="Manage your stored information">
            <Row
              label="Download My Data"
              sublabel="Get a copy of all your ParkEase data"
              right={
                <button style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", color: "#60a5fa", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Download
                </button>
              }
            />
            <Row
              label="Delete Account"
              sublabel="Permanently remove your account and all data"
              right={
                <button style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Delete
                </button>
              }
              noBorder
            />
          </Card>

          <div style={{ display: "flex", gap: 12 }}>
            <PrimaryBtn>Save Privacy Settings</PrimaryBtn>
            <SecondaryBtn>Cancel</SecondaryBtn>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Export — wrapped in DashboardLayout so sidebar stays ─────────────────
export default function Settingspage({ role = "USER" }) {
  return (
    <DashboardLayout role={role}>
      <SettingsContent role={role} />
    </DashboardLayout>
  );
}