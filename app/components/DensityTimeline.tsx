"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

type Histo = { x: number[]; y: number[] };

function toDataset(h: Histo | null | undefined, label: string, colorVar: string, fill = true) {
  const y = h?.y ?? [];
  return {
    label,
    data: y,
    borderColor: getComputedStyle(document.documentElement).getPropertyValue(colorVar).trim() || "#7684c1",
    backgroundColor: () => {
      const c = getComputedStyle(document.documentElement).getPropertyValue(colorVar).trim() || "#7684c1";
      return fill ? `${c}33` : c; // ~20% opacity if filled
    },
    pointRadius: 0,
    tension: 0.3,
    fill,
    spanGaps: true,
  } as const;
}

export default function DensityTimeline({ a, b }: { a: Histo; b?: Histo }) {
  const labels = a?.x?.map((v) => `${Math.round(v * 100)}%`) ?? [];
  const data = {
    labels,
    datasets: [
      toDataset(a, "Text A", "--chart-1", true),
      ...(b ? [toDataset(b, "Text B", "--chart-2", false)] : []),
    ],
  } as const;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: Boolean(b) },
      tooltip: { intersect: false, mode: "index" as const },
    },
    scales: {
      x: {
        ticks: { color: getCssVar("--slate-500") },
        grid: { color: getCssVar("--line-200") },
      },
      y: {
        ticks: { color: getCssVar("--slate-500") },
        grid: { color: getCssVar("--line-200") },
      },
    },
  } as const;

  return (
    <div className="h-64 w-full">
      <Line data={data} options={options} />
    </div>
  );
}

function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}


