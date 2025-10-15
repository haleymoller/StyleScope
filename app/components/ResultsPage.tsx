"use client";
import { useState } from 'react';
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ArrowLeft, Copy } from "lucide-react";
import { MetricsStrip } from "./MetricStrip";
import DensityTimeline from "./DensityTimeline";
import { ConcordanceTable } from "./ConcordanceTable";
import { SpanModal } from "./SpanModal";
const toast = { success: () => { } };

interface AnalysisData {
    totalWords: number;
    parentheticalSpans: number;
    perThousandWords: number;
    medianSpanLength: number;
    spans: Array<{
        id: number;
        text: string;
        context: string;
        startIndex: number;
        tokens: number;
        position: number;
    }>;
}

interface ResultsPageProps {
    data: AnalysisData;
    onBack: () => void;
    classifications?: Record<number, string[]>;
    longestSpans?: string[];
}

type SpanRow = AnalysisData["spans"][number];

export function ResultsPage({ data, onBack, classifications = {}, longestSpans = [] }: ResultsPageProps) {
    const [showAiLabels, setShowAiLabels] = useState(false);
    const [selectedSpan, setSelectedSpan] = useState<SpanRow | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [labels, setLabels] = useState<Record<number, string[]>>(classifications);
    const [labelLoading, setLabelLoading] = useState(false);

    const metrics = [
        { label: "Words", value: data.totalWords.toLocaleString() },
        { label: "Parenthetical spans", value: data.parentheticalSpans },
        { label: "Per 1,000 words", value: Math.round(data.perThousandWords * 10) / 10 },
        { label: "Median span length (tokens)", value: data.medianSpanLength }
    ];

    function buildHistogramFromSpans(spans: AnalysisData["spans"], bins = 60): { x: number[]; y: number[] } {
        const n = Math.max(1, Math.min(200, Math.floor(bins)));
        const y = Array.from({ length: n }, () => 0);
        spans.forEach((s) => {
            const b = Math.max(0, Math.min(n - 1, Math.floor(s.position * n)));
            y[b] += 1;
        });
        const x = Array.from({ length: n }, (_, i) => (i + 1) / n);
        return { x, y };
    }
    const histo = buildHistogramFromSpans(data.spans);

    const handleRowClick = (span: SpanRow) => {
        setSelectedSpan(span);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSpan(null);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    const getSpanClassifications = (spanId: number) => {
        return labels[spanId] || [];
    };

    async function fetchLabelsIfNeeded() {
        if (labelLoading) return;
        // if we already have some labels, skip
        const already = Object.keys(labels).length > 0;
        if (already) return;
        try {
            setLabelLoading(true);
            const take = data.spans.slice(0, 50);
            const spansOnly = take.map((s) => `(${s.text})`);
            const r = await fetch('/api/label', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ spans: spansOnly }) });
            const j = await r.json();
            const map: Record<number, string[]> = {};
            j.results?.forEach((row: { span: string; labels: string[] }, i: number) => {
                const id = take[i]?.id;
                if (id != null) map[id] = row.labels;
            });
            setLabels(map);
        } finally {
            setLabelLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={onBack}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Input
                        </Button>
                        <h1 className="text-2xl">Analysis Results</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => exportJSON(data, classifications)}>Export JSON</Button>
                        <Button variant="outline" size="sm" onClick={() => exportCSV(data, classifications)}>Export CSV</Button>
                    </div>
                </div>

                {/* Empty State */}
                {data.parentheticalSpans === 0 && (
                    <Card className="text-center py-12">
                        <CardContent>
                            <p className="text-muted-foreground">
                                No parentheses found. Try another passage or a different chapter.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Results */}
                {data.parentheticalSpans > 0 && (
                    <>
                        {/* Metrics Strip */}
                        <MetricsStrip items={metrics} />

                        {/* Density Timeline (Chart.js) */}
                        <DensityTimeline a={histo} />

                        {/* Concordance Table */}
                        <ConcordanceTable
                            spans={data.spans}
                            onRowClick={handleRowClick}
                            showAiLabels={showAiLabels}
                            classifications={classifications}
                        />

                        {/* Top 10 Longest Spans */}
                        {longestSpans.length > 0 && (
                            <Card className="mb-8">
                                <CardHeader>
                                    <CardTitle>Top Longest Spans</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {longestSpans.slice(0, 10).map((span, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                                <p className="text-sm flex-1 mr-4">({span})</p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(`(${span})`)}
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}

                {/* Sticky Footer */}
                <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
                    <div className="container mx-auto max-w-6xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Switch
                                id="ai-toggle"
                                checked={showAiLabels}
                                onCheckedChange={(v) => { setShowAiLabels(v); if (v) { void fetchLabelsIfNeeded(); } }}
                            />
                            <label htmlFor="ai-toggle" className="text-sm">
                                {labelLoading ? 'Classifying…' : 'Classify with AI (beta)'}
                            </label>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Experimental: classify spans as aside / interiority / scene-setting / time/place.
                        </p>
                    </div>
                </div>

                {/* Span Modal */}
                <SpanModal
                    span={selectedSpan}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    classifications={selectedSpan ? getSpanClassifications(selectedSpan.id) : []}
                />
            </div>
        </div>
    );
}

function exportJSON(data: any, classifications: Record<number, string[]>) {
    const payload = {
        metrics: {
            totalWords: data.totalWords,
            parentheticalSpans: data.parentheticalSpans,
            perThousandWords: data.perThousandWords,
            medianSpanLength: data.medianSpanLength,
        },
        spans: data.spans.map((s: any) => ({
            start: s.startIndex,
            end: s.startIndex + (s.text?.length || 0) + 2,
            text: `(${s.text})`,
            tokens: s.tokens,
            contextShort: s.context,
            labels: classifications[s.id] || [],
        })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'woolf-analysis.json';
    a.click();
    URL.revokeObjectURL(url);
}

function exportCSV(data: any, classifications: Record<number, string[]>) {
    const rows = [
        ['start', 'end', 'text', 'tokens', 'contextShort', 'labels'],
        ...data.spans.map((s: any) => [
            String(s.startIndex),
            String(s.startIndex + (s.text?.length || 0) + 2),
            quote(`(${s.text})`),
            String(s.tokens),
            quote(s.context || ''),
            quote((classifications[s.id] || []).join('|')),
        ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'woolf-analysis.csv';
    a.click();
    URL.revokeObjectURL(url);
}

function quote(s: string) {
    const t = s.replaceAll('"', '""');
    return `"${t}"`;
}
