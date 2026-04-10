import React from "react";

const statusStyles = {
  active: "bg-[#fef3ef] text-[#8b4064] ring-[#e4c1cf]",
  delayed: "bg-[#fff4ea] text-[#bb581e] ring-[#efc6ad]",
  cancelled: "bg-[#f8e9ee] text-[#8b4064] ring-[#dfbcc9]",
  "fully booked": "bg-[#f6ede8] text-[#6f5a51] ring-[#e5d3c8]",
  default: "bg-[#fef3ef] text-[#8b4064] ring-[#e4c1cf]",
};

export default function StatusBadge({ label, className = "" }) {
  const key = String(label || "").toLowerCase();
  const style = statusStyles[key] || statusStyles.default;

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ring-1 ring-inset ${style} ${className}`}
    >
      {label}
    </span>
  );
}
