import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaMobileAlt, FaCreditCard, FaWallet, FaLock,
  FaCheckCircle, FaArrowLeft, FaShieldAlt,
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
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-gray-500 text-sm">{icon}{label}</span>
      <span className="text-white text-sm font-semibold">{value}</span>
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
            className="w-24 h-24 rounded-full bg-neon-green/20 border-2 border-neon-green flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.5)]">
            <FaCheckCircle className="text-neon-green text-5xl" />
          </motion.div>
          <h2 className="text-3xl font-black text-white mb-2">Payment Successful!</h2>
          <p className="text-neon-green/80 text-sm">Redirecting to your session...</p>
          <div className="mt-6 w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
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
            <button onClick={() => navigate(-1)} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-all">
              <FaArrowLeft />
            </button>
            <div>
              <h2 className="text-3xl font-bold text-white">
                {intent === "extend" ? "Extend Parking" : intent === "final" || intent === "penalty" ? "Pay Outstanding Dues" : "Complete Payment"}
              </h2>
              <p className="text-gray-400 text-sm mt-0.5">
                {intent === "extend" ? "Add more time to your active session" : "Secure checkout · All payments encrypted"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* LEFT: Payment Form */}
            <div className="lg:col-span-3">
              <div className="bg-[#0f1629] border border-white/10 rounded-2xl overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-neon-blue to-neon-purple" />
                <div className="p-6">

                  {/* Extend hours picker */}
                  {intent === "extend" && (
                    <div className="mb-6">
                      <p className="text-gray-400 text-sm mb-3 font-semibold uppercase tracking-wide">Extend by</p>
                      <div className="flex gap-2 flex-wrap">
                        {[1, 2, 3, 4, 6].map(h => (
                          <button
                            key={h}
                            onClick={() => setExtHours(h)}
                            className={`px-5 py-2.5 rounded-xl border font-bold transition-all ${extHours === h
                              ? "bg-neon-blue text-white border-neon-blue shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                              : "bg-white/5 text-gray-300 border-white/10 hover:border-neon-blue/50"
                            }`}
                          >
                            {h}h
                          </button>
                        ))}
                      </div>
                      <p className="text-neon-green font-black text-xl mt-3">+₹{extAmount}</p>
                    </div>
                  )}

                  {/* Payment method tabs */}
                  <div className="flex gap-2 mb-6">
                    {TABS.map(({ id, label, icon: Icon, disabled }) => (
                      <button
                        key={id}
                        disabled={disabled}
                        onClick={() => !disabled && setActiveTab(id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm transition-all ${
                          activeTab === id && !disabled
                            ? "bg-neon-blue/20 border-neon-blue text-neon-blue shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                            : disabled
                              ? "bg-white/5 border-white/5 text-gray-600 cursor-not-allowed"
                              : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20"
                        }`}
                      >
                        <Icon /> {label} {disabled && <span className="text-[10px] text-gray-600">(Soon)</span>}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {activeTab === "UPI" && (
                      <motion.div key="upi" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                        <div>
                          <label className="block text-gray-300 text-sm font-semibold mb-2">UPI ID</label>
                          <input
                            placeholder="name@okaxis / name@paytm"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-neon-blue/50 focus:bg-neon-blue/5 transition-all"
                          />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {["paytm", "gpay", "phonepe", "ybl"].map(upi => (
                            <button key={upi} onClick={() => setUpiId(`user@${upi}`)}
                              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 text-xs hover:border-neon-blue/50 hover:text-white transition-all">
                              @{upi}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "CARD" && (
                      <motion.div key="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                        <div>
                          <label className="block text-gray-300 text-sm font-semibold mb-2">Card Number</label>
                          <input
                            placeholder="0000 0000 0000 0000"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCard(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-neon-blue/50 transition-all font-mono tracking-wider"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm font-semibold mb-2">Cardholder Name</label>
                          <input
                            placeholder="As on card"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value.toUpperCase())}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-neon-blue/50 transition-all"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-300 text-sm font-semibold mb-2">Expiry</label>
                            <input placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-neon-blue/50 transition-all font-mono" />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm font-semibold mb-2">CVV</label>
                            <input type="password" placeholder="•••" maxLength={4} value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g,""))}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-neon-blue/50 transition-all font-mono" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Pay Button */}
                  <button
                    onClick={handlePay}
                    disabled={processing}
                    className={`w-full mt-8 py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
                      processing
                        ? "bg-gray-700 cursor-not-allowed text-gray-400"
                        : "bg-gradient-to-r from-neon-blue to-neon-purple text-white hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] active:scale-[0.98]"
                    }`}
                  >
                    {processing ? (
                      <><FaSpinner className="animate-spin" /> Processing Payment...</>
                    ) : (
                      <><FaLock /> Pay ₹{intent === "extend" ? extAmount : payable} Securely</>
                    )}
                  </button>

                  {processing && (
                    <p className="text-center text-xs text-neon-blue mt-3 animate-pulse">
                      Please do not close this window...
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-[#0f1629] border border-white/10 rounded-2xl overflow-hidden sticky top-24">
                <div className="h-1 w-full bg-gradient-to-r from-neon-green to-neon-blue" />
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-5">Order Summary</h3>

                  <div className="space-y-4 mb-6">
                    <SummaryRow icon={<FaParking className="text-neon-blue" />}   label="Parking"  value={parkingName} />
                    <SummaryRow icon={<span className="text-neon-purple text-xs font-bold">#</span>} label="Slot"
                      value={<span className="font-mono text-neon-purple font-bold">#{slotId}</span>} />
                    {vehicleNumber && (
                      <SummaryRow icon={<span className="text-gray-500 text-xs">🚗</span>} label="Vehicle" value={vehicleNumber} />
                    )}
                    {intent !== "extend" && intent !== "penalty" && intent !== "final" && (
                      <SummaryRow icon={<FaClock className="text-yellow-400" />} label="Duration"
                        value={`${duration} hr${duration !== 1 ? "s" : ""}`} />
                    )}
                    {intent === "extend" && (
                      <SummaryRow icon={<FaClock className="text-yellow-400" />} label="Extension" value={`+${extHours} hr${extHours !== 1 ? "s" : ""}`} />
                    )}
                    <SummaryRow icon={<FaRupeeSign className="text-gray-400" />} label="Rate" value={`₹${ratePerHour}/hr`} />
                    {penaltyAmount > 0 && (
                      <SummaryRow icon={<span className="text-neon-red text-xs">⚠</span>} label="Overtime Penalty"
                        value={<span className="text-neon-red font-bold">₹{penaltyAmount}</span>} />
                    )}
                  </div>

                  <div className="border-t border-white/10 pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 font-semibold">Total</span>
                      <span className="text-3xl font-black text-neon-green">
                        ₹{intent === "extend" ? extAmount : payable}
                      </span>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="space-y-2">
                    {["256-bit SSL encrypted", "Razorpay secured · Test Mode", "Instant booking confirmation"].map(t => (
                      <div key={t} className="flex items-center gap-2 text-xs text-gray-500">
                        <FaCheckCircle className="text-neon-green/70 shrink-0" /> {t}
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