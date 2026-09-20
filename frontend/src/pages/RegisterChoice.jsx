import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCar, FaBuilding, FaArrowRight, FaShieldAlt, FaClock, FaCheckCircle } from "react-icons/fa";
import AuthBackground from "../components/common/AuthBackground";

export default function RegisterChoice() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden font-sans px-4 py-12">
      <AuthBackground />

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center mb-10 max-w-xl"
      >
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-[#5B4DF5] flex items-center justify-center font-bold text-white text-sm shadow-sm">
            P
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
            ParkEase
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3 font-heading">
          Create your ParkEase account
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed">
          Choose the account type that best fits your parking needs
        </p>
      </motion.div>

      {/* Choice Cards Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
      >
        {/* Card 1: Find Parking (Normal User) */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative group rounded-3xl p-8 bg-white dark:bg-[#131C31] border border-slate-200/80 dark:border-slate-800 hover:border-[#5B4DF5]/50 shadow-sm hover:shadow-xl flex flex-col justify-between transition-all duration-200"
        >
          {/* Top Badge & Icon */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#EEF2FF] text-[#5B4DF5] dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                Driver & Commuter
              </span>
              <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#5B4DF5] dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center text-xl group-hover:scale-105 transition-transform shadow-sm">
                <FaCar />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-heading">
              Find Parking
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
              Create a personal account to search, reserve, and manage parking spots in real time. Perfect for daily commuters and travelers.
            </p>

            {/* Feature Checklist */}
            <ul className="space-y-2.5 mb-8 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <li className="flex items-center gap-2.5">
                <FaCheckCircle className="text-emerald-500 flex-shrink-0 text-sm" />
                <span>Instant spot discovery & reserved slot booking</span>
              </li>
              <li className="flex items-center gap-2.5">
                <FaCheckCircle className="text-emerald-500 flex-shrink-0 text-sm" />
                <span>Live turn-by-turn navigation & directions</span>
              </li>
              <li className="flex items-center gap-2.5">
                <FaCheckCircle className="text-emerald-500 flex-shrink-0 text-sm" />
                <span>Seamless contactless payments & instant receipts</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <button
            id="register-user-btn"
            onClick={() => navigate("/register/user")}
            className="w-full py-3.5 px-6 rounded-xl bg-[#5B4DF5] hover:bg-[#4F41E5] text-white font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Create User Account</span>
            <FaArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>

        {/* Card 2: Become a Partner (Parking Owner) */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative group rounded-3xl p-8 bg-white dark:bg-[#131C31] border border-slate-200/80 dark:border-slate-800 hover:border-[#5B4DF5]/50 shadow-sm hover:shadow-xl flex flex-col justify-between transition-all duration-200"
        >
          {/* Top Badge & Icon */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-100 dark:border-purple-900/50">
                Property & Lot Owner
              </span>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center text-xl group-hover:scale-105 transition-transform shadow-sm">
                <FaBuilding />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-heading">
              Become a Parking Partner
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
              List and monetize your parking facilities on ParkEase. Verified partners gain access to live occupancy management and revenue tracking.
            </p>

            {/* Feature Checklist */}
            <ul className="space-y-2.5 mb-8 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <li className="flex items-center gap-2.5">
                <FaCheckCircle className="text-purple-600 dark:text-purple-400 flex-shrink-0 text-sm" />
                <span>Monetize open lots, garages & multi-level complexes</span>
              </li>
              <li className="flex items-center gap-2.5">
                <FaCheckCircle className="text-purple-600 dark:text-purple-400 flex-shrink-0 text-sm" />
                <span>Real-time occupancy analytics & slot health telemetry</span>
              </li>
              <li className="flex items-center gap-2.5">
                <FaShieldAlt className="text-amber-500 flex-shrink-0 text-sm" />
                <span className="text-amber-700 dark:text-amber-400 font-semibold">Fast verification & admin review workflow</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <button
            id="register-owner-btn"
            onClick={() => navigate("/register/owner")}
            className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Apply as Partner</span>
            <FaArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </motion.div>

      {/* Footer / Login Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 text-center"
      >
        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#5B4DF5] font-bold hover:underline"
          >
            Log In
          </Link>
        </p>

        <div className="mt-8 flex items-center justify-center gap-6 text-slate-400 dark:text-slate-500 text-xs">
          <span className="flex items-center gap-1.5"><FaShieldAlt /> Enterprise Security</span>
          <span>•</span>
          <span className="flex items-center gap-1.5"><FaClock /> Verified Facilities</span>
          <span>•</span>
          <span className="flex items-center gap-1.5"><FaCheckCircle /> 24/7 Support</span>
        </div>
      </motion.div>
    </div>
  );
}
