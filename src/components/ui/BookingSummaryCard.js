import React from "react";
import { Button, Divider, Paper, Typography } from "@mui/material";

export default function BookingSummaryCard({
  title = "Your Search",
  summaryItems = [],
  highlights = [],
  children = null,
  ctaLabel,
  onCta,
  sticky = false,
}) {
  return (
    <Paper
      elevation={0}
      className={`overflow-hidden rounded-[28px] border border-[rgba(139,64,100,0.12)] bg-[rgba(254,254,234,0.92)] p-5 shadow-[0_24px_60px_rgba(139,64,100,0.10)] backdrop-blur ${sticky ? "lg:sticky lg:top-24" : ""}`}
    >
      <div className="mb-4">
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b4064]">
          Phoenix Trips
        </span>
        <Typography variant="h6" sx={{ mt: 1, fontWeight: 700, color: "#4f2c2d" }}>
          {title}
        </Typography>
      </div>

      <div className="space-y-3">
        {summaryItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-2xl bg-white/82 px-4 py-3"
          >
            <span className="text-sm text-[#7a6055]">{item.label}</span>
            <span className="text-sm font-semibold text-[#4f2c2d]">{item.value}</span>
          </div>
        ))}
      </div>

      {highlights.length ? (
        <>
          <Divider sx={{ my: 3 }} />
          <div className="space-y-2">
            {highlights.map((highlight) => (
              <div key={highlight} className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#bb581e]" />
                <Typography variant="body2" sx={{ color: "#6f5a51" }}>
                  {highlight}
                </Typography>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {children ? <div className="mt-4">{children}</div> : null}

      {ctaLabel ? (
        <Button
          fullWidth
          variant="contained"
          onClick={onCta}
          sx={{
            mt: 3,
            borderRadius: "999px",
            background: "linear-gradient(135deg, #8b4064 0%, #bb581e 100%)",
            py: 1.5,
            fontWeight: 700,
            textTransform: "none",
            boxShadow: "0 20px 40px rgba(139, 64, 100, 0.18)",
            "&:hover": {
              background: "linear-gradient(135deg, #6e314f 0%, #a14b19 100%)",
            },
          }}
        >
          {ctaLabel}
        </Button>
      ) : null}
    </Paper>
  );
}
