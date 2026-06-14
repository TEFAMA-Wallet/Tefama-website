"use client";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
}

export default function Sparkline({ data, width = 120, height = 36 }: SparklineProps) {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const xAt = (i: number) => (i / (data.length - 1)) * width;
  const yAt = (v: number) => height - ((v - min) / range) * height;
  const d = data.map((v, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <path d={d} fill="none" stroke="var(--orange-400)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
