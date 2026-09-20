import { useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FaBuilding, FaUser, FaEye, FaEyeSlash,
  FaIdCard, FaCheckCircle, FaArrowLeft,
  FaArrowRight, FaTimesCircle, FaFilePdf, FaImage, FaParking, FaCloudUploadAlt,
  FaShieldAlt, FaInfoCircle
} from "react-icons/fa";
import AuthBackground from "../../components/common/AuthBackground";
import { ownerApplicationAPI, saveOwnerAppStatus } from "../../api/api";

// ── Step Definitions ─────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Personal", desc: "Account Info", icon: FaUser },
  { id: 2, label: "Business", desc: "Owner Details", icon: FaBuilding },
  { id: 3, label: "Parking", desc: "Facility Info", icon: FaParking },
  { id: 4, label: "Documents", desc: "Verification", icon: FaIdCard },
  { id: 5, label: "Review", desc: "Confirmation", icon: FaCheckCircle },
];

const DOCUMENT_TYPES = [
  {
    key: "identityProof",
    label: "Identity Proof",
    description: "Aadhaar Card, Passport, Driving License, or Voter ID",
    required: true
  },
  {
    key: "addressProof",
    label: "Address Proof",
    description: "Utility Bill, Bank Statement, or Government-issued address document",
    required: true
  },
  {
    key: "businessProof",
    label: "Business / Ownership Proof",
    description: "Business Registration Certificate, GST Certificate, or Trade License",
    required: false
  },
  {
    key: "propertyProof",
    label: "Parking Authorization Proof",
    description: "Title Deed, Lease Agreement, or NOC from property owner",
    required: false
  },
];

const BUSINESS_TYPES = [
  "Individual / Sole Proprietor",
  "Partnership Firm",
  "Private Limited Company",
  "Public Limited Company",
  "LLP",
  "Trust / Society",
  "Government Entity",
  "Other",
];

const OWNERSHIP_TYPES = [
  "Owner (Full Ownership)",
  "Lessee (Long-term Lease)",
  "Manager / Operator",
  "Partnership",
  "Other",
];

const PARKING_TYPES = [
  "Surface / Open Lot",
  "Covered Garage",
  "Multi-Level Facility",
  "Underground / Basement",
  "Valet Parking Lot",
  "Hybrid / Mixed",
];

const VEHICLE_TYPES = [
  "Both 2-Wheeler & 4-Wheeler",
  "4-Wheeler Only",
  "2-Wheeler Only",
  "Commercial / Heavy Vehicles",
  "EV Charging Supported Facility",
];

// ── File Upload Component ─────────────────────────────────────────────────────

