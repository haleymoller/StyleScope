"use client";
import React, { useMemo, useState } from "react";

type EmbedResponse = {
  coords2d: number[][]; // [ [x,y], ... ] per layer
  layers: number;
  dim: number;
  chunk_size: number;
  method: string;
};

const MODELS = [
  { id: "meta-llama/Llama-3.2-1B", label: "Llama-3.2-1B (base)" },
  { id: "microsoft/phi-2", label: "Phi-2 (tiny)" },
];

const CHUNK_SIZES = [8, 16, 32, 64, 128];
const COLORS = [
  "var(--accent-600)",
  "var(--poem-8)",
  "#ef4444", // red
  "#22c55e", // green
];

export default function LabPage() {
  const [texts, setTexts] = useState<string[]>(["", "", "", ""]);
  const [model, setModel] = useState(MODELS[0].id);
  const [chunkSize, setChunkSize] = useState<number>(32);
  const [method, setMethod] = useState<"pca" | "umap">("pca");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<(EmbedResponse | null)[]>([null, null, null, null]);

  const setTextAt = (i: number, v: string) =>
    setTexts((prev) => prev.map((t, j) => (i === j ? v : t)));

  const handleFileAt = async (i: number, file: File) => {
    const txt = await file.text();
    setTexts((prev) => prev.map((t, j) => (i === j ? (t ? t + "\n\n" + txt : txt) : t)));
  };

  const pickFile = (i: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) await handleFileAt(i, file);
    };
    input.click();
  };

  async function embedOnce(text: string) {
    const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000").replace(/\/+$/, '');
    const r = await fetch(`${backendBase}/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, model, chunk_size: chunkSize, method }),
    });
    if (!r.ok) throw new Error(await r.text());
    const json: EmbedResponse = await r.json();
    return json;
  }

  const run = async () => {
    setLoading(true);
    setError(null);
    setResults([null, null, null, null]);
    try {
      const jobs: Array<Promise<EmbedResponse>> = [];
      const idxs: number[] = [];
      texts.forEach((t, i) => {
        if (t.trim()) {
          jobs.push(embedOnce(t));
          idxs.push(i);
        }
      });
      if (jobs.length === 0) throw new Error("Please enter at least one text");
      const outs = await Promise.all(jobs);
      setResults((prev) => {
        const next = [...prev];
        outs.forEach((r, k) => {
          next[idxs[k]] = r;
        });
        return next;
      });
    } catch (e: any) {
      setError(e?.message || "Failed to run embedding");
    } finally {
      setLoading(false);
    }
  };

  const width = 720;
  const height = 420;
  const margin = 24;

  const norms = useMemo(() => {
    const series = results.map((r) => r?.coords2d ?? []);
    const flat = series.flat();
    if (flat.length === 0) return [] as { x: number; y: number; i: number }[][];
    const xs = flat.map((p) => p[0]);
    const ys = flat.map((p) => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const sx = (x: number) => margin + ((x - minX) / (maxX - minX || 1)) * (width - 2 * margin);
    const sy = (y: number) => height - margin - ((y - minY) / (maxY - minY || 1)) * (height - 2 * margin);
    return series.map((s) => s.map((p, i) => ({ x: sx(p[0]), y: sy(p[1]), i })));
  }, [results]);

  // Reproduce commands removed per request

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-2">StyleScope</h1>
      <p className="text-muted-foreground mb-6">Drop text, pick a model, see the layer-by-layer trajectory in 2D.</p>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2 space-y-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <label className="block text-sm mb-1">Text {String.fromCharCode(65 + i)}</label>
              <textarea
                value={texts[i]}
                onChange={(e) => setTextAt(i, e.target.value)}
                className="w-full h-28 p-3 rounded-md border bg-secondary/20 text-[var(--secondary-foreground)]"
                placeholder={`Paste or type excerpt ${String.fromCharCode(65 + i)}...${i > 0 ? " (optional)" : ""}`}
              />
              <div className="flex items-center gap-3 mt-2">
                <button type="button" onClick={() => pickFile(i)} className="px-3 py-1.5 rounded-md border hover:bg-black/5">Upload File</button>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Model</label>
            <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full border rounded-md p-2">
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Chunk size (tokens)</label>
            <select value={chunkSize} onChange={(e) => setChunkSize(parseInt(e.target.value))} className="w-full border rounded-md p-2">
              {CHUNK_SIZES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Dimensionality reduction</label>
            <select value={method} onChange={(e) => setMethod(e.target.value as any)} className="w-full border rounded-md p-2">
              <option value="pca">PCA</option>
              <option value="umap">UMAP</option>
            </select>
          </div>
          <button disabled={loading || !texts.some((t) => t.trim())} onClick={run} className="px-4 py-2 rounded-md border hover:bg-black/5 disabled:opacity-50 w-full">
            {loading ? "Running…" : texts.filter((t) => t.trim()).length > 1 ? "Compare" : "Run"}
          </button>
          {/* Reproduce controls removed */}
          {error && <div className="text-red-600 text-sm">{error}</div>}
        </div>
      </div>

      <div className="rounded-md border p-3">
        <h2 className="font-medium mb-2">Layer trajectory</h2>
        {results.some(Boolean) && (
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-2">
            {results.map((r, i) => r && (
              <span key={i} className="inline-flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ background: COLORS[i] }} />
                {String.fromCharCode(65 + i)}
              </span>
            ))}
          </div>
        )}
        <svg width={width} height={height} className="w-full h-auto">
          {norms.map((series, i) => (
            <g key={`S-${i}`}>
              {series.length > 1 && (
                <polyline
                  fill="none"
                  stroke={COLORS[i]}
                  strokeOpacity={0.6}
                  strokeWidth={2}
                  points={series.map((p) => `${p.x},${p.y}`).join(" ")}
                />
              )}
              {series.map((p) => (
                <g key={`P-${i}-${p.i}`}>
                  <circle cx={p.x} cy={p.y} r={4} fill={COLORS[i]} />
                  <text x={p.x + 6} y={p.y - 6} fontSize="10" fill="var(--ink-600)">{`${String.fromCharCode(65 + i)}${p.i}`}</text>
                </g>
              ))}
            </g>
          ))}
        </svg>
        {!results.some(Boolean) && <p className="text-sm text-muted-foreground">Run an embedding to see the plot.</p>}
        {results.some(Boolean) && (
          <p className="text-sm text-muted-foreground mt-2">
            Each point is the last-token hidden state from a transformer layer, reduced to 2D via {method.toUpperCase()}. The polylines trace trajectories across layers (0 → L−1). Series labels A..D mark layer indices; all texts are projected into the same space so you can compare how their paths align or diverge. Computed with chunk size {chunkSize} tokens per step.
          </p>
        )}
      </div>
    </div>
  );
}


