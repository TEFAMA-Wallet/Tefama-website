"use client";
import { useRef, useState, useEffect } from "react";

interface AreaChartProps {
  data: number[];
  height?: number;
  showAxis?: boolean;
}

export default function AreaChart({ data, height = 300, showAxis = true }: AreaChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(720);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((e) => setW(e[0].contentRect.width));
    ro.observe(wrapRef.current);
    setW(wrapRef.current.clientWidth);
    return () => ro.disconnect();
  }, []);

  const padX = 8, padTop = 14, padBottom = showAxis ? 26 : 8;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const innerW = Math.max(10, w - padX * 2), innerH = height - padTop - padBottom;
  const xAt = (i: number) => padX + (i / (data.length - 1)) * innerW;
  const yAt = (v: number) => padTop + innerH - ((v - min) / range) * innerH;
  const line = data.map((v, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(" ");
  const area = `${line} L${xAt(data.length - 1).toFixed(1)} ${padTop + innerH} L${padX} ${padTop + innerH} Z`;

  const fmt = (n: number) => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  return (
    <div ref={wrapRef} style={{ width: "100%", position: "relative" }}>
      <svg
        width={w} height={height}
        style={{ display: "block" }}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - r.left;
          const i = Math.round(((x - padX) / innerW) * (data.length - 1));
          setHover(Math.max(0, Math.min(data.length - 1, i)));
        }}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="tf-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#df8a3e" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#df8a3e" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#df8a3e" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="tf-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c2722e" />
            <stop offset="100%" stopColor="#d9a23c" />
          </linearGradient>
          <filter id="tf-glow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {[0.25, 0.5, 0.75].map((g, i) => (
          <line key={i} x1={padX} x2={w - padX}
            y1={padTop + innerH * g} y2={padTop + innerH * g}
            stroke="rgba(43,37,30,0.06)" />
        ))}

        <path d={area} fill="url(#tf-area)" />
        <path d={line} fill="none" stroke="url(#tf-stroke)" strokeWidth="2.5"
          strokeLinejoin="round" strokeLinecap="round" filter="url(#tf-glow)" />

        {hover != null && (
          <g>
            <line x1={xAt(hover)} x2={xAt(hover)} y1={padTop} y2={padTop + innerH}
              stroke="rgba(223,138,62,0.45)" strokeDasharray="3 3" />
            <circle cx={xAt(hover)} cy={yAt(data[hover])} r="5"
              fill="#df8a3e" stroke="#ffffff" strokeWidth="2" />
          </g>
        )}

        {showAxis && [0, Math.floor(data.length / 2), data.length - 1].map((i, k) => (
          <text key={k}
            x={Math.min(w - 30, Math.max(20, xAt(i)))} y={height - 8}
            fill="var(--text-tertiary)" fontSize="11"
            fontFamily="var(--font-mono)" textAnchor="middle">
            {i === 0 ? "May 16" : i === data.length - 1 ? "Jun 14" : "May 30"}
          </text>
        ))}
      </svg>

      {hover != null && (
        <div style={{
          position: "absolute",
          left: Math.min(w - 130, Math.max(0, xAt(hover) - 60)),
          top: 6,
          background: "var(--surface-elevated)",
          border: "1px solid var(--border-default)",
          borderRadius: 8,
          padding: "6px 12px",
          fontSize: 13,
          fontFamily: "var(--font-mono)",
          pointerEvents: "none",
        }}>
          <div style={{ color: "var(--text-tertiary)", fontSize: 11, marginBottom: 2 }}>
            Point {hover + 1}
          </div>
          <div style={{ fontWeight: 600 }}>{fmt(data[hover])}</div>
        </div>
      )}
    </div>
  );
}
