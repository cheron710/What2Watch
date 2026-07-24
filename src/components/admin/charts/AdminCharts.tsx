// src/components/admin/charts/AdminCharts.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

// Helper for labels / caps
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ── 1. LINE CHART (e.g. Daily active users) ───────────────────────
interface LineChartProps {
  data: { label: string; value: number }[];
  title?: string;
  height?: number;
}

export function LineChart({ data, title, height = 240 }: LineChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 10);
  const minVal = Math.min(...values, 0);
  const range = maxVal - minVal;

  const padding = 40;
  const chartHeight = height - padding * 2;
  const chartWidth = 500;
  const stepX = chartWidth / (data.length - 1 || 1);

  // Generate coordinates
  const points = data.map((d, idx) => {
    const x = padding + idx * stepX;
    const y = padding + chartHeight - ((d.value - minVal) / range) * chartHeight;
    return { x, y, label: d.label, value: d.value };
  });

  // SVG Path String
  const pathD = points.reduce(
    (acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ""
  );

  const fillD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="admin-card space-y-4">
      {title && <h3 className="text-sm font-semibold tracking-wider text-[var(--admin-text-muted)] uppercase">{title}</h3>}
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${chartWidth + padding * 2} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--admin-accent)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--admin-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = padding + chartHeight * ratio;
            const gridVal = Math.round(maxVal - ratio * range);
            return (
              <g key={idx}>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth + padding}
                  y2={y}
                  stroke="var(--admin-border)"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <text
                  x={padding - 8}
                  y={y + 4}
                  fill="var(--admin-text-muted)"
                  fontSize={9}
                  fontWeight={500}
                  textAnchor="end"
                >
                  {gridVal}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <motion.path
            d={fillD}
            fill="url(#lineGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />

          {/* Line stroke */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="var(--admin-accent)"
            strokeWidth={2}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />

          {/* Points & Interactive Nodes */}
          {points.map((p, idx) => (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === idx ? 6 : 3.5}
                fill={hoveredIdx === idx ? "var(--admin-orange)" : "var(--admin-card-bg)"}
                stroke="var(--admin-accent)"
                strokeWidth={2}
                className="transition-all duration-150"
              />
              {/* Tooltip Overlay */}
              {hoveredIdx === idx && (
                <g>
                  <rect
                    x={p.x - 40}
                    y={p.y - 32}
                    width={80}
                    height={22}
                    rx={4}
                    fill="var(--admin-text)"
                    opacity={0.9}
                  />
                  <text
                    x={p.x}
                    y={p.y - 18}
                    fill="var(--admin-card-bg)"
                    fontSize={10}
                    fontWeight={600}
                    textAnchor="middle"
                  >
                    {p.value} users
                  </text>
                </g>
              )}
            </g>
          ))}

          {/* X axis labels */}
          {points.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={height - padding + 16}
              fill="var(--admin-text-muted)"
              fontSize={9}
              fontWeight={500}
              textAnchor="middle"
            >
              {p.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ── 2. BAR CHART (e.g. Movie / Mood popularity) ───────────────────
interface BarChartProps {
  data: { label: string; value: number }[];
  title?: string;
  height?: number;
}

export function BarChart({ data, title, height = 240 }: BarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 10);

  const padding = 40;
  const chartHeight = height - padding * 2;
  const chartWidth = 500;
  const totalBars = data.length;
  const barGapRatio = 0.4; // 40% gap spacing

  const containerWidth = chartWidth + padding * 2;
  const rawBarWidth = chartWidth / totalBars;
  const gap = rawBarWidth * barGapRatio;
  const barWidth = rawBarWidth - gap;

  return (
    <div className="admin-card space-y-4">
      {title && <h3 className="text-sm font-semibold tracking-wider text-[var(--admin-text-muted)] uppercase">{title}</h3>}
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${containerWidth} ${height}`} className="w-full h-auto overflow-visible">
          {/* Y Axis Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = padding + chartHeight * ratio;
            const gridVal = Math.round(maxVal - ratio * maxVal);
            return (
              <g key={idx}>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth + padding}
                  y2={y}
                  stroke="var(--admin-border)"
                  strokeWidth={1}
                />
                <text
                  x={padding - 8}
                  y={y + 4}
                  fill="var(--admin-text-muted)"
                  fontSize={9}
                  fontWeight={500}
                  textAnchor="end"
                >
                  {gridVal}
                </text>
              </g>
            );
          })}

          {/* Columns */}
          {data.map((d, idx) => {
            const pct = d.value / maxVal;
            const h = chartHeight * pct;
            const x = padding + idx * rawBarWidth + gap / 2;
            const y = padding + chartHeight - h;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                <motion.rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(h, 2)}
                  rx={3}
                  fill={hoveredIdx === idx ? "var(--admin-orange)" : "var(--admin-accent)"}
                  initial={{ height: 0, y: padding + chartHeight }}
                  animate={{ height: Math.max(h, 2), y }}
                  transition={{ type: "spring", damping: 15, stiffness: 100, delay: idx * 0.05 }}
                  className="transition-colors duration-150"
                />

                {/* X labels */}
                <text
                  x={x + barWidth / 2}
                  y={height - padding + 16}
                  fill="var(--admin-text-muted)"
                  fontSize={9}
                  fontWeight={500}
                  textAnchor="middle"
                  className="truncate max-w-[50px]"
                >
                  {d.label.length > 10 ? d.label.substring(0, 8) + ".." : d.label}
                </text>

                {/* Tooltip hover */}
                {hoveredIdx === idx && (
                  <g>
                    <rect
                      x={x + barWidth / 2 - 35}
                      y={y - 28}
                      width={70}
                      height={20}
                      rx={3}
                      fill="var(--admin-text)"
                      opacity={0.9}
                    />
                    <text
                      x={x + barWidth / 2}
                      y={y - 15}
                      fill="var(--admin-card-bg)"
                      fontSize={9}
                      fontWeight={600}
                      textAnchor="middle"
                    >
                      {d.value}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ── 3. DONUT CHART (e.g. Recommendation Usage metrics) ───────────
interface DonutChartProps {
  data: { label: string; value: number }[];
  title?: string;
  height?: number;
}

export function DonutChart({ data, title, height = 240 }: DonutChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = data.reduce((acc, d) => acc + d.value, 0);

  // Generate color palette matching the brand
  const colors = [
    "var(--admin-accent)",
    "var(--admin-orange)",
    "#DFA15A",
    "#8FAF6B",
    "#5C6E91",
    "#9A7A5A"
  ];

  const size = 200;
  const center = size / 2;
  const radius = size * 0.35;
  const strokeWidth = size * 0.12;
  const circumference = 2 * Math.PI * radius;

  let currentAngle = -90; // Start at top center

  const segments = data.map((d, idx) => {
    const angle = (d.value / (total || 1)) * 360;
    const strokeDashoffset = circumference - (d.value / (total || 1)) * circumference;
    const rotate = currentAngle;
    currentAngle += angle;

    return {
      ...d,
      strokeDashoffset,
      rotate,
      color: colors[idx % colors.length]
    };
  });

  return (
    <div className="admin-card space-y-4">
      {title && <h3 className="text-sm font-semibold tracking-wider text-[var(--admin-text-muted)] uppercase">{title}</h3>}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {segments.map((seg, idx) => (
              <motion.circle
                key={idx}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={hoveredIdx === idx ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: seg.strokeDashoffset }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                  transformOrigin: "center",
                  transform: `rotate(${seg.rotate}deg)`
                }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer transition-all duration-150"
              />
            ))}

            {/* Inner Text display */}
            <circle cx={center} cy={center} r={radius - strokeWidth / 2} fill="var(--admin-card-bg)" />
            <text x={center} y={center - 2} textAnchor="middle" fill="var(--admin-text)" fontSize={16} fontWeight={700}>
              {hoveredIdx !== null ? data[hoveredIdx].value : total}
            </text>
            <text x={center} y={center + 14} textAnchor="middle" fill="var(--admin-text-muted)" fontSize={8} fontWeight={600} className="uppercase tracking-wider">
              {hoveredIdx !== null ? data[hoveredIdx].label : "Total Recs"}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="space-y-2 flex-1">
          {segments.map((seg, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs transition px-2 py-1.5 rounded-md cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                <span className={`text-[var(--admin-text)] ${hoveredIdx === idx ? "font-semibold" : ""}`}>
                  {seg.label}
                </span>
              </div>
              <span className="font-semibold text-[var(--admin-text-muted)]">
                {Math.round((seg.value / (total || 1)) * 100)}% ({seg.value})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
