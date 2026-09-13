import { useState, useEffect } from "react";

const ParkingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const ZapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const CarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/>
    <circle cx="7" cy="17" r="2"/>
    <path d="M9 17h6"/>
    <circle cx="17" cy="17" r="2"/>
  </svg>
);

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#8b5cf6" stroke="#8b5cf6" strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const spots = [
  { name: "City Mall Parking", slots: 8, dist: "0.5 km", badge: "Available" },
  { name: "Hospital Parking", slots: 2, dist: "1.2 km", badge: "Low" },
  { name: "Railway Parking", slots: 5, dist: "2 km", badge: "Available" },
  { name: "Airport Terminal 1", slots: 15, dist: "5 km", badge: "Available" },
];

const features = [
  { icon: <MapPinIcon />, title: "Real-Time Availability", desc: "Live updates on parking slots across the city. Find your spot before you leave." },
  { icon: <ZapIcon />, title: "AI Predictions", desc: "Smart forecasting tells you expected occupancy 30 minutes ahead of time." },
  { icon: <ClockIcon />, title: "Instant Booking", desc: "Reserve your spot in seconds. No more circling the block." },
  { icon: <ShieldIcon />, title: "Secure & Reliable", desc: "End-to-end encrypted bookings with 24/7 monitoring at every location." },
];

