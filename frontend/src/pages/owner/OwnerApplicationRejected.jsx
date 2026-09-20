import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaTimesCircle, FaArrowLeft, FaRedoAlt, FaExclamationTriangle, FaShieldAlt } from "react-icons/fa";
import AuthBackground from "../../components/common/AuthBackground";
import { clearAuth, getRejectionReason } from "../../api/api";

export default function OwnerApplicationRejected() {
  const navigate = useNavigate();
  const rejectionReason = getRejectionReason();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const handleReapply = () => {
    clearAuth();
    navigate("/register/owner");
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden font-sans px-4 py-12">
      <AuthBackground />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="parkease-card rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
          {/* Top Banner */}
          <div className="bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/40 px-6 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-600 shrink-0">
              <FaExclamationTriangle size={15} />
            </div>
            <div>
              <h1 className="text-slate-900 dark:text-white font-bold text-sm">Application Status: Declined</h1>
              <p className="text-rose-700 dark:text-rose-400 text-xs">ParkEase Partner Onboarding Review</p>
            </div>
          </div>

          <div className="p-7">
            {/* Status Icon */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-600 flex items-center justify-center mb-3.5 shadow-sm">
                <FaTimesCircle size={28} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Partner Application Not Approved</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                After verifying your registration and documentation, our administrative compliance team was unable to approve your facility listing at this time.
              </p>
            </div>

            {/* Rejection Reason */}
            {rejectionReason && (
              <div className="mb-5">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mb-2">Reviewer Remarks & Notes</p>
                <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl p-4">
                  <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed font-medium">{rejectionReason}</p>
                </div>
              </div>
            )}

            {/* What You Can Do */}
            <div className="mb-6">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mb-2.5">Recommended Next Steps</p>
              <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <InfoItem text="Review the compliance notes above for missing credentials" />
                <InfoItem text="Ensure all property deeds and tax documents are clear and legible" />
                <InfoItem text="Re-submit your application with updated documentation" />
                <InfoItem text="Contact partner-support@parkease.com for clarification" />
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 mb-6">
              <FaShieldAlt className="text-slate-400 shrink-0 mt-0.5" size={13} />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Owner dashboard privileges are inactive. You may re-apply anytime using the button below.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <button
                onClick={handleReapply}
                className="w-full py-3 rounded-xl parkease-btn-primary font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <FaRedoAlt size={11} /> Submit Corrected Application
              </button>
              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs font-semibold flex items-center justify-center gap-2"
              >
                <FaArrowLeft size={11} /> Return to Login
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function InfoItem({ text }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-primary-600 dark:text-primary-400 text-xs font-bold shrink-0 mt-0.5">✓</span>
      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{text}</p>
    </div>
  );
}

