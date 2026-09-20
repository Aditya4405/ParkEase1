import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import AuthBackground from "../components/common/AuthBackground";
import { authAPI, saveAuth } from  "../api/api";

export default function Register() {
  const navigate = useNavigate();

  const [name,        setName]        = useState("");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [phone,       setPhone]       = useState("");
  const [showPassword,setShowPassword]= useState(false);
  const [loading,     setLoading]     = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !phone) { toast.error("Please fill all fields"); return; }

    setLoading(true);
    try {
      // Regular registration always creates USER accounts.
      // Owners must use the dedicated owner registration flow.
      const data = await authAPI.register({ name, email, password, phone });
      saveAuth(data);
      toast.success("Account created successfully!");

      setTimeout(() => {
        navigate("/user/dashboard");
      }, 800);
    } catch (err) {
      toast.error(err.message || "Registration failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden font-sans">
      <ToastContainer theme="dark" />
      <AuthBackground />

      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center mb-6 px-4"
      >
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">ParkEase</h1>
        <p className="text-gray-300 max-w-xl mx-auto text-sm bg-black/30 p-2 rounded-lg backdrop-blur-sm border border-white/5">
          Join the smart parking revolution.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative z-10 w-full max-w-md bg-white dark:bg-[#131C31] border border-slate-200/80 dark:border-slate-800 p-8 rounded-3xl shadow-xl max-h-[85vh] overflow-y-auto transition-colors duration-200"
      >
        <div className="text-center mb-6">
          <p className="text-xl font-bold text-slate-900 dark:text-white">Create User Account</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sign up to find and book parking spots</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Full Name</label>
            <input
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5B4DF5] focus:ring-2 focus:ring-[#5B4DF5]/15 transition-all text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Email</label>
            <input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5B4DF5] focus:ring-2 focus:ring-[#5B4DF5]/15 transition-all text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Phone</label>
            <input
              type="tel"
              placeholder="+91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5B4DF5] focus:ring-2 focus:ring-[#5B4DF5]/15 transition-all text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5B4DF5] focus:ring-2 focus:ring-[#5B4DF5]/15 transition-all text-sm font-medium pr-10"
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
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full mt-6 py-3 rounded-xl bg-[#5B4DF5] hover:bg-[#4F41E5] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating...</> : "Sign Up"}
        </button>

        <p className="text-center text-slate-500 dark:text-slate-400 text-xs mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[#5B4DF5] font-semibold hover:underline transition-colors">Login</Link>
        </p>

        {/* Owner registration link */}
        <div className="mt-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60">
          <p className="text-center text-xs text-indigo-950 dark:text-indigo-300">
            Want to list your parking spaces?{" "}
            <Link to="/owner/register" className="text-[#5B4DF5] dark:text-indigo-400 font-bold hover:underline transition-colors">
              Become a Parking Partner →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}