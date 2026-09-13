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
  const [role,        setRole]        = useState("USER");
  const [showPassword,setShowPassword]= useState(false);
  const [loading,     setLoading]     = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !phone) { toast.error("Please fill all fields"); return; }

    setLoading(true);
    try {
      const data = await authAPI.register({ name, email, password, phone, role });
      saveAuth(data);
      toast.success("Account created successfully!");

      setTimeout(() => {
        if (data.role === "USER")  navigate("/user/dashboard");
        if (data.role === "OWNER") navigate("/owner/dashboard");
        if (data.role === "ADMIN") navigate("/admin/dashboard");
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 w-full max-w-md bg-[#0a0a1a]/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-[0_0_40px_rgba(139,92,246,0.15)] max-h-[85vh] overflow-y-auto"
      >
        <div className="text-center mb-6">
          <p className="text-xl font-medium text-gray-200">Create Account</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide ml-1">Full Name</label>
            <input placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple focus:outline-none transition-all placeholder-gray-500" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide ml-1">Email</label>
            <input placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple focus:outline-none transition-all placeholder-gray-500" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide ml-1">Phone</label>
            <input placeholder="+91 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple focus:outline-none transition-all placeholder-gray-500" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide ml-1">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="Create Password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple focus:outline-none transition-all placeholder-gray-500" />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide ml-1">Select Role</label>
            <div className="relative">
              <select value={role} onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple focus:outline-none transition-all appearance-none cursor-pointer">
                <option value="USER"  className="bg-[#0f0c29]">User</option>
                <option value="OWNER" className="bg-[#0f0c29]">Owner</option>
                <option value="ADMIN" className="bg-[#0f0c29]">Admin</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(139,92,246,0.4)" }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRegister}
          disabled={loading}
          className="w-full mt-8 py-3.5 rounded-xl bg-gradient-to-r from-neon-purple to-violet-600 text-white font-bold text-lg shadow-lg hover:from-purple-500 hover:to-violet-500 transition-all border border-neon-purple/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating...</> : "Sign Up"}
        </motion.button>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-white font-bold hover:text-neon-purple hover:underline transition-colors decoration-2 underline-offset-4">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}