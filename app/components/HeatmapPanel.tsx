"use client";

import React, { useMemo, useRef, useState } from "react";

export type HeatSpan = {
  id: string;
  start: number;
  end: number; // exclusive
  text: string; // includes parentheses "( ... )"
  tokens: number;
};

export function quantize5(d: number): 1 | 2 | 3 | 4 | 5 {
  if (d < 0.2) return 1;
  if (d < 0.4) return 2;
  if (d < 0.6) return 3;
  if (d < 0.8) return 4;
  return 5;
}

export function computePctlThreshold(tokens: number[], pctl = 90): number {
  if (!tokens.length) return Infinity;
  const sorted = [...tokens].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((pctl / 100) * sorted.length));
  return sorted[idx];
}

function computeLocalDensities(spans: HeatSpan[], windowChars = 3000): number[] {
  if (spans.length === 0) return [];
  const centers = spans.map((s) => (s.start + s.end) / 2);
  const counts: number[] = new Array(spans.length).fill(0);
  let left = 0;
  for (let i = 0; i < centers.length; i++) {
    const c = centers[i];
    while (c - centers[left] > windowChars / 2) left++;
    let right = i;
    while (right + 1 < centers.length && centers[right + 1] - c <= windowChars / 2) right++;
    counts[i] = right - left + 1;
  }
  const max = Math.max(...counts);
  return counts.map((n) => (max > 0 ? n / max : 0));
}

export default function HeatmapPanel(props: {
  text: string;
  spans: HeatSpan[];
  densities?: number[];
  onSpanClick?: (id: string) => void;
  monochrome?: boolean;
  longSpanPctl?: number;
  maxChars?: number;
}): JSX.Element {
  const { text, spans, densities, onSpanClick, monochrome = false, longSpanPctl = 90, maxChars = 200_000 } = props;
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const safeSpans = useMemo(() => spans.slice().sort((a, b) => a.start - b.start), [spans]);
  const localDensities = useMemo(() => densities && densities.length === safeSpans.length ? densities : computeLocalDensities(safeSpans), [densities, safeSpans]);
  const longThreshold = useMemo(() => computePctlThreshold(safeSpans.map((s) => s.tokens), longSpanPctl), [safeSpans, longSpanPctl]);

  function handleClick(id: string) {
    onSpanClick?.(id);
    const ev = new CustomEvent('heatmap:spanClick', { detail: { id }, bubbles: true });
    document.dispatchEvent(ev);
  }

  function handleKey(id: string) {
    return (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick(id);
      } else if (e.key === 'Escape') {
        setTooltip(null);
      }
    };
  }

  function showTooltip(target: HTMLElement, s: HeatSpan) {
    const rect = target.getBoundingClientRect();
    const content = `<b>${escapeHtml(trimMiddle(s.text, 120))}</b><div class="row">Length: ${s.tokens} tokens</div><div class="row">Index: ${s.start}–${s.end}</div>`;
    setTooltip({ x: rect.left + rect.width / 2, y: rect.top - 8, content });
  }
  function hideTooltip() { setTooltip(null); }

  if (text.length > maxChars) {
    return (
      <section className="heatmap" aria-label="Inline heatmap of parenthetical spans">
        <div className="mb-2 text-sm text-destructive">Text too large for inline heatmap; displaying plain text only.</div>
        <div dir="auto">{text}</div>
      </section>
    );
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  safeSpans.forEach((s, idx) => {
    if (s.start > cursor) parts.push(<span key={`t-${cursor}`}>{text.slice(cursor, s.start)}</span>);
    const d = localDensities[idx] ?? 0;
    const level = quantize5(d);
    const isLong = s.tokens >= longThreshold;
    const cls = `heat heat-${level}${isLong ? ' heat-long' : ''}`;
    parts.push(
      <mark
        key={s.id}
        id={s.id}
        role="button"
        tabIndex={0}
        aria-label={`Parenthetical span, ${s.tokens} tokens, index ${s.start}-${s.end}`}
        className={cls}
        data-span-id={s.id}
        onClick={() => handleClick(s.id)}
        onKeyDown={handleKey(s.id)}
        onMouseEnter={(e) => showTooltip(e.currentTarget as HTMLElement, s)}
        onMouseLeave={hideTooltip}
      >
        {text.slice(s.start, s.end)}
      </mark>
    );
    cursor = s.end;
  });
  if (cursor < text.length) parts.push(<span key={`t-end`}>{text.slice(cursor)}</span>);

  return (
    <section
      ref={containerRef}
      className={`heatmap ${monochrome ? 'heatmap--mono' : ''}`}
      aria-label="Inline heatmap of parenthetical spans"
    >
      {parts}
      {tooltip && (
        <div
          className="hm-tooltip"
          style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)" }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </section>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function trimMiddle(s: string, max = 120): string {
  if (s.length <= max) return s;
  const half = Math.floor((max - 1) / 2);
  return s.slice(0, half) + "…" + s.slice(s.length - half);
}


