import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaMobileAlt, FaCreditCard, FaWallet, FaLock,
  FaCheckCircle, FaArrowLeft,
  FaParking, FaClock, FaRupeeSign, FaSpinner,
} from "react-icons/fa";
import { paymentsAPI } from "../../api/api";

const TABS = [
  { id: "UPI",    label: "UPI",    icon: FaMobileAlt },
  { id: "CARD",   label: "Card",   icon: FaCreditCard },
  { id: "WALLET", label: "Wallet", icon: FaWallet, disabled: true },
];

function SummaryRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80 last:border-0">
      <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">{icon}{label}</span>
      <span className="text-slate-900 dark:text-white text-xs font-semibold">{value}</span>
    </div>
  );
}

export default function PaymentPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const state     = location.state || {};

  // ── Booking metadata passed from ParkingSlots / ActiveParking / FinalBillPage ──
  const intent      = state.intent     || "book"; // "book" | "extend" | "final" | "penalty"
  const paymentId   = state.paymentId;             // from /initiate
  const bookingId   = state.bookingId;
  const slotId      = state.slotId     || "N/A";
  const parkingName = state.parkingName|| "Unknown Parking";
  const duration    = state.duration   || 1;
  const ratePerHour = state.ratePerHour|| 50;
  const totalAmount = state.totalAmount|| 50;
  const vehicleNumber = state.vehicleNumber || "";
  const startTime   = state.startTime;
  const endTime     = state.endTime;
  const penaltyAmount = state.penaltyAmount || 0;

  const [activeTab,  setActiveTab]  = useState("UPI");
  const [upiId,      setUpiId]      = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry,     setExpiry]     = useState("");
  const [cvv,        setCvv]        = useState("");
  const [cardName,   setCardName]   = useState("");
  const [processing, setProcessing] = useState(false);
  const [success,    setSuccess]    = useState(false);
  // For extend flow — how many extra hours
  const [extHours, setExtHours] = useState(1);
  const extAmount = extHours * ratePerHour;
  const payable   = intent === "extend" ? extAmount : totalAmount;

  const formatCard   = (v) => v.replace(/\D/g,"").slice(0,16).replace(/(\d{4})/g,"$1 ").trim();
  const formatExpiry = (v) => { const c=v.replace(/\D/g,"").slice(0,4); return c.length>=3?c.slice(0,2)+"/"+c.slice(2):c; };

  const handlePay = async () => {
    // ── Validate ──────────────────────────────────────────────────────────────
    if (activeTab === "UPI" && !upiId.includes("@")) {
      toast.error("Enter a valid UPI ID (e.g., name@upi)"); return;
    }
    if (activeTab === "CARD") {
      if (cardNumber.replace(/\s/g,"").length < 16) { toast.error("Enter a valid 16-digit card number"); return; }
      if (!expiry || expiry.length < 5)              { toast.error("Enter a valid expiry date"); return; }
      if (!cvv || cvv.length < 3)                    { toast.error("Enter a valid CVV"); return; }
    }

    setProcessing(true);

    try {
      // ── Different flow per intent ────────────────────────────────────────────
      if (intent === "extend") {
        // 1. Initiate extension payment
        const initRes = await paymentsAPI.initiate({
          bookingId,
          paymentType:    "EXTENSION",
          extensionHours: extHours,
        });
        // 2. Confirm
        await paymentsAPI.confirm(initRes.paymentId, { paymentMethod: activeTab, upiId, paymentToken: cardNumber });

        // Update endTime in localStorage
        const stored = JSON.parse(localStorage.getItem("parkease_active_booking") || "{}");
        const newEnd = new Date(new Date(stored.endTime).getTime() + extHours * 3600000);
        localStorage.setItem("parkease_active_booking", JSON.stringify({
          ...stored,
          endTime:   newEnd.toISOString(),
          duration:  (stored.duration || 0) + extHours,
          totalPaid: (stored.totalPaid || 0) + extAmount,
        }));

        setProcessing(false);
        setSuccess(true);
        setTimeout(() => navigate("/user/active-parking", { replace: true }), 1800);

      } else if (intent === "penalty") {
        // 1. Initiate penalty
        const initRes = await paymentsAPI.penaltyInitiate({ bookingId, paymentType: "PENALTY" });
        // 2. Confirm
        await paymentsAPI.confirm(initRes.paymentId, { paymentMethod: activeTab, upiId, paymentToken: cardNumber });

        // Clear debt
        localStorage.removeItem("parkease_account_status");
        localStorage.removeItem("parkease_outstanding");
        localStorage.removeItem("parkease_active_booking");

        setProcessing(false);
        setSuccess(true);
        setTimeout(() => navigate("/user/payments", { replace: true }), 1800);

      } else if (intent === "final") {
        // Penalty from FinalBillPage — paymentId already created via penaltyInitiate
        if (paymentId) {
          await paymentsAPI.confirm(paymentId, { paymentMethod: activeTab, upiId, paymentToken: cardNumber });
        }
        // Clear debt
        localStorage.removeItem("parkease_account_status");
        localStorage.removeItem("parkease_outstanding");
        localStorage.removeItem("parkease_active_booking");

        setProcessing(false);
        setSuccess(true);
        setTimeout(() => navigate("/user/payments", { replace: true }), 1800);

      } else {
        // ── BOOKING (main flow) ─────────────────────────────────────────────
        if (!paymentId) {
          toast.error("Invalid payment session. Please try booking again.");
          setProcessing(false);
          return;
        }

        const confirmRes = await paymentsAPI.confirm(paymentId, {
          paymentMethod: activeTab,
          upiId,
          paymentToken: cardNumber,
        });

        // ── Store active booking in localStorage for ActiveParking timer ──────
        const activeBooking = {
          bookingId:   confirmRes.bookingId,
          paymentId:   confirmRes.paymentId,
          slotId:      confirmRes.slotCode || slotId,
          slotDbId:    confirmRes.slotId,
          parkingName: confirmRes.parkingName || parkingName,
          vehicleNumber: confirmRes.vehicleNumber || vehicleNumber,
          duration,
          ratePerHour,
          totalPaid: confirmRes.amount || totalAmount,
          startTime: confirmRes.startTime || startTime,
          endTime:   confirmRes.endTime   || endTime,
          paidAt:    new Date().toISOString(),
          transactionId: confirmRes.transactionId,
        };
        localStorage.setItem("parkease_active_booking", JSON.stringify(activeBooking));

        setProcessing(false);
        setSuccess(true);
        setTimeout(() => navigate("/user/active-parking", { replace: true }), 1800);
      }

    } catch (err) {
      toast.error(err.message || "Payment failed. Please try again.");
      setProcessing(false);
    }
  };

  // ── Success Overlay ───────────────────────────────────────────────────────
  if (success) {
    return (
      <DashboardLayout role="USER">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 shadow-sm">
            <FaCheckCircle className="text-4xl" />
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-1 font-heading">Payment Successful!</h2>
          <p className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">Redirecting to your active parking session...</p>
          <div className="mt-6 w-5 h-5 border-2 border-[#5B4DF5] border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <ToastContainer theme="dark" position="top-right" autoClose={3000} style={{ zIndex: 9999, top: "5rem", right: "1rem" }} />
      <DashboardLayout role="USER">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate(-1)} className="p-2.5 rounded-xl bg-white dark:bg-[#131C31] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all cursor-pointer">
              <FaArrowLeft size={13} />
            </button>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
                {intent === "extend" ? "Extend Parking" : intent === "final" || intent === "penalty" ? "Pay Outstanding Dues" : "Complete Payment"}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
                {intent === "extend" ? "Add additional duration to your ongoing parking session" : "Secure encrypted checkout · Safe digital transaction"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* LEFT: Payment Form */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-[#131C31] border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm p-6 sm:p-8 transition-colors duration-200">
                <div>

                  {/* Extend hours picker */}
                  {intent === "extend" && (
                    <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <p className="text-slate-700 dark:text-slate-300 text-xs mb-3 font-semibold uppercase tracking-wider">Extend by Hours</p>
                      <div className="flex gap-2 flex-wrap">
                        {[1, 2, 3, 4, 6].map(h => (
                          <button
                            key={h}
                            onClick={() => setExtHours(h)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${extHours === h
                              ? "bg-[#5B4DF5] text-white shadow-sm"
                              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#5B4DF5]/40"
                            }`}
                          >
                            +{h}h
                          </button>
                        ))}
                      </div>
                      <p className="text-emerald-600 dark:text-emerald-400 font-extrabold text-base mt-3 font-heading">+₹{extAmount}</p>
                    </div>
                  )}

                  {/* Payment method tabs */}
                  <div className="flex gap-2 mb-6">
                    {TABS.map(({ id, label, icon: Icon, disabled }) => (
                      <button
                        key={id}
                        disabled={disabled}
                        onClick={() => !disabled && setActiveTab(id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          activeTab === id && !disabled
                            ? "bg-[#EEF2FF] dark:bg-indigo-950/50 border-[#5B4DF5] text-[#5B4DF5] dark:text-indigo-400 shadow-sm"
                            : disabled
                              ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed"
                              : "bg-slate-50 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        <Icon size={14} /> {label} {disabled && <span className="text-[10px] text-slate-400">(Soon)</span>}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {activeTab === "UPI" && (
                      <motion.div key="upi" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-2 uppercase tracking-wide">UPI Virtual Payment Address</label>
                          <input
                            placeholder="e.g. yourname@okhdfcbank"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5B4DF5] focus:ring-2 focus:ring-[#5B4DF5]/15 transition-all text-sm font-medium"
                          />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {["paytm", "okaxis", "okhdfcbank", "ybl"].map(upi => (
                            <button key={upi} onClick={() => setUpiId(`user@${upi}`)}
                              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 text-xs hover:text-[#5B4DF5] transition-all cursor-pointer font-medium">
                              @{upi}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "CARD" && (
                      <motion.div key="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-2 uppercase tracking-wide">Card Number</label>
                          <input
                            placeholder="0000 0000 0000 0000"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCard(e.target.value))}
                            className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5B4DF5] focus:ring-2 focus:ring-[#5B4DF5]/15 transition-all font-mono tracking-wider text-sm font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-2 uppercase tracking-wide">Cardholder Name</label>
                          <input
                            placeholder="Name as printed on card"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value.toUpperCase())}
                            className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5B4DF5] focus:ring-2 focus:ring-[#5B4DF5]/15 transition-all text-sm font-medium"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-2 uppercase tracking-wide">Expiry</label>
                            <input placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                              className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5B4DF5] focus:ring-2 focus:ring-[#5B4DF5]/15 transition-all font-mono text-sm font-medium" />
                          </div>
                          <div>
                            <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-2 uppercase tracking-wide">CVV</label>
                            <input type="password" placeholder="•••" maxLength={4} value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g,""))}
                              className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5B4DF5] focus:ring-2 focus:ring-[#5B4DF5]/15 transition-all font-mono text-sm font-medium" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Pay Button */}
                  <button
                    onClick={handlePay}
                    disabled={processing}
                    className={`w-full mt-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer ${
                      processing
                        ? "bg-slate-300 dark:bg-slate-800 cursor-not-allowed text-slate-500"
                        : "bg-[#5B4DF5] hover:bg-[#4F41E5] text-white hover:shadow-lg active:scale-[0.99]"
                    }`}
                  >
                    {processing ? (
                      <><FaSpinner className="animate-spin" /> Processing Payment...</>
                    ) : (
                      <><FaLock size={12} /> Pay ₹{intent === "extend" ? extAmount : payable} Securely</>
                    )}
                  </button>

                  {processing && (
                    <p className="text-center text-xs text-[#5B4DF5] mt-3 animate-pulse font-medium">
                      Confirming transaction with gateway...
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-[#131C31] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm sticky top-24 transition-colors duration-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 font-heading">Order Summary</h3>

                  <div className="space-y-1 mb-5">
                    <SummaryRow icon={<FaParking className="text-[#5B4DF5]" />} label="Parking" value={parkingName} />
                    <SummaryRow icon={<span className="text-[#5B4DF5] text-xs font-bold">#</span>} label="Slot"
                      value={<span className="font-mono text-[#5B4DF5] font-bold">#{slotId}</span>} />
                    {vehicleNumber && (
                      <SummaryRow icon={<span className="text-slate-400 text-xs">🚗</span>} label="Vehicle" value={vehicleNumber} />
                    )}
                    {intent !== "extend" && intent !== "penalty" && intent !== "final" && (
                      <SummaryRow icon={<FaClock className="text-amber-500" />} label="Duration"
                        value={`${duration} hr${duration !== 1 ? "s" : ""}`} />
                    )}
                    {intent === "extend" && (
                      <SummaryRow icon={<FaClock className="text-amber-500" />} label="Extension" value={`+${extHours} hr${extHours !== 1 ? "s" : ""}`} />
                    )}
                    <SummaryRow icon={<FaRupeeSign className="text-slate-400" />} label="Hourly Rate" value={`₹${ratePerHour}/hr`} />
                    {penaltyAmount > 0 && (
                      <SummaryRow icon={<span className="text-rose-600 text-xs">⚠</span>} label="Overtime Charge"
                        value={<span className="text-rose-600 font-bold">₹{penaltyAmount}</span>} />
                    )}
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700 dark:text-slate-300 font-semibold text-sm">Total Payable</span>
                      <span className="text-2xl font-extrabold text-[#5B4DF5] font-heading">
                        ₹{intent === "extend" ? extAmount : payable}
                      </span>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    {["256-bit SSL encrypted", "Razorpay / Bank grade gateway", "Instant booking confirmation"].map(t => (
                      <div key={t} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <FaCheckCircle className="text-emerald-500 shrink-0 text-xs" /> {t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}