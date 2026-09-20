import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaStar,
  FaMapMarkerAlt,
  FaBolt,
  FaShieldAlt,
  FaLeaf,
  FaCar,
  FaSearch,
  FaCalendarCheck,
  FaSun,
  FaMoon,
  FaLinkedin,
  FaInstagram,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

export default function LandingPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("home");
  const [subscribedEmail, setSubscribedEmail] = useState("");
  const [subscribedMsg, setSubscribedMsg] = useState("");
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const isDark = resolvedTheme === "dark";

  // Toggle between dark and light theme
  const handleToggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!subscribedEmail) return;
    setSubscribedMsg("Thank you for subscribing!");
    setSubscribedEmail("");
    setTimeout(() => setSubscribedMsg(""), 4000);
  };

  const testimonials = [
    {
      quote:
        "ParkEase has completely changed my daily commute. I save so much time now!",
      name: "Rohan Mehta",
      role: "Daily Commuter",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=140&auto=format&fit=crop&q=80",
    },
    {
      quote:
        "The AI suggestions are super accurate. I always find a spot, even during peak hours.",
      name: "Priya Singh",
      role: "Working Professional",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=140&auto=format&fit=crop&q=80",
    },
    {
      quote:
        "Clean UI, fast booking and reliable service. Highly recommended!",
      name: "Amit Verma",
      role: "Business Owner",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140&auto=format&fit=crop&q=80",
    },
  ];

  const nextTestimonial = () => {
    setTestimonialIdx((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setTestimonialIdx(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B1120] text-[#0F172A] dark:text-white font-sans selection:bg-[#6366F1] selection:text-white transition-colors duration-300">
      {/* ── TOP NAVBAR ───────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#5B4DF5] to-[#7B6EF6] flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              {/* Stylized P Logo */}
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M7 4h6a5 5 0 0 1 5 5c0 2.76-2.24 5-5 5H9.5v6H7V4zm2.5 7.5H13a2.5 2.5 0 0 0 0-5H9.5v5z" />
                <circle cx="17.5" cy="18" r="2" fill="#22C55E" />
              </svg>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-[#0F172A] dark:text-white font-heading transition-colors">
              ParkEase
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a
              href="#home"
              onClick={() => setActiveTab("home")}
              className={`relative py-1 transition-colors hover:text-[#0F172A] dark:hover:text-white ${
                activeTab === "home"
                  ? "text-[#5B4DF5] dark:text-[#818CF8] font-semibold after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[2px] after:bg-[#5B4DF5] after:rounded-full"
                  : ""
              }`}
            >
              Home
            </a>
            <a
              href="#features"
              onClick={() => setActiveTab("features")}
              className={`relative py-1 transition-colors hover:text-[#0F172A] dark:hover:text-white ${
                activeTab === "features"
                  ? "text-[#5B4DF5] dark:text-[#818CF8] font-semibold after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[2px] after:bg-[#5B4DF5] after:rounded-full"
                  : ""
              }`}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setActiveTab("how-it-works")}
              className={`relative py-1 transition-colors hover:text-[#0F172A] dark:hover:text-white ${
                activeTab === "how-it-works"
                  ? "text-[#5B4DF5] dark:text-[#818CF8] font-semibold after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[2px] after:bg-[#5B4DF5] after:rounded-full"
                  : ""
              }`}
            >
              How It Works
            </a>
            <a
              href="#pricing"
              onClick={() => setActiveTab("pricing")}
              className={`relative py-1 transition-colors hover:text-[#0F172A] dark:hover:text-white ${
                activeTab === "pricing"
                  ? "text-[#5B4DF5] dark:text-[#818CF8] font-semibold after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[2px] after:bg-[#5B4DF5] after:rounded-full"
                  : ""
              }`}
            >
              Pricing
            </a>
            <a
              href="#contact"
              onClick={() => setActiveTab("contact")}
              className={`relative py-1 transition-colors hover:text-[#0F172A] dark:hover:text-white ${
                activeTab === "contact"
                  ? "text-[#5B4DF5] dark:text-[#818CF8] font-semibold after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[2px] after:bg-[#5B4DF5] after:rounded-full"
                  : ""
              }`}
            >
              Contact
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={handleToggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-600 dark:text-amber-400 hover:text-[#0F172A] hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
              title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
            >
              {isDark ? (
                <FaSun className="w-4 h-4 text-amber-400 animate-spin-slow" />
              ) : (
                <FaMoon className="w-4 h-4 text-slate-700" />
              )}
            </button>
            <Link
              to="/login"
              className="px-5 py-2.5 text-sm font-semibold text-[#0F172A] dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0F172A] dark:bg-[#5B4DF5] rounded-xl hover:bg-slate-800 dark:hover:bg-[#4C3EE3] transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              Get Started <FaArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ─────────────────────────────────────── */}
      <section id="home" className="relative pt-12 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & Action */}
            <div className="lg:col-span-6 z-10">
              {/* Badge */}
              <div className="inline-block mb-4">
                <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-slate-600 dark:text-indigo-300 bg-slate-100/80 dark:bg-indigo-950/60 px-3.5 py-1.5 rounded-full border border-slate-200/60 dark:border-indigo-800/40 transition-colors">
                  SMART PARKING FOR A SMARTER TOMORROW
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-[4.2rem] font-extrabold text-[#0F172A] dark:text-white tracking-tight leading-[1.1] mb-6 font-heading transition-colors">
                Find Parking. <br />
                <span className="font-handwriting italic text-[#5B4DF5] dark:text-[#818CF8] text-6xl sm:text-7xl lg:text-[4.75rem] font-bold inline-block transform -rotate-2 mr-2">
                  Without
                </span>{" "}
                the Hassle.
              </h1>

              {/* Description */}
              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed max-w-lg mb-8 transition-colors">
                Real-time availability. AI-powered suggestions. Book your
                parking spot in seconds and make your city a little less chaotic.
              </p>

              {/* CTA Button (Watch Video removed as requested) */}
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <Link
                  to="/register"
                  className="bg-[#0F172A] dark:bg-[#5B4DF5] text-white px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-slate-800 dark:hover:bg-[#4C3EE3] transition-all flex items-center gap-2.5 shadow-lg shadow-slate-900/10 dark:shadow-indigo-500/20 hover:shadow-xl hover:-translate-y-0.5"
                >
                  Find Parking Now <FaArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Social Proof Avatar Row */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex -space-x-2.5 overflow-hidden">
                  <img
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover shadow-sm"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                    alt="Driver 1"
                  />
                  <img
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover shadow-sm"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                    alt="Driver 2"
                  />
                  <img
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover shadow-sm"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Driver 3"
                  />
                  <img
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover shadow-sm"
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                    alt="Driver 4"
                  />
                </div>
                <div>
                  <div className="font-extrabold text-[#0F172A] dark:text-white text-base leading-tight transition-colors">
                    50,000+
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium transition-colors">
                    Drivers already park smarter
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Container */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-950/10 border border-slate-200/80 dark:border-slate-800 aspect-[16/10] sm:aspect-[4/3] bg-slate-900 group">
                {/* City Background Street Image */}
                <img
                  src="/assets/hero_city_street.jpg"
                  alt="Smart City Boulevard"
                  className="w-full h-full object-cover brightness-[0.9] group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Subtle vignette gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

                {/* ── REALISTIC DIGITAL LED PARKING PILLAR SIGN ── */}
                <div className="absolute top-6 right-6 z-20 flex flex-col items-center">
                  <div className="w-24 sm:w-28 bg-[#0B1120]/95 backdrop-blur-md rounded-2xl p-3 border border-slate-700/60 shadow-2xl text-center">
                    {/* Blue Parking "P" Logo */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-[#2563EB] flex items-center justify-center text-white font-extrabold text-2xl shadow-md mb-2">
                      P
                    </div>
                    <div className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-300 tracking-wider mb-1">
                      SPACES
                      <br />
                      AVAILABLE
                    </div>
                    {/* Glowing Green LED Digits */}
                    <div className="bg-[#051E14] border border-[#10B981]/30 rounded-xl py-1 px-2 my-1 shadow-inner">
                      <span className="font-mono text-3xl sm:text-4xl font-black text-[#22C55E] tracking-tight drop-shadow-[0_0_10px_rgba(34,197,94,0.7)]">
                        12
                      </span>
                    </div>
                  </div>
                  {/* Handwritten script underneath */}
                  <span className="font-handwriting text-white text-2xl sm:text-3xl font-bold mt-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] -rotate-6">
                    For Cleaner Cities
                  </span>
                </div>

                {/* ── FLOATING CARD 1: Parking spot found! (Top Center/Left) ── */}
                <div className="absolute top-8 left-6 sm:left-10 z-20 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-white/80 dark:border-slate-700/80 max-w-[230px] animate-bounce-slow transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-[#5B4DF5] dark:text-indigo-400 shrink-0 mt-0.5">
                      <FaMapMarkerAlt className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0F172A] dark:text-white leading-tight">
                        Parking spot found!
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        City Mall, Kanpur
                      </div>
                      <div className="text-[10px] font-semibold text-[#059669] dark:text-[#34D399] flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                        2 spots available
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── FLOATING CARD 2: Save Time / Park Smarter (Bottom Left) ── */}
                <div className="absolute bottom-6 left-6 z-20 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-white/80 dark:border-slate-700/80 flex items-center gap-3 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#5B4DF5] to-[#8B5CF6] flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
                    <FaCar className="w-5 h-5" />
                  </div>
                  <div className="text-left pr-2">
                    <div className="text-xs font-bold text-[#0F172A] dark:text-white leading-tight">
                      Save Time
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                      Park Smarter
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Live Better</div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#0F172A] dark:bg-slate-700 text-white flex items-center justify-center text-xs hover:bg-slate-800 cursor-pointer shadow-sm">
                    <FaArrowRight className="w-2.5 h-2.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── METRICS / SOCIAL PROOF RIBBON ─────────────────────── */}
      <section className="bg-white dark:bg-[#0E1726] border-y border-slate-100 dark:border-slate-800/80 py-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center">
            {/* Metric 1 */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-[#5B4DF5] dark:text-indigo-400 shrink-0 transition-colors">
                <FaCar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-[#0F172A] dark:text-white transition-colors">
                  500+
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium transition-colors">
                  Parking Locations
                </div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-[#8B5CF6] dark:text-purple-400 shrink-0 transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-[#0F172A] dark:text-white transition-colors">
                  50K+
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium transition-colors">
                  Happy Drivers
                </div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-[#3B82F6] dark:text-blue-400 shrink-0 transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="9" strokeWidth="2" />
                  <polyline points="12 7 12 12 15 15" strokeWidth="2" />
                </svg>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-[#0F172A] dark:text-white transition-colors">
                  30s
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium transition-colors">
                  Average Booking Time
                </div>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-[#10B981] dark:text-emerald-400 shrink-0 transition-colors">
                <FaLeaf className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-[#0F172A] dark:text-white transition-colors">
                  35%
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium transition-colors">
                  Less Traffic Congestion
                </div>
              </div>
            </div>

            {/* Metric 5 / Skyline Banner */}
            <div className="col-span-2 md:col-span-1 flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                  Building
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Cleaner, Smarter Cities
                </div>
              </div>
              {/* Skyline SVG Illustration */}
              <div className="w-20 text-slate-300 dark:text-slate-600">
                <svg viewBox="0 0 100 40" className="w-full h-8 fill-current">
                  <path d="M0 40h100V25h-5v-5h-8V8h-6v12h-4v-8h-6v13h-7V15h-8v15h-5V5h-7v25h-6V18h-8v12h-5V22h-6v18H0z" />
                  <circle cx="70" cy="15" r="1.5" fill="#5B4DF5" />
                  <circle cx="45" cy="12" r="1.5" fill="#10B981" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY PARKEASE: A Smarter Way to Park ───────────────── */}
      <section id="features" className="py-24 bg-[#FAFAFA] dark:bg-[#0B1120] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Section Header */}
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#5B4DF5] dark:text-[#818CF8] mb-2">
            WHY PARKEASE
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] dark:text-white tracking-tight font-heading mb-4 transition-colors">
            A Smarter Way to Park
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base sm:text-lg mb-16 transition-colors">
            More than just a parking app — ParkEase makes your everyday commute
            simpler, faster and stress-free.
          </p>

          {/* 4 Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {/* Card 1: Real-Time Availability */}
            <div className="bg-white dark:bg-[#111C30] rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/60 flex items-center justify-center text-[#5B4DF5] dark:text-indigo-400 mb-6 shadow-inner transition-colors">
                <FaBolt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-2 font-heading transition-colors">
                Real-Time Availability
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed transition-colors">
                See live parking slots across the city.
              </p>
            </div>

            {/* Card 2: AI-Powered Suggestions */}
            <div className="bg-white dark:bg-[#111C30] rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-purple-50/80 dark:bg-purple-950/60 flex items-center justify-center text-[#8B5CF6] dark:text-purple-400 mb-6 shadow-inner transition-colors">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-2 font-heading transition-colors">
                AI-Powered Suggestions
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed transition-colors">
                Smart recommendations based on your location and habits.
              </p>
            </div>

            {/* Card 3: Secure & Reliable */}
            <div className="bg-white dark:bg-[#111C30] rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-blue-50/80 dark:bg-blue-950/60 flex items-center justify-center text-[#3B82F6] dark:text-blue-400 mb-6 shadow-inner transition-colors">
                <FaShieldAlt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-2 font-heading transition-colors">
                Secure & Reliable
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed transition-colors">
                Safe payments and verified parking spaces.
              </p>
            </div>

            {/* Card 4: Cleaner Cities */}
            <div className="bg-white dark:bg-[#111C30] rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/60 flex items-center justify-center text-[#10B981] dark:text-emerald-400 mb-6 shadow-inner transition-colors">
                <FaLeaf className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-2 font-heading transition-colors">
                Cleaner Cities
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed transition-colors">
                Help reduce congestion and make cities greener for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS: Park in 3 simple steps ───────────────── */}
      <section id="how-it-works" className="py-24 bg-white dark:bg-[#0E1726] border-t border-slate-100 dark:border-slate-800/80 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left Column: Phone Mount in Car Cockpit */}
            <div className="lg:col-span-6 relative">
              {/* Handwritten script on left */}
              <div className="hidden sm:block absolute -top-8 -left-6 z-20">
                <span className="font-handwriting text-[#0F172A] dark:text-indigo-200 text-3xl sm:text-4xl font-bold -rotate-6 inline-block transition-colors">
                  Park Smarter Anywhere
                </span>
                {/* Curved arrow pointing to phone */}
                <svg
                  className="w-12 h-12 text-slate-700 dark:text-slate-400 ml-8 -mt-1 transition-colors"
                  viewBox="0 0 50 50"
                  fill="none"
                >
                  <path
                    d="M10 10 Q 25 35 40 40"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M32 42 L 40 40 L 38 32"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Realistic Phone in Dashboard Mount */}
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-slate-800 bg-black aspect-[4/3] group">
                <img
                  src="/assets/phone_car_mount.jpg"
                  alt="ParkEase App in Car Mount"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Subtle lighting overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

                {/* Live In-App Overlay on Phone */}
                <div className="absolute bottom-6 left-6 right-6 z-20">
                  <div className="bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/60 dark:border-slate-700/80 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-sm font-bold text-[#0F172A] dark:text-white">
                          City Mall Parking
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Kanpur • 📍 0.5 km • ₹40/hr
                        </div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        8 Slots Open
                      </span>
                    </div>
                    <Link
                      to="/register"
                      className="w-full py-2.5 bg-[#5B4DF5] hover:bg-[#4C3EE3] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      Book Now <FaArrowRight className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Steps 01 -> 02 -> 03 */}
            <div className="lg:col-span-6">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#5B4DF5] dark:text-[#818CF8] mb-2">
                HOW IT WORKS
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] dark:text-white tracking-tight font-heading mb-12 transition-colors">
                Park in 3 simple steps
              </h2>

              {/* Vertical Stepper */}
              <div className="relative space-y-10">
                {/* Connecting dashed line */}
                <div className="absolute top-6 bottom-6 left-6 w-[2px] border-l-2 border-dashed border-slate-200 dark:border-slate-700/80 -z-0" />

                {/* Step 01 */}
                <div className="relative flex items-start gap-6 z-10">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm transition-colors">
                    01
                  </div>
                  <div className="pt-1">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-[#5B4DF5] dark:text-indigo-400">
                        <FaSearch className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0F172A] dark:text-white font-heading transition-colors">
                        Search
                      </h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-md transition-colors">
                      Enter your destination or enable location to find nearby
                      parking spots.
                    </p>
                  </div>
                </div>

                {/* Step 02 */}
                <div className="relative flex items-start gap-6 z-10">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm transition-colors">
                    02
                  </div>
                  <div className="pt-1">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-[#8B5CF6] dark:text-purple-400">
                        <FaCalendarCheck className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0F172A] dark:text-white font-heading transition-colors">
                        Compare & Book
                      </h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-md transition-colors">
                      View real-time availability, prices and AI suggestions.
                      Reserve in one tap.
                    </p>
                  </div>
                </div>

                {/* Step 03 */}
                <div className="relative flex items-start gap-6 z-10">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm transition-colors">
                    03
                  </div>
                  <div className="pt-1">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#3B82F6] dark:text-blue-400">
                        <FaCar className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0F172A] dark:text-white font-heading transition-colors">
                        Park & Go
                      </h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-md transition-colors">
                      Navigate to your spot and park with confidence. No more
                      hunting around.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button & Handwritten Callout */}
              <div className="mt-12 flex items-center gap-6">
                <Link
                  to="/register"
                  className="bg-[#5B4DF5] hover:bg-[#4C3EE3] text-white px-8 py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  Get Started <FaArrowRight className="w-3.5 h-3.5" />
                </Link>
                {/* Handwritten Callout */}
                <div className="flex items-center gap-2">
                  <svg
                    className="w-8 h-8 text-slate-600 dark:text-slate-400 -rotate-12 transition-colors"
                    viewBox="0 0 40 40"
                    fill="none"
                  >
                    <path
                      d="M10 20 Q 25 10 30 25"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M24 25 L 30 25 L 30 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="font-handwriting text-slate-700 dark:text-slate-300 text-2xl font-bold transition-colors">
                    It's that easy!
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS: What our users say ───────────────────── */}
      <section className="py-24 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-purple-50/40 dark:from-[#0B1120] dark:via-[#0E1726] dark:to-[#111C30] border-t border-slate-100 dark:border-slate-800/80 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#5B4DF5] dark:text-[#818CF8] mb-2">
                TRUSTED BY DRIVERS LIKE YOU
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] dark:text-white tracking-tight font-heading transition-colors">
                What our users say
              </h2>
            </div>
            {/* Carousel Nav Arrows */}
            <div className="flex items-center gap-2.5 mt-6 md:mt-0">
              <button
                onClick={prevTestimonial}
                className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                title="Previous testimonial"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={nextTestimonial}
                className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                title="Next testimonial"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Testimonial Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((item, idx) => (
              <div
                key={idx}
                className={`bg-white dark:bg-[#111C30] rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  idx === testimonialIdx
                    ? "ring-2 ring-[#5B4DF5]/40 dark:ring-indigo-500/50"
                    : ""
                }`}
              >
                <p className="text-slate-700 dark:text-slate-200 text-base font-medium leading-relaxed mb-8 transition-colors">
                  "{item.quote}"
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                    />
                    <div>
                      <div className="font-bold text-sm text-[#0F172A] dark:text-white transition-colors">
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
                        {item.role}
                      </div>
                    </div>
                  </div>
                  {/* 5 Stars */}
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer id="contact" className="bg-white dark:bg-[#0B1120] border-t border-slate-100 dark:border-slate-800/80 pt-16 pb-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
            {/* Col 1: Brand & Tagline */}
            <div className="col-span-2">
              <Link to="/" className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#5B4DF5] flex items-center justify-center text-white shadow-sm">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M7 4h6a5 5 0 0 1 5 5c0 2.76-2.24 5-5 5H9.5v6H7V4zm2.5 7.5H13a2.5 2.5 0 0 0 0-5H9.5v5z" />
                    <circle cx="17.5" cy="18" r="2" fill="#22C55E" />
                  </svg>
                </div>
                <span className="text-2xl font-extrabold text-[#0F172A] dark:text-white font-heading transition-colors">
                  ParkEase
                </span>
              </Link>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm transition-colors">
                Smarter Parking. Cleaner Cities.
              </p>
            </div>

            {/* Col 2: Product */}
            <div>
              <h4 className="text-sm font-bold text-[#0F172A] dark:text-white mb-4 font-heading transition-colors">
                Product
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <li>
                  <a href="#features" className="hover:text-[#5B4DF5] dark:hover:text-indigo-400 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-[#5B4DF5] dark:hover:text-indigo-400 transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-[#5B4DF5] dark:hover:text-indigo-400 transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-[#5B4DF5] dark:hover:text-indigo-400 transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Company */}
            <div>
              <h4 className="text-sm font-bold text-[#0F172A] dark:text-white mb-4 font-heading transition-colors">
                Company
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <li>
                  <a href="#about" className="hover:text-[#5B4DF5] dark:hover:text-indigo-400 transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#careers" className="hover:text-[#5B4DF5] dark:hover:text-indigo-400 transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-[#5B4DF5] dark:hover:text-indigo-400 transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#blog" className="hover:text-[#5B4DF5] dark:hover:text-indigo-400 transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Legal */}
            <div>
              <h4 className="text-sm font-bold text-[#0F172A] dark:text-white mb-4 font-heading transition-colors">
                Legal
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <li>
                  <a href="#privacy" className="hover:text-[#5B4DF5] dark:hover:text-indigo-400 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#terms" className="hover:text-[#5B4DF5] dark:hover:text-indigo-400 transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#cookies" className="hover:text-[#5B4DF5] dark:hover:text-indigo-400 transition-colors">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#support" className="hover:text-[#5B4DF5] dark:hover:text-indigo-400 transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 5: Stay Updated */}
            <div className="col-span-2 md:col-span-1">
              <h4 className="text-sm font-bold text-[#0F172A] dark:text-white mb-2 font-heading transition-colors">
                Stay Updated
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 transition-colors">
                Get the latest updates and offers.
              </p>
              <form onSubmit={handleSubscribe} className="relative flex items-center">
                <input
                  type="email"
                  value={subscribedEmail}
                  onChange={(e) => setSubscribedEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-3.5 pr-12 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-[#0F172A] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DF5]/20 focus:border-[#5B4DF5] transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 w-8 h-8 rounded-lg bg-[#5B4DF5] text-white flex items-center justify-center hover:bg-[#4C3EE3] transition-colors shadow-sm"
                  title="Subscribe"
                >
                  <FaArrowRight className="w-3 h-3" />
                </button>
              </form>
              {subscribedMsg && (
                <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
                  {subscribedMsg}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              © 2025 ParkEase. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <FaLinkedin className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <FaTwitter className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <FaYoutube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}