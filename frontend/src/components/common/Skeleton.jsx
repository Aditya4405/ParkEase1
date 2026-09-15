import React from "react";

/**
 * Animated shimmer skeleton block
 */
export function Skeleton({ className = "", variant = "rect" }) {
  const roundedClass =
    variant === "circle"
      ? "rounded-full"
      : variant === "pill"
      ? "rounded-full"
      : "rounded-xl";

  return (
    <div
      className={`bg-white/[0.04] dark:bg-white/[0.04] border border-white/5 animate-pulse ${roundedClass} ${className}`}
    />
  );
}

/**
 * Skeleton for KPI Stat Cards (Admin/Owner/User Dashboard)
 */
export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex items-center gap-4 shadow-lg animate-pulse"
        >
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="w-20 h-3 bg-white/10 rounded-md" />
            <div className="w-28 h-6 bg-white/20 rounded-md" />
            <div className="w-16 h-2 bg-white/5 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for data tables (Transactions, Bookings, Users, Parkings, Refunds, etc.)
 */
export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="bg-[#1e293b] border border-white/10 rounded-2xl overflow-hidden shadow-xl animate-pulse">
      {/* Table Header Skeleton */}
      <div className="bg-black/30 border-b border-white/10 p-4 grid grid-cols-5 gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 bg-white/10 rounded-md" />
        ))}
      </div>

      {/* Table Rows Skeleton */}
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="p-4 grid grid-cols-5 gap-4 items-center">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div
                key={cIdx}
                className={`h-4 bg-white/5 rounded-md ${
                  cIdx === 0
                    ? "w-24 bg-white/10"
                    : cIdx === 1
                    ? "w-36"
                    : cIdx === cols - 1
                    ? "w-16 ml-auto"
                    : "w-28"
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for Charts / Analytics
 */
export function ChartSkeleton({ height = "h-64" }) {
  return (
    <div
      className={`bg-[#1e293b] border border-white/10 rounded-2xl p-6 ${height} flex flex-col justify-between shadow-xl animate-pulse`}
    >
      <div className="w-40 h-4 bg-white/10 rounded-md mb-4" />
      <div className="flex items-end justify-between gap-2 flex-1 pt-6 pb-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="w-full bg-white/5 rounded-t-lg"
            style={{ height: `${20 + ((i * 17) % 70)}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between pt-2 border-t border-white/5">
        <div className="w-16 h-2 bg-white/5 rounded" />
        <div className="w-16 h-2 bg-white/5 rounded" />
        <div className="w-16 h-2 bg-white/5 rounded" />
      </div>
    </div>
  );
}
