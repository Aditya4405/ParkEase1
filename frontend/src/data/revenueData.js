// ─────────────────────────────────────────────────────────
// Centralized Revenue Data Source
// Used by both RevenueChart and RevenueAnalytics components
// ─────────────────────────────────────────────────────────

const PARKING_LOTS = ["City Mall Parking", "Airport Lot", "Metro Station P1", "Tech Park Basement"];
const VEHICLE_TYPES = ["Car", "Bike", "Large", "Small"];
const SLOTS_MAP = {
  "City Mall Parking": ["CAR-01", "CAR-02", "CAR-03", "BIKE-01", "BIKE-02"],
  "Airport Lot": ["CAR-01", "CAR-02", "LRG-01", "SML-01"],
  "Metro Station P1": ["BIKE-01", "BIKE-02", "BIKE-03", "CAR-01"],
  "Tech Park Basement": ["CAR-01", "CAR-02", "CAR-03", "LRG-01", "BIKE-01"],
};

// ── Detailed transaction records ────────────────────────
export const revenueTransactions = [
  // Monday
  { date: "2026-02-23", day: "Mon", parking: "City Mall Parking", slot: "CAR-01", vehicleType: "Car", vehicle: "MP09 AB 1234", amount: 120, hours: 2, time: "09:00 AM" },
  { date: "2026-02-23", day: "Mon", parking: "City Mall Parking", slot: "BIKE-01", vehicleType: "Bike", vehicle: "MH12 CD 5678", amount: 40, hours: 2, time: "10:30 AM" },
  { date: "2026-02-23", day: "Mon", parking: "Airport Lot", slot: "CAR-01", vehicleType: "Car", vehicle: "DL04 GH 3456", amount: 150, hours: 3, time: "11:00 AM" },
  { date: "2026-02-23", day: "Mon", parking: "Metro Station P1", slot: "BIKE-02", vehicleType: "Bike", vehicle: "KA01 EF 9012", amount: 30, hours: 1, time: "02:00 PM" },
  { date: "2026-02-23", day: "Mon", parking: "Tech Park Basement", slot: "CAR-02", vehicleType: "Car", vehicle: "TN10 JK 7890", amount: 110, hours: 2, time: "08:30 AM" },
  // Tuesday
  { date: "2026-02-24", day: "Tue", parking: "City Mall Parking", slot: "CAR-02", vehicleType: "Car", vehicle: "MP09 LM 2345", amount: 180, hours: 3, time: "09:30 AM" },
  { date: "2026-02-24", day: "Tue", parking: "City Mall Parking", slot: "CAR-03", vehicleType: "Car", vehicle: "GJ05 NP 6789", amount: 120, hours: 2, time: "11:00 AM" },
  { date: "2026-02-24", day: "Tue", parking: "Airport Lot", slot: "LRG-01", vehicleType: "Large", vehicle: "MH14 QR 1234", amount: 200, hours: 2, time: "07:00 AM" },
  { date: "2026-02-24", day: "Tue", parking: "Metro Station P1", slot: "BIKE-01", vehicleType: "Bike", vehicle: "KA03 ST 5678", amount: 45, hours: 3, time: "06:30 AM" },
  { date: "2026-02-24", day: "Tue", parking: "Tech Park Basement", slot: "LRG-01", vehicleType: "Large", vehicle: "AP07 UV 9012", amount: 175, hours: 2, time: "10:00 AM" },
  // Wednesday
  { date: "2026-02-25", day: "Wed", parking: "City Mall Parking", slot: "BIKE-02", vehicleType: "Bike", vehicle: "RJ14 WX 3456", amount: 30, hours: 1, time: "12:00 PM" },
  { date: "2026-02-25", day: "Wed", parking: "Airport Lot", slot: "SML-01", vehicleType: "Small", vehicle: "UP32 YZ 7890", amount: 80, hours: 2, time: "01:00 PM" },
  { date: "2026-02-25", day: "Wed", parking: "Airport Lot", slot: "CAR-02", vehicleType: "Car", vehicle: "DL01 AB 2345", amount: 150, hours: 3, time: "09:00 AM" },
  { date: "2026-02-25", day: "Wed", parking: "Tech Park Basement", slot: "BIKE-01", vehicleType: "Bike", vehicle: "TN07 CD 6789", amount: 35, hours: 1, time: "03:00 PM" },
  { date: "2026-02-25", day: "Wed", parking: "Metro Station P1", slot: "CAR-01", vehicleType: "Car", vehicle: "KA05 EF 1234", amount: 85, hours: 1, time: "05:00 PM" },
  // Thursday
  { date: "2026-02-26", day: "Thu", parking: "City Mall Parking", slot: "CAR-01", vehicleType: "Car", vehicle: "MP04 GH 5678", amount: 240, hours: 4, time: "08:00 AM" },
  { date: "2026-02-26", day: "Thu", parking: "City Mall Parking", slot: "CAR-02", vehicleType: "Car", vehicle: "GJ01 JK 9012", amount: 180, hours: 3, time: "09:00 AM" },
  { date: "2026-02-26", day: "Thu", parking: "Airport Lot", slot: "CAR-01", vehicleType: "Car", vehicle: "DL08 LM 3456", amount: 200, hours: 4, time: "07:00 AM" },
  { date: "2026-02-26", day: "Thu", parking: "Metro Station P1", slot: "BIKE-03", vehicleType: "Bike", vehicle: "KA09 NP 7890", amount: 60, hours: 2, time: "11:00 AM" },
  { date: "2026-02-26", day: "Thu", parking: "Tech Park Basement", slot: "CAR-01", vehicleType: "Car", vehicle: "TN14 QR 1234", amount: 170, hours: 2, time: "10:00 AM" },
  { date: "2026-02-26", day: "Thu", parking: "Tech Park Basement", slot: "CAR-03", vehicleType: "Car", vehicle: "AP02 ST 5678", amount: 100, hours: 1, time: "04:00 PM" },
  // Friday
  { date: "2026-02-27", day: "Fri", parking: "City Mall Parking", slot: "CAR-03", vehicleType: "Car", vehicle: "MP11 UV 9012", amount: 120, hours: 2, time: "10:00 AM" },
  { date: "2026-02-27", day: "Fri", parking: "City Mall Parking", slot: "BIKE-01", vehicleType: "Bike", vehicle: "MH03 WX 3456", amount: 60, hours: 3, time: "09:00 AM" },
  { date: "2026-02-27", day: "Fri", parking: "Airport Lot", slot: "LRG-01", vehicleType: "Large", vehicle: "UP16 YZ 7890", amount: 250, hours: 2.5, time: "06:00 AM" },
  { date: "2026-02-27", day: "Fri", parking: "Metro Station P1", slot: "BIKE-01", vehicleType: "Bike", vehicle: "KA12 AB 2345", amount: 45, hours: 3, time: "07:30 AM" },
  { date: "2026-02-27", day: "Fri", parking: "Tech Park Basement", slot: "CAR-02", vehicleType: "Car", vehicle: "TN05 CD 6789", amount: 125, hours: 2, time: "11:00 AM" },
  // Saturday
  { date: "2026-02-28", day: "Sat", parking: "City Mall Parking", slot: "CAR-01", vehicleType: "Car", vehicle: "GJ08 EF 1234", amount: 180, hours: 3, time: "10:00 AM" },
  { date: "2026-02-28", day: "Sat", parking: "City Mall Parking", slot: "CAR-02", vehicleType: "Car", vehicle: "MP06 GH 5678", amount: 120, hours: 2, time: "11:30 AM" },
  { date: "2026-02-28", day: "Sat", parking: "City Mall Parking", slot: "BIKE-02", vehicleType: "Bike", vehicle: "MH09 JK 9012", amount: 50, hours: 2, time: "01:00 PM" },
  { date: "2026-02-28", day: "Sat", parking: "Airport Lot", slot: "CAR-02", vehicleType: "Car", vehicle: "DL15 LM 3456", amount: 200, hours: 4, time: "07:00 AM" },
  { date: "2026-02-28", day: "Sat", parking: "Metro Station P1", slot: "BIKE-02", vehicleType: "Bike", vehicle: "KA02 NP 7890", amount: 60, hours: 2, time: "12:00 PM" },
  { date: "2026-02-28", day: "Sat", parking: "Tech Park Basement", slot: "CAR-03", vehicleType: "Car", vehicle: "AP11 QR 1234", amount: 140, hours: 2, time: "09:00 AM" },
  { date: "2026-02-28", day: "Sat", parking: "Tech Park Basement", slot: "BIKE-01", vehicleType: "Bike", vehicle: "TN01 ST 5678", amount: 100, hours: 4, time: "08:00 AM" },
  // Sunday
  { date: "2026-03-01", day: "Sun", parking: "City Mall Parking", slot: "CAR-01", vehicleType: "Car", vehicle: "MP13 UV 9012", amount: 120, hours: 2, time: "11:00 AM" },
  { date: "2026-03-01", day: "Sun", parking: "Airport Lot", slot: "SML-01", vehicleType: "Small", vehicle: "RJ05 WX 3456", amount: 60, hours: 2, time: "10:00 AM" },
  { date: "2026-03-01", day: "Sun", parking: "Airport Lot", slot: "CAR-01", vehicleType: "Car", vehicle: "DL11 YZ 7890", amount: 100, hours: 2, time: "02:00 PM" },
  { date: "2026-03-01", day: "Sun", parking: "Metro Station P1", slot: "BIKE-03", vehicleType: "Bike", vehicle: "KA07 AB 2345", amount: 30, hours: 1, time: "04:00 PM" },
  { date: "2026-03-01", day: "Sun", parking: "Tech Park Basement", slot: "CAR-01", vehicleType: "Car", vehicle: "TN09 CD 6789", amount: 190, hours: 2, time: "09:00 AM" },
];