function DocumentUpload({ docType, file, onChange }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const validateAndSet = useCallback((f) => {
    const allowed = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!allowed.includes(f.type)) {
      toast.error(`${docType.label}: Only PDF, JPG, PNG files are allowed.`);
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error(`${docType.label}: File must be under 10 MB.`);
      return;
    }
    onChange(docType.key, f);
  }, [docType, onChange]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSet(dropped);
  }, [validateAndSet]);

  const isPDF = file && file.type === "application/pdf";
  const sizeLabel = file ? (file.size / 1024 / 1024).toFixed(2) + " MB" : null;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-bold text-gray-300 uppercase tracking-wide flex items-center gap-1.5">
          {docType.label}
          {docType.required && <span className="text-red-400">*</span>}
        </label>
        {file && (
          <button
            type="button"
            onClick={() => onChange(docType.key, null)}
            className="text-red-400 hover:text-red-300 transition-colors text-xs flex items-center gap-1"
          >
            <FaTimesCircle size={10} /> Remove
          </button>
        )}
      </div>
      <p className="text-[11px] text-gray-400 mb-2">{docType.description}</p>

      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            dragging
              ? "border-purple-500 bg-purple-500/10"
              : "border-white/10 hover:border-purple-500/50 hover:bg-white/5"
          }`}
        >
          <FaCloudUploadAlt className="mx-auto text-purple-400 mb-2" size={24} />
          <p className="text-xs text-gray-300 font-medium">Drag & drop or <span className="text-purple-400 underline">browse file</span></p>
          <p className="text-[10px] text-gray-500 mt-1">PDF, JPG, PNG • Max 10 MB</p>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => { if (e.target.files[0]) validateAndSet(e.target.files[0]); }}
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
          {isPDF ? (
            <FaFilePdf className="text-red-400 flex-shrink-0" size={22} />
          ) : (
            <FaImage className="text-purple-400 flex-shrink-0" size={22} />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white font-medium truncate">{file.name}</p>
            <p className="text-[10px] text-gray-400">{sizeLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-[11px] text-purple-300 hover:text-white px-2 py-1 bg-white/5 rounded-lg transition-colors"
          >
            Replace
          </button>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => { if (e.target.files[0]) validateAndSet(e.target.files[0]); }}
          />
        </div>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function OwnerRegister() {
  const navigate = useNavigate();

  // Current wizard step (1 to 5)
  const [step, setStep] = useState(1);

  // Step 1: Personal Information
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Step 2: Business / Owner Information
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0]);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [businessIdentifier, setBusinessIdentifier] = useState("");
  const [numberOfLocations, setNumberOfLocations] = useState(1);
  const [ownershipType, setOwnershipType] = useState(OWNERSHIP_TYPES[0]);

  // Step 3: Parking Information
  const [parkingSpaceName, setParkingSpaceName] = useState("");
  const [parkingAddress, setParkingAddress] = useState("");
  const [parkingCity, setParkingCity] = useState("");
  const [parkingState, setParkingState] = useState("");
  const [parkingPinCode, setParkingPinCode] = useState("");
  const [approxSlots, setApproxSlots] = useState("");
  const [parkingType, setParkingType] = useState(PARKING_TYPES[0]);
  const [vehicleTypesSupported, setVehicleTypesSupported] = useState(VEHICLE_TYPES[0]);

  // Step 4: Verification Documents
  const [documents, setDocuments] = useState({
    identityProof: null,
    addressProof: null,
    businessProof: null,
    propertyProof: null,
  });

  const [loading, setLoading] = useState(false);

  const handleDocChange = (key, file) => {
    setDocuments(prev => ({ ...prev, [key]: file }));
  };

  // ── Step Validation ────────────────────────────────────────────────────────

  const validateStep1 = () => {
    if (!name.trim()) { toast.error("Full name is required"); return false; }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { toast.error("Valid email address is required"); return false; }
    if (!phone.match(/^[0-9+\s-]{7,15}$/)) { toast.error("Valid phone number is required"); return false; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return false; }
    if (password !== confirmPw) { toast.error("Passwords do not match"); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (!businessName.trim()) { toast.error("Business name is required"); return false; }
    if (!address.trim()) { toast.error("Business address is required"); return false; }
    if (!city.trim()) { toast.error("City is required"); return false; }
    if (!state.trim()) { toast.error("State is required"); return false; }
    return true;
  };

  const validateStep3 = () => {
    if (!parkingSpaceName.trim()) { toast.error("Parking space name is required"); return false; }
    if (!approxSlots || parseInt(approxSlots, 10) <= 0) {
      toast.error("Approximate number of slots must be at least 1");
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    if (!documents.identityProof) { toast.error("Identity Proof document is required"); return false; }
    if (!documents.addressProof) { toast.error("Address Proof document is required"); return false; }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    if (step === 4 && !validateStep4()) return;
    setStep(prev => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  // Auto-fill parking address from business address if convenient
  const copyAddressToParking = () => {
    setParkingAddress(address);
    setParkingCity(city);
    setParkingState(state);
    setParkingPinCode(pinCode);
    toast.info("Business address copied to parking location");
  };

  // ── Final Submission ───────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const formData = new FormData();
      // Step 1: Account
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("password", password);

      // Step 2: Business
      formData.append("businessName", businessName);
      formData.append("businessType", businessType);
      formData.append("address", address);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("pinCode", pinCode);
      formData.append("contactNumber", contactNumber || phone);
      formData.append("businessIdentifier", businessIdentifier);
      if (numberOfLocations) formData.append("numberOfLocations", numberOfLocations);
      formData.append("ownershipType", ownershipType);

      // Step 3: Parking
      formData.append("parkingSpaceName", parkingSpaceName);
      formData.append("parkingAddress", parkingAddress || address);
      formData.append("parkingCity", parkingCity || city);
      formData.append("parkingState", parkingState || state);
      formData.append("parkingPinCode", parkingPinCode || pinCode);
      formData.append("approxSlots", approxSlots || "10");
      formData.append("parkingType", parkingType);
      formData.append("vehicleTypesSupported", vehicleTypesSupported);

      // Step 4: Documents
      if (documents.identityProof) formData.append("identityProof", documents.identityProof);
      if (documents.addressProof)  formData.append("addressProof",  documents.addressProof);
      if (documents.businessProof) formData.append("businessProof", documents.businessProof);
      if (documents.propertyProof) formData.append("propertyProof", documents.propertyProof);

      const response = await ownerApplicationAPI.submit(formData);

      // Save status locally for routing (no active JWT issued)
      saveOwnerAppStatus({
        applicationStatus: "PENDING",
        applicationRef: response.applicationRef,
        email: email,
      });

      toast.success("Application submitted successfully!");

      // Redirect to dedicated pending page
      setTimeout(() => {
        navigate("/owner/application-pending");
      }, 600);
    } catch (err) {
      toast.error(err.message || "Submission failed. Please check your information.");
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
        className="relative z-10 text-center mb-6 max-w-xl"
      >
        <Link
          to="/register"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-3"
        >
          <FaArrowLeft size={10} /> Back to account selection
        </Link>
        <div className="w-12 h-12 mx-auto mb-2.5 rounded-2xl bg-[#EEF2FF] dark:bg-indigo-950/60 text-[#5B4DF5] dark:text-indigo-400 flex items-center justify-center text-xl shadow-sm">
          <FaBuilding />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
          Become a ParkEase Parking Partner
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1 max-w-lg mx-auto">
          Submit your property details and verification documents. Applications are reviewed by ParkEase administrators to ensure facility authenticity.
        </p>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-2xl bg-white dark:bg-[#131C31] border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-xl transition-colors duration-200"
      >
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isCurrent = step === s.id;
            const isCompleted = step > s.id;

            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center min-w-[56px]">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                        : isCurrent
                        ? "bg-[#5B4DF5] text-white shadow-md font-bold"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {isCompleted ? <FaCheckCircle size={14} /> : <Icon size={13} />}
                  </div>
                  <span className={`text-[10px] mt-1.5 font-bold uppercase tracking-wider ${isCurrent ? "text-[#5B4DF5] dark:text-indigo-400" : isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`}>
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-[2px] mx-2 -mt-4 transition-colors ${step > s.id ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* STEP 1: Personal Information */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
              <FaUser className="text-[#5B4DF5]" /> Personal Information
            </h2>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Applicant Full Name"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="owner@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Phone Number *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Confirm Password *</label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPw ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Business / Owner Information */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h2 className="text-base font-bold text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <FaBuilding className="text-purple-400" /> Business / Owner Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Business / Company Name *</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="e.g. Metro Parking Solutions Pvt Ltd"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Business Entity Type</label>
                <select
                  value={businessType}
                  onChange={e => setBusinessType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0e0e24] border border-white/10 text-white focus:outline-none focus:border-purple-400 text-sm"
                >
                  {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Business Address *</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Street address, building, suite"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wide">City *</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wide">State *</label>
                <input
                  type="text"
                  value={state}
                  onChange={e => setState(e.target.value)}
                  placeholder="e.g. Maharashtra"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wide">PIN Code</label>
                <input
                  type="text"
                  value={pinCode}
                  onChange={e => setPinCode(e.target.value)}
                  placeholder="e.g. 400001"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Business Phone Number</label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={e => setContactNumber(e.target.value)}
                  placeholder="Leave blank to use personal phone"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Tax ID / PAN / GSTIN</label>
                <input
                  type="text"
                  value={businessIdentifier}
                  onChange={e => setBusinessIdentifier(e.target.value)}
                  placeholder="Optional identification number"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Ownership Model</label>
                <select
                  value={ownershipType}
                  onChange={e => setOwnershipType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0e0e24] border border-white/10 text-white focus:outline-none focus:border-purple-400 text-sm"
                >
                  {OWNERSHIP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Number of Facilities Managed</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={numberOfLocations}
                  onChange={e => setNumberOfLocations(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-sm"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Parking Information */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FaParking className="text-purple-400" /> Primary Parking Location Details
              </h2>
              {address && (
                <button
                  type="button"
                  onClick={copyAddressToParking}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors underline"
                >
                  Same as business address
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Parking Space / Facility Name *</label>
                <input
                  type="text"
                  value={parkingSpaceName}
                  onChange={e => setParkingSpaceName(e.target.value)}
                  placeholder="e.g. Downtown Central Parking"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Approximate Slots *</label>
                <input
                  type="number"
                  min="1"
                  value={approxSlots}
                  onChange={e => setApproxSlots(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Parking Facility Address</label>
              <input
                type="text"
                value={parkingAddress}
                onChange={e => setParkingAddress(e.target.value)}
                placeholder="Detailed street address of parking lot"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wide">City</label>
                <input
                  type="text"
                  value={parkingCity}
                  onChange={e => setParkingCity(e.target.value)}
                  placeholder="City"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wide">State</label>
                <input
                  type="text"
                  value={parkingState}
                  onChange={e => setParkingState(e.target.value)}
                  placeholder="State"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wide">PIN Code</label>
                <input
                  type="text"
                  value={parkingPinCode}
                  onChange={e => setParkingPinCode(e.target.value)}
                  placeholder="PIN Code"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Parking Facility Type</label>
                <select
                  value={parkingType}
                  onChange={e => setParkingType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0e0e24] border border-white/10 text-white focus:outline-none focus:border-purple-400 text-sm"
                >
                  {PARKING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Vehicles Supported</label>
                <select
                  value={vehicleTypesSupported}
                  onChange={e => setVehicleTypesSupported(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0e0e24] border border-white/10 text-white focus:outline-none focus:border-purple-400 text-sm"
                >
                  {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-gray-300 flex items-start gap-2.5 mt-2">
              <FaInfoCircle className="text-purple-400 flex-shrink-0 mt-0.5" />
              <span>
                You can configure specific parking slots, pricing tiers, and operating hours in the Owner Dashboard once your partner account is approved.
              </span>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Verification Documents */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h2 className="text-base font-bold text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <FaIdCard className="text-purple-400" /> Verification Documents
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Please upload required documents for administrator verification. Only PDF, JPG, and PNG files up to 10MB are permitted.
            </p>

            {DOCUMENT_TYPES.map(dt => (
              <DocumentUpload
                key={dt.key}
                docType={dt}
                file={documents[dt.key]}
                onChange={handleDocChange}
              />
            ))}
          </motion.div>
        )}

        {/* STEP 5: Review & Submit */}
        {step === 5 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <h2 className="text-base font-bold text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <FaCheckCircle className="text-emerald-400" /> Review Your Application
            </h2>

            {/* Personal Summary */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wide">Personal Details</span>
                <button type="button" onClick={() => setStep(1)} className="text-[11px] text-gray-400 hover:text-white underline">Edit</button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-gray-500">Name:</span> <span className="text-white font-medium">{name}</span></div>
                <div><span className="text-gray-500">Email:</span> <span className="text-white font-medium">{email}</span></div>
                <div><span className="text-gray-500">Phone:</span> <span className="text-white font-medium">{phone}</span></div>
              </div>
            </div>

            {/* Business Summary */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wide">Business Details</span>
                <button type="button" onClick={() => setStep(2)} className="text-[11px] text-gray-400 hover:text-white underline">Edit</button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-gray-500">Business:</span> <span className="text-white font-medium">{businessName}</span></div>
                <div><span className="text-gray-500">Type:</span> <span className="text-white font-medium">{businessType}</span></div>
                <div className="col-span-2"><span className="text-gray-500">Address:</span> <span className="text-white font-medium">{address}, {city}, {state} - {pinCode}</span></div>
                {businessIdentifier && <div><span className="text-gray-500">Tax/ID:</span> <span className="text-white font-medium">{businessIdentifier}</span></div>}
                <div><span className="text-gray-500">Ownership:</span> <span className="text-white font-medium">{ownershipType}</span></div>
              </div>
            </div>

            {/* Parking Summary */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wide">Parking Facility Details</span>
                <button type="button" onClick={() => setStep(3)} className="text-[11px] text-gray-400 hover:text-white underline">Edit</button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-gray-500">Space Name:</span> <span className="text-white font-medium">{parkingSpaceName}</span></div>
                <div><span className="text-gray-500">Approx Slots:</span> <span className="text-white font-medium">{approxSlots} slots</span></div>
                <div><span className="text-gray-500">Facility Type:</span> <span className="text-white font-medium">{parkingType}</span></div>
                <div><span className="text-gray-500">Vehicles:</span> <span className="text-white font-medium">{vehicleTypesSupported}</span></div>
              </div>
            </div>

            {/* Documents Summary */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wide">Verification Documents</span>
                <button type="button" onClick={() => setStep(4)} className="text-[11px] text-gray-400 hover:text-white underline">Edit</button>
              </div>
              <div className="space-y-1.5 text-xs">
                {DOCUMENT_TYPES.map(dt => (
                  <div key={dt.key} className="flex items-center justify-between">
                    <span className="text-gray-400">{dt.label}:</span>
                    {documents[dt.key] ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-medium">
                        <FaCheckCircle size={10} /> {documents[dt.key].name}
                      </span>
                    ) : (
                      <span className="text-gray-600 text-[11px]">Not uploaded (Optional)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submission Notice */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <FaShieldAlt className="text-amber-400 flex-shrink-0 mt-0.5" size={16} />
              <div className="text-xs text-amber-200/90 leading-relaxed">
                <p className="font-bold text-amber-300 mb-0.5">Admin Review Notice</p>
                After submission, your application will be reviewed by a ParkEase administrator. You will receive an application reference number to check review progress. Owner Dashboard access will only be granted upon successful approval.
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-white/10">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white transition-all text-xs font-bold flex items-center gap-2"
            >
              <FaArrowLeft size={10} /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              id="owner-reg-next-btn"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
            >
              <span>Continue</span>
              <FaArrowRight size={10} />
            </button>
          ) : (
            <button
              type="button"
              id="owner-reg-submit-btn"
              disabled={loading}
              onClick={handleSubmit}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <span>Submit Application</span>
                  <FaCheckCircle size={12} />
                </>
              )}
            </button>
          )}
        </div>

        {/* Existing account link */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-xs">
            Already registered?{" "}
            <Link to="/login" className="text-neon-blue hover:text-white font-medium transition-colors">
              Log In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