const stats = [
  { value: "500+", label: "Parking Spots" },
  { value: "50K+", label: "Happy Drivers" },
  { value: "98%", label: "Uptime" },
  { value: "30s", label: "Avg Booking Time" },
];

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [visible, setVisible] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => { clearTimeout(timer); window.removeEventListener("scroll", handleScroll); };
  }, []);

  return (
    <div style={{
      fontFamily: "'Sora', 'DM Sans', sans-serif",
      background: "#0d0d1a",
      color: "#e2e8f0",
      minHeight: "100vh",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        html { scroll-behavior: smooth; }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0d0d1a; }
        ::-webkit-scrollbar-thumb { background: #8b5cf6; border-radius: 3px; }

        .nav-link {
          color: #94a3b8;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
          cursor: pointer;
        }
        .nav-link:hover { color: #e2e8f0; }

        .hero-fade {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .hero-fade.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .hero-fade.delay-1 { transition-delay: 0.15s; }
        .hero-fade.delay-2 { transition-delay: 0.3s; }
        .hero-fade.delay-3 { transition-delay: 0.45s; }
        .hero-fade.delay-4 { transition-delay: 0.6s; }

        .btn-primary {
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s;
          font-family: inherit;
          box-shadow: 0 0 30px rgba(139,92,246,0.35);
          text-decoration: none;
          display: inline-block;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 45px rgba(139,92,246,0.55);
        }

        .btn-secondary {
          background: transparent;
          color: #e2e8f0;
          border: 1.5px solid rgba(139,92,246,0.5);
          padding: 13px 30px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s;
          font-family: inherit;
          text-decoration: none;
          display: inline-block;
        }
        .btn-secondary:hover {
          border-color: #8b5cf6;
          background: rgba(139,92,246,0.08);
          transform: translateY(-2px);
        }

        .feature-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(139,92,246,0.15);
          border-radius: 20px;
          padding: 32px;
          transition: all 0.3s;
          cursor: default;
        }
        .feature-card:hover {
          border-color: rgba(139,92,246,0.45);
          background: rgba(139,92,246,0.06);
          transform: translateY(-4px);
        }

        .spot-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(139,92,246,0.15);
          border-radius: 16px;
          padding: 20px;
          transition: all 0.25s;
          cursor: pointer;
        }
        .spot-card:hover, .spot-card.active {
          border-color: #8b5cf6;
          background: rgba(139,92,246,0.08);
          transform: translateY(-3px);
        }

        .badge-available {
          background: rgba(34,197,94,0.15);
          color: #4ade80;
          border: 1px solid rgba(34,197,94,0.3);
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }
        .badge-low {
          background: rgba(251,146,60,0.15);
          color: #fb923c;
          border: 1px solid rgba(251,146,60,0.3);
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }

        .book-btn {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          padding: 9px 20px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .book-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 20px rgba(59,130,246,0.4);
        }

        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }

        .stat-card {
          background: rgba(139,92,246,0.08);
          border: 1px solid rgba(139,92,246,0.2);
          border-radius: 16px;
          padding: 28px 24px;
          text-align: center;
          transition: all 0.3s;
        }
        .stat-card:hover {
          border-color: rgba(139,92,246,0.5);
          transform: translateY(-3px);
        }

        .testimonial-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(139,92,246,0.12);
          border-radius: 20px;
          padding: 28px;
          transition: all 0.3s;
        }
        .testimonial-card:hover {
          border-color: rgba(139,92,246,0.3);
          transform: translateY(-3px);
        }

        .input-field {
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(139,92,246,0.25);
          color: #e2e8f0;
          padding: 14px 18px;
          border-radius: 12px;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
        }
        .input-field::placeholder { color: #64748b; }
        .input-field:focus { border-color: #8b5cf6; }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.9); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .floating { animation: float 4s ease-in-out infinite; }

        .live-dot {
          width: 8px; height: 8px;
          background: #4ade80;
          border-radius: 50%;
          position: relative;
          display: inline-block;
        }
        .live-dot::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #4ade80;
          animation: pulse-ring 1.5s ease-out infinite;
        }

        .logo-text {
          background: linear-gradient(135deg, #a78bfa, #8b5cf6, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 800;
          font-size: 22px;
          letter-spacing: -0.5px;
        }

        .section-tag {
          display: inline-block;
          background: rgba(139,92,246,0.12);
          border: 1px solid rgba(139,92,246,0.3);
          color: #a78bfa;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent);
        }

        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .spots-grid { grid-template-columns: 1fr 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .hero-btns { flex-direction: column; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrollY > 30 ? "rgba(13,13,26,0.9)" : "transparent",
        backdropFilter: scrollY > 30 ? "blur(16px)" : "none",
        borderBottom: scrollY > 30 ? "1px solid rgba(139,92,246,0.12)" : "none",
        transition: "all 0.3s",
        padding: "0 5%",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 68,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(139,92,246,0.4)",
          }}>
            <ParkingIcon />
          </div>
          <span className="logo-text">ParkEase</span>
        </div>

        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <a href="#features" className="nav-link" style={{ display: typeof window !== 'undefined' && window.innerWidth > 640 ? "block" : "none" }}>Features</a>
          <a href="#how-it-works" className="nav-link" style={{ display: typeof window !== 'undefined' && window.innerWidth > 640 ? "block" : "none" }}>How it Works</a>
          <a className="nav-link" style={{ display: typeof window !== 'undefined' && window.innerWidth > 640 ? "block" : "none" }}>Pricing</a>
          <a href="/login" className="btn-secondary" style={{ padding: "9px 22px", fontSize: 13 }}>Log In</a>
          <a href="/register" className="btn-primary" style={{ padding: "9px 22px", fontSize: 13 }}>Get Started</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", padding: "120px 5% 80px", overflow: "hidden" }}>
        {/* Background orbs */}
        <div className="glow-orb" style={{ width: 500, height: 500, background: "rgba(139,92,246,0.18)", top: -100, right: -100 }} />
        <div className="glow-orb" style={{ width: 350, height: 350, background: "rgba(59,130,246,0.12)", bottom: 50, left: -80 }} />

        {/* Grid bg */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />

        <div style={{ position: "relative", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }} className="hero-grid">
          {/* Left */}
          <div>
            <div className={`hero-fade ${visible ? "visible" : ""}`}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                <span className="live-dot" />
                <span style={{ fontSize: 12, color: "#4ade80", fontWeight: 600, letterSpacing: 0.5 }}>Live across 50+ zones in your city</span>
              </div>
            </div>

            <div className={`hero-fade delay-1 ${visible ? "visible" : ""}`}>
              <h1 style={{
                fontSize: "clamp(38px, 5vw, 62px)",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-1.5px",
                marginBottom: 24,
                color: "#f1f5f9",
              }}>
                Find & Book<br />
                <span style={{
                  background: "linear-gradient(135deg, #a78bfa, #8b5cf6, #60a5fa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>Parking Instantly</span>
              </h1>
            </div>

            <div className={`hero-fade delay-2 ${visible ? "visible" : ""}`}>
              <p style={{ fontSize: 17, color: "#94a3b8", lineHeight: 1.7, marginBottom: 36, maxWidth: 460 }}>
                ParkEase uses AI to show real-time parking availability, predict occupancy, and let you reserve your spot before you even leave home.
              </p>
            </div>

            <div className={`hero-fade delay-3 ${visible ? "visible" : ""}`}>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }} className="hero-btns">
                <button className="btn-primary" style={{ fontSize: 16, padding: "15px 36px" }}>
                  🚗 Find Parking Now
                </button>
                <button className="btn-secondary" style={{ fontSize: 16, padding: "15px 32px" }}>
                  Watch Demo →
                </button>
              </div>
            </div>

            <div className={`hero-fade delay-4 ${visible ? "visible" : ""}`}>
              <div style={{ display: "flex", gap: 28, marginTop: 44, flexWrap: "wrap" }}>
                {stats.map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize: 26, fontWeight: 800, color: "#a78bfa" }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - App Preview */}
          <div className={`hero-fade delay-2 floating ${visible ? "visible" : ""}`} style={{ position: "relative" }}>
            <div style={{
              background: "linear-gradient(145deg, #1a1a2e, #16213e)",
              border: "1px solid rgba(139,92,246,0.2)",
              borderRadius: 24,
              padding: 24,
              boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(139,92,246,0.15)",
            }}>
              {/* Mini topbar */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ParkingIcon />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#a78bfa" }}>ParkEase</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <span className="live-dot" />
                  <span style={{ fontSize: 11, color: "#4ade80" }}>Live</span>
                </div>
              </div>

              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.8 }}>Nearest Spots</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                {spots.map((spot, i) => (
                  <div
                    key={spot.name}
                    className={`spot-card ${activeSlot === i ? "active" : ""}`}
                    onClick={() => setActiveSlot(activeSlot === i ? null : i)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.3 }}>{spot.name}</span>
                      <span className={spot.badge === "Low" ? "badge-low" : "badge-available"}>{spot.slots}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#64748b", fontSize: 11, marginBottom: 10 }}>
                      <MapPinIcon />{spot.dist}
                    </div>
                    <button className="book-btn" style={{ width: "100%", justifyContent: "center" }}>
                      <CarIcon /> Book
                    </button>
                  </div>
                ))}
              </div>

              {/* Peak alert */}
              <div style={{
                background: "rgba(251,146,60,0.08)",
                border: "1px solid rgba(251,146,60,0.25)",
                borderRadius: 12, padding: "12px 14px",
                display: "flex", gap: 10, alignItems: "flex-start",
              }}>
                <span style={{ fontSize: 18 }}>⚡</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#fb923c" }}>Peak Traffic · 5-7 PM</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>AI predicts high demand. Book early to secure your slot.</div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div style={{
              position: "absolute", top: -18, right: -18,
              background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
              borderRadius: 14, padding: "10px 16px",
              boxShadow: "0 8px 30px rgba(139,92,246,0.5)",
              fontSize: 12, fontWeight: 700, color: "white",
            }}>
              ✓ Slot Reserved
            </div>
          </div>
        </div>
      </section>

      <div className="divider" style={{ margin: "0 5%" }} />

      {/* FEATURES */}
      <section id="features" style={{ padding: "100px 5%" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="section-tag">Features</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 800, letterSpacing: "-1px", color: "#f1f5f9" }}>
            Everything you need to<br />park smarter
          </h2>
          <p style={{ color: "#94a3b8", marginTop: 16, fontSize: 16, maxWidth: 480, margin: "16px auto 0" }}>
            From real-time availability to AI-powered predictions, ParkEase has you covered.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }} className="features-grid">
          {features.map(f => (
            <div key={f.title} className="feature-card">
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: "rgba(139,92,246,0.15)",
                border: "1px solid rgba(139,92,246,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#a78bfa", marginBottom: 20,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" style={{ margin: "0 5%" }} />

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: "100px 5%", position: "relative" }}>
        <div className="glow-orb" style={{ width: 400, height: 400, background: "rgba(139,92,246,0.1)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <span className="section-tag">How It Works</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 800, letterSpacing: "-1px", color: "#f1f5f9" }}>
              Park in 3 easy steps
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, maxWidth: 860, margin: "0 auto" }} className="features-grid">
            {[
              { step: "01", icon: "🔍", title: "Search", desc: "Enter your destination or enable location to find nearby parking spots instantly." },
              { step: "02", icon: "📋", title: "Compare & Book", desc: "View real-time availability, prices, and AI predictions. Reserve in one tap." },
              { step: "03", icon: "🚗", title: "Park & Go", desc: "Navigate to your reserved spot and park with confidence. No more hunting around." },
            ].map(step => (
              <div key={step.step} style={{ textAlign: "center" }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 20,
                  background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.1))",
                  border: "1px solid rgba(139,92,246,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 30, margin: "0 auto 20px",
                }}>
                  {step.icon}
                </div>
                <div style={{ fontSize: 11, color: "#8b5cf6", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>STEP {step.step}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" style={{ margin: "0 5%" }} />

      {/* TESTIMONIALS */}
      <section style={{ padding: "100px 5%" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="section-tag">Reviews</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 800, letterSpacing: "-1px", color: "#f1f5f9" }}>
            Loved by thousands of drivers
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="features-grid">
          {[
            { name: "Rishi S.", role: "Daily Commuter", text: "ParkEase has completely changed my morning routine. I know exactly where I'm parking before I leave home. Absolutely brilliant." },
            { name: "Meena P.", role: "Business Owner", text: "The AI prediction feature is scarily accurate. I get to the mall before peak and always find a great spot. Saves me 20 minutes daily." },
            { name: "Arjun K.", role: "Weekend Driver", text: "Booking is super fast and the live slot count is always accurate. Never had a reservation fail on me. Highly recommend!" },
          ].map(t => (
            <div key={t.name} className="testimonial-card">
              <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
              </div>
              <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7, marginBottom: 20 }}>"{t.text}"</p>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{t.name}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 5%", position: "relative", overflow: "hidden" }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(99,102,241,0.08))",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 28, padding: "72px 48px", textAlign: "center",
          position: "relative", overflow: "hidden",
        }}>
          <div className="glow-orb" style={{ width: 300, height: 300, background: "rgba(139,92,246,0.2)", top: -100, right: -80 }} />
          <div className="glow-orb" style={{ width: 250, height: 250, background: "rgba(59,130,246,0.1)", bottom: -80, left: -60 }} />

          <div style={{ position: "relative" }}>
            <span className="section-tag">Start Today</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 50px)", fontWeight: 800, letterSpacing: "-1px", color: "#f1f5f9", marginBottom: 18 }}>
              Ready to park smarter?
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 17, marginBottom: 40, maxWidth: 480, margin: "0 auto 40px" }}>
              Join thousands of drivers already using ParkEase. Your first booking is free.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", maxWidth: 500, margin: "0 auto", flexWrap: "wrap" }}>
              <input className="input-field" placeholder="Enter your email" style={{ maxWidth: 300 }} />
              <button className="btn-primary" style={{ whiteSpace: "nowrap" }}>Get Started Free →</button>
            </div>
            <p style={{ fontSize: 12, color: "#475569", marginTop: 16 }}>No credit card required · Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: "1px solid rgba(139,92,246,0.12)",
        padding: "40px 5%",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ParkingIcon />
          </div>
          <span className="logo-text" style={{ fontSize: 18 }}>ParkEase</span>
        </div>

        <div style={{ display: "flex", gap: 28 }}>
          {["Privacy", "Terms", "Support", "Contact"].map(l => (
            <a key={l} className="nav-link" style={{ fontSize: 13 }}>{l}</a>
          ))}
        </div>

        <div style={{ fontSize: 12, color: "#475569" }}>
          © 2026 ParkEase. All rights reserved.
        </div>
      </footer>
    </div>
  );
}