// ── Derived: daily aggregates for the bar chart ─────────
const DAYS_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const weeklyChartData = DAYS_ORDER.map((day) => {
  const dayTxns = revenueTransactions.filter((t) => t.day === day);
  const total = dayTxns.reduce((s, t) => s + t.amount, 0);
  return { day, value: Math.round((total / 950) * 100), amount: `₹${total}` }; // normalise to ~0-100 for bar height
});

// ── Last-week comparison data (mock) ────────────────────
export const lastWeekChartData = [
  { day: "Mon", value: 40, amount: "₹400" },
  { day: "Tue", value: 65, amount: "₹650" },
  { day: "Wed", value: 42, amount: "₹420" },
  { day: "Thu", value: 80, amount: "₹800" },
  { day: "Fri", value: 55, amount: "₹550" },
  { day: "Sat", value: 78, amount: "₹780" },
  { day: "Sun", value: 48, amount: "₹480" },
];

// ── Monthly mock (last 30 days) ─────────────────────────
export const monthlyRevenueTotal = 18_450;
export const lastMonthRevenueTotal = 16_200;

// ── Helper: unique parking lot names ────────────────────
export const parkingLots = PARKING_LOTS;
export const vehicleTypes = VEHICLE_TYPES;

// ── Peak time analysis ──────────────────────────────────
export function getPeakTimeSlots(transactions) {
  const hourBuckets = {};
  transactions.forEach((t) => {
    const hour = t.time.replace(/:.*/, "").trim() + " " + t.time.slice(-2);
    hourBuckets[hour] = (hourBuckets[hour] || 0) + t.amount;
  });
  const sorted = Object.entries(hourBuckets).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, 3).map(([time, rev]) => ({ time, revenue: rev }));
}
