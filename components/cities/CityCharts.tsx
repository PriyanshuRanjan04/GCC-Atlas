"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ComposedChart, Legend, CartesianGrid,
} from "recharts";
import type { CityRichData } from "./CitiesClient";

interface Props { data: CityRichData[] }

const TS: React.CSSProperties & Record<string, unknown> = {};

const tooltipStyle = {
  contentStyle: {
    background: "rgba(17,24,39,0.96)",
    border: "1px solid rgba(31,45,69,0.9)",
    borderRadius: "8px",
    padding: "8px 12px",
    fontFamily: "Inter, sans-serif",
    fontSize: "13px",
    color: "#E5E7EB",
  },
  labelStyle: { color: "#9CA3AF", fontSize: "11px" },
  itemStyle: { color: "#E5E7EB" },
  cursor: { fill: "rgba(255,255,255,0.04)" },
};

void TS; // suppress unused warning

export function CityCharts({ data }: Props) {
  const chartData = data.map((c) => ({
    city:   c.city.city.replace(" NCR", ""),
    label:  c.city.city,
    gcc:    c.captiveCount,
    rent:   c.rentMid,
    salary: c.salaryMid,
    total:  c.totalCount,
  }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>

      {/* Chart 1: Captive GCC count by city */}
      <div className="card" style={{ padding: "1.25rem" }}>
        <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "0.9375rem", color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
          Captive GCCs by city
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
          Count from dataset — not exhaustive
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(31,45,69,0.6)" vertical={false} />
            <XAxis dataKey="city" tick={{ fill: "#6B7280", fontSize: 11, fontFamily: "Inter" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6B7280", fontSize: 11, fontFamily: "Inter" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              {...tooltipStyle}
              formatter={(value, _name, entry) => {
                const v = value as number;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return [`${v} captive GCC${v !== 1 ? "s" : ""}`, (entry.payload as any).label ?? ""];
              }}
              labelFormatter={() => ""}
            />
            <Bar dataKey="gcc" fill="#00C9A7" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 2: Grade A Rent vs SW Eng salary */}
      <div className="card" style={{ padding: "1.25rem" }}>
        <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "0.9375rem", color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
          Rent vs SW Eng Salary
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
          Midpoints · estimates only · ₹/sqft/mo  vs  ₹ lakh/yr
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={chartData} barSize={18}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(31,45,69,0.6)" vertical={false} />
            <XAxis dataKey="city" tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "Inter" }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="rent"   orientation="left"  tick={{ fill: "#F59E0B", fontSize: 10, fontFamily: "Inter" }} axisLine={false} tickLine={false} label={{ value: "Rent", angle: -90, position: "insideLeft", fill: "#F59E0B", fontSize: 9, dy: 20 }} />
            <YAxis yAxisId="salary" orientation="right" tick={{ fill: "#60A5FA", fontSize: 10, fontFamily: "Inter" }} axisLine={false} tickLine={false} label={{ value: "Salary (₹L)", angle: 90, position: "insideRight", fill: "#60A5FA", fontSize: 9, dy: -30 }} />
            <Tooltip
              {...tooltipStyle}
              formatter={(value, name) => {
                const v = value as number;
                if (name === "rent")   return [`₹${v}/sqft`, "Grade A Rent (mid)"];
                if (name === "salary") return [`₹${v}L/yr`, "SW Eng Salary (mid)"];
                return [`${v}`, String(name)];
              }}
            />
            <Legend
              formatter={(v) => v === "rent" ? "Rent" : "SW Salary"}
              wrapperStyle={{ fontFamily: "Inter", fontSize: 11, color: "#9CA3AF" }}
            />
            <Bar yAxisId="rent"   dataKey="rent"   fill="#F59E0B" fillOpacity={0.75} radius={[4, 4, 0, 0]} />
            <Bar yAxisId="salary" dataKey="salary" fill="#60A5FA" fillOpacity={0.75} radius={[4, 4, 0, 0]} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 3: Total entities — horizontal bar spanning full width */}
      <div className="card" style={{ padding: "1.25rem", gridColumn: "1 / -1" }}>
        <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "0.9375rem", color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
          Total ecosystem size by city
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
          Captive GCCs + professional services + IFSC regulated entities in this dataset
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} barSize={28} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(31,45,69,0.6)" horizontal={false} />
            <XAxis type="number" tick={{ fill: "#6B7280", fontSize: 11, fontFamily: "Inter" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <YAxis type="category" dataKey="city" tick={{ fill: "#9CA3AF", fontSize: 11, fontFamily: "Inter" }} axisLine={false} tickLine={false} width={72} />
            <Tooltip
              {...tooltipStyle}
              formatter={(value, _name, entry) => {
                const v = value as number;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return [`${v} entities`, (entry.payload as any).label ?? ""];
              }}
              labelFormatter={() => ""}
            />
            <Bar dataKey="total" fill="#C084FC" fillOpacity={0.75} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
