import React from "react";
import { Typography } from "@mui/material";

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  action = null,
  className = "",
}) {
  const textAlign = align === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <div className={`flex flex-col gap-3 md:flex-row md:items-end md:justify-between ${className}`}>
      <div className={`flex flex-col gap-2 ${textAlign}`}>
        {eyebrow ? (
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b4064]">
            {eyebrow}
          </span>
        ) : null}
        <Typography
          variant="h3"
          component="h2"
          sx={{
            fontSize: { xs: "2rem", md: "2.6rem" },
            fontWeight: 700,
            color: "#4f2c2d",
            lineHeight: 1.05,
          }}
        >
          {title}
        </Typography>
        {description ? (
          <Typography
            variant="body1"
            sx={{
              maxWidth: 720,
              color: "#6f5a51",
              fontSize: { xs: "0.98rem", md: "1.05rem" },
            }}
          >
            {description}
          </Typography>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
