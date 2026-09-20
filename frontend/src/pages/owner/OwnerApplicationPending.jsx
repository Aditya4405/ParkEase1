import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCheckCircle, FaArrowLeft, FaSyncAlt, FaShieldAlt, FaTimesCircle, FaClock } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import AuthBackground from "../../components/common/AuthBackground";
import { ownerApplicationAPI, getToken, getOwnerAppRef, clearAuth } from "../../api/api";

export default function OwnerApplicationPending() {
  const navigate = useNavigate();
  const [appData, setAppData] = useState(null);
  const [checking, setChecking] = useState(false);

  // Retrieve stored reference or fallback to most recent
  const storedRef = getOwnerAppRef();
  const displayRef = appData?.applicationRef || storedRef || "PE-2026-00001";

  const checkStatus = useCallback(async (isManual = false) => {
    const ref = storedRef || appData?.applicationRef || "PE-2026-00001";

    setChecking(true);
    try {
      let data = null;

      // Always prioritize checkStatusByRef so it queries this specific application
      // even if an admin token is present in the browser's localStorage!
      if (ref) {
        data = await ownerApplicationAPI.checkStatusByRef(ref);
      } else if (getToken()) {
        data = await ownerApplicationAPI.getMyApplication();
      }

      if (data) {
        setAppData(data);

        if (data.applicationStatus === "APPROVED") {
          if (isManual) {
            toast.success("Application is APPROVED! You can now log in to the Owner Dashboard.");
          }
        } else if (data.applicationStatus === "REJECTED") {
          if (isManual) {
            toast.error("Application was rejected by administrator.");
          }
        } else if (isManual) {
          toast.info("Status is still Pending Review by administrator.");
        }
      }
    } catch {
      if (isManual) {
        toast.info("Status is still Pending Review by administrator.");
      }
    } finally {
      setChecking(false);
    }
  }, [appData?.applicationRef, storedRef]);

  // Initial check on mount
  useEffect(() => {
    checkStatus(false);
  }, [checkStatus]);

  const handleGoToLogin = () => {
    clearAuth();
    navigate("/login", {
      state: { message: "Application approved! Please log in to access your Owner Dashboard." }
    });
  };

  const handleBackToLogin = () => {
    clearAuth();
    navigate("/login");
  };

  const status = appData?.applicationStatus || "PENDING";
  const isApproved = status === "APPROVED";
  const isRejected = status === "REJECTED";

  const formattedDate = appData?.submittedAt
    ? new Date(appData.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden font-sans px-4 py-12">
      <ToastContainer theme="dark" />
      <AuthBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md text-center"
      >
        {/* Animated Badge */}
        {isApproved ? (
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <FaCheckCircle size={32} />
          </div>
        ) : isRejected ? (
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <FaTimesCircle size={32} />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <FaClock size={30} />
          </div>
        )}

        {/* Title & Subtitle */}
        {isApproved ? (
          <>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 font-heading">
              Application Approved!
            </h1>
            <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm mb-1">
              Welcome to the ParkEase Partner Network
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 max-w-sm mx-auto">
              Your application has been verified. Your partner account is now active and ready to use.
            </p>
          </>
        ) : isRejected ? (
          <>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 font-heading">
              Application Not Approved
            </h1>
            <p className="text-rose-600 dark:text-rose-400 font-semibold text-sm mb-1">
              Review Decision
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 max-w-sm mx-auto">
              Your application could not be approved at this time. Please see the administrator reason below.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 font-heading">
              Application Submitted
            </h1>
            <p className="text-slate-700 dark:text-slate-300 font-semibold text-sm mb-1">
              Thank you for applying to become a ParkEase Parking Partner.
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 max-w-sm mx-auto">
              Your application has been successfully submitted and is currently awaiting administrator review.
            </p>
          </>
        )}

        {/* Status Card Box */}
        <div className="bg-white dark:bg-[#131C31] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 text-left shadow-lg mb-6 space-y-4">
          {/* Application ID */}
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Application ID
            </span>
            <span className="text-sm font-extrabold text-[#5B4DF5] font-mono tracking-wide">
              {displayRef}
            </span>
          </div>

          {/* Status Badge */}
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Status
            </span>
            {isApproved ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Approved</span>
              </div>
            ) : isRejected ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-800">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>Rejected</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-800">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Pending Review</span>
              </div>
            )}
          </div>

          {/* Submitted Date */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Submitted
            </span>
            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              {formattedDate}
            </span>
          </div>

          {/* Rejection Reason if any */}
          {isRejected && appData?.rejectionReason && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 block mb-1">
                Reason
              </span>
              <p className="text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800/50">
                {appData.rejectionReason}
              </p>
            </div>
          )}
        </div>

        {/* Informational Banner */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 flex items-center justify-center gap-2">
          <FaShieldAlt className={isApproved ? "text-emerald-500 flex-shrink-0" : "text-[#5B4DF5] flex-shrink-0"} />
          <span>
            {isApproved
              ? "You can now log in with your credentials to access the Owner Dashboard."
              : isRejected
              ? "You may address the issues and submit a new partner application."
              : "You will be able to access your Owner Dashboard once approved."}
          </span>
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          {isApproved ? (
            <>
              <button
                id="login-owner-dashboard-btn"
                type="button"
                onClick={handleGoToLogin}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Log In to Owner Dashboard</span>
                <FaCheckCircle size={14} />
              </button>
              <button
                type="button"
                onClick={() => checkStatus(true)}
                disabled={checking}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <FaSyncAlt className={checking ? "animate-spin" : ""} size={11} />
                <span>{checking ? "Checking..." : "Re-check Status"}</span>
              </button>
            </>
          ) : isRejected ? (
            <>
              <button
                type="button"
                onClick={() => navigate("/register/owner")}
                className="w-full py-3 px-4 rounded-xl bg-[#5B4DF5] hover:bg-[#4F41E5] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Submit New Application</span>
              </button>
              <button
                type="button"
                onClick={handleBackToLogin}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <FaArrowLeft size={11} />
                <span>Back to Login</span>
              </button>
            </>
          ) : (
            <>
              <button
                id="check-status-btn"
                type="button"
                onClick={() => checkStatus(true)}
                disabled={checking}
                className="w-full py-3.5 px-4 rounded-xl bg-[#5B4DF5] hover:bg-[#4F41E5] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <FaSyncAlt className={checking ? "animate-spin" : ""} size={12} />
                <span>{checking ? "Checking Status..." : "Check Application Status"}</span>
              </button>

              <button
                id="back-to-login-btn"
                type="button"
                onClick={handleBackToLogin}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <FaArrowLeft size={11} />
                <span>Back to Login</span>
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
