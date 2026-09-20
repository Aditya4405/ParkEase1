import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaArrowLeft, FaCar } from "react-icons/fa";
import AuthBackground from "../components/common/AuthBackground";
import { authAPI, saveAuth } from "../api/api";

export default function UserRegister() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name.trim()) { toast.error("Full name is required"); return; }
    if (!email.trim() || !email.includes("@")) { toast.error("Valid email address is required"); return; }
    if (!phone.trim()) { toast.error("Phone number is required"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (password !== confirmPassword) { toast.error("Passwords do not match"); return; }

    setLoading(true);
    try {
      const data = await authAPI.register({ name, email, password, phone });
      saveAuth(data);
      toast.success("Account created successfully! Welcome to ParkEase.");

      setTimeout(() => {
        navigate("/user/dashboard");
      }, 800);
    } catch (err) {
      toast.error(err.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden font-sans px-4 py-12">
      <ToastContainer theme="dark" />
      <AuthBackground />

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center mb-6 max-w-md"
      >
        <Link
          to="/register"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-4"
        >
          <FaArrowLeft size={10} /> Back to account selection
        </Link>
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[#EEF2FF] dark:bg-indigo-950/60 text-[#5B4DF5] dark:text-indigo-400 flex items-center justify-center text-xl shadow-sm">
          <FaCar />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
          Create User Account
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1">
          Join ParkEase to find, reserve, and manage parking spaces effortlessly
        </p>
      </motion.div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md bg-white dark:bg-[#131C31] border border-slate-200/80 dark:border-slate-800 p-8 rounded-3xl shadow-xl transition-colors duration-200"
      >
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Full Name
            </label>
            <input
              type="text"
              id="user-reg-name"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5B4DF5] focus:ring-2 focus:ring-[#5B4DF5]/15 transition-all text-sm font-medium"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Email Address
            </label>
            <input
              type="email"
              id="user-reg-email"
              placeholder="rahul@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5B4DF5] focus:ring-2 focus:ring-[#5B4DF5]/15 transition-all text-sm font-medium"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Phone Number
            </label>
            <input
              type="tel"
              id="user-reg-phone"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5B4DF5] focus:ring-2 focus:ring-[#5B4DF5]/15 transition-all text-sm font-medium"
              required
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
                id="user-reg-password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5B4DF5] focus:ring-2 focus:ring-[#5B4DF5]/15 transition-all text-sm font-medium pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="user-reg-confirm-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5B4DF5] focus:ring-2 focus:ring-[#5B4DF5]/15 transition-all text-sm font-medium pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="user-create-account-btn"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#5B4DF5] hover:bg-[#4F41E5] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Account...
              </span>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center space-y-1.5">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-[#5B4DF5] hover:underline font-bold transition-colors">
              Log In
            </Link>
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
            Want to list parking spaces?{" "}
            <Link to="/register/owner" className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold transition-colors">
              Apply as Partner
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
