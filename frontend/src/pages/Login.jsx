import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import AuthBackground from "../components/common/AuthBackground";
import { authAPI, saveAuth, saveOwnerAppStatus } from "../api/api";

export default function Login() {
  const navigate = useNavigate();

  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPassword,setShowPassword]= useState(false);
  const [loading,     setLoading]     = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { toast.error("Please fill all fields"); return; }

    setLoading(true);
    try {
      const data = await authAPI.login({ email, password });

      saveAuth(data);
      toast.success(`Welcome back, ${data.name}!`);

      setTimeout(() => {
        if (data.role === "USER")  navigate("/user/dashboard");
        if (data.role === "OWNER") navigate("/owner/dashboard");
        if (data.role === "ADMIN") navigate("/admin/dashboard");
      }, 800);
    } catch (err) {
      // ── Special handling for owner application states ─────────────────────
      // Backend returns HTTP 403 with { applicationStatus, message, ... }
      if (err.applicationStatus === "OWNER_PENDING") {
        saveOwnerAppStatus({ applicationStatus: "OWNER_PENDING", applicationRef: err.applicationRef, email });
        toast.info(err.message || "Your owner application is awaiting admin approval.");
        setTimeout(() => navigate("/owner/application-pending"), 1000);
        return;
      }
      if (err.applicationStatus === "OWNER_REJECTED") {
        saveOwnerAppStatus({ applicationStatus: "OWNER_REJECTED", rejectionReason: err.rejectionReason, email });
        toast.error(err.message || "Your owner application was not approved.");
        setTimeout(() => navigate("/owner/application-rejected"), 1000);
        return;
      }
      toast.error(err.message || "Invalid email or password.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden font-sans">
      <ToastContainer theme="dark" />
      <AuthBackground />

      {/* Back Button */}
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors bg-white/90 dark:bg-[#131C31]/90 px-4 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-md"
      >
        <FaArrowLeft size={13} />
        <span className="text-xs font-semibold">Back to Home</span>
      </motion.button>

      {/* Branding */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center mb-6 px-4"
      >
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-[#5B4DF5] flex items-center justify-center font-bold text-white text-base shadow-sm">
            P
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
            ParkEase
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight font-heading">
          Log in to your account
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-xs md:text-sm leading-relaxed">
          Welcome back! Access your parking spaces, bookings, and live availability.
        </p>
      </motion.div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative z-10 w-full max-w-md bg-white dark:bg-[#131C31] border border-slate-200/80 dark:border-slate-800 p-8 rounded-3xl shadow-xl transition-colors duration-200"
      >
        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-[#5B4DF5] focus:ring-2 focus:ring-[#5B4DF5]/15 focus:outline-none transition-all placeholder-slate-400 text-sm font-medium"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-[#5B4DF5] focus:ring-2 focus:ring-[#5B4DF5]/15 focus:outline-none transition-all placeholder-slate-400 text-sm font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
              </button>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ translateY: -1 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleLogin}
          disabled={loading}
          className="w-full mt-6 py-3.5 rounded-xl bg-[#5B4DF5] hover:bg-[#4F41E5] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Logging in...</>
          ) : "Log In"}
        </motion.button>

        <p className="text-center text-slate-500 dark:text-slate-400 text-xs mt-6 font-medium">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#5B4DF5] font-bold hover:underline">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}