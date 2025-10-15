"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DensityData {
    position: number;
    spans: number;
}

interface DensityChartProps {
    data?: DensityData[];
    title?: string;
    bins?: number[]; // optional precomputed bins for Text A
    compareBins?: number[]; // optional bins for Text B
}

export function DensityChart({ data = [], title = "Parentheses Density Across Text", bins, compareBins }: DensityChartProps) {
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent-600') || '#0EA5A6';
    const slate = getComputedStyle(document.documentElement).getPropertyValue('--slate-500') || '#6B7280';
    const line = getComputedStyle(document.documentElement).getPropertyValue('--line-200') || '#E5E7EB';

    let binData: Array<{ position: number; density: number }>;
    let binDataB: Array<{ position: number; density: number }> | null = null;

    if (bins && bins.length) {
        const n = bins.length;
        binData = bins.map((v, i) => ({ position: (i + 0.5) / n, density: v }));
        if (compareBins && compareBins.length) {
            const m = compareBins.length;
            binDataB = compareBins.map((v, i) => ({ position: (i + 0.5) / m, density: v }));
        }
    } else {
        // Create bins from raw positions
        const n = 20;
        binData = Array.from({ length: n }, (_, i) => {
            const binStart = i / n;
            const binEnd = (i + 1) / n;
            const spansInBin = data.filter(d => d.position >= binStart && d.position < binEnd).length;
            return { position: (binStart + binEnd) / 2, density: spansInBin };
        });
    }

    return (
        <div className="mb-8">
            <h3 className="mb-4">{title}</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={binData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={line} />
                        <XAxis
                            dataKey="position"
                            domain={[0, 1]}
                            type="number"
                            tickFormatter={(value) => `${Math.round(value * 100)}%`}
                            stroke={slate}
                        />
                        <YAxis
                            stroke={slate}
                            label={{ value: 'Parentheses Count', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                            labelFormatter={(value) => `Position: ${Math.round((value as number) * 100)}%`}
                            formatter={(value) => [value, 'Parentheses']}
                            contentStyle={{
                                backgroundColor: 'var(--bg-0)',
                                border: `1px solid ${line}`,
                                borderRadius: '8px'
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="density"
                            stroke={accent}
                            strokeWidth={2}
                            dot={{ fill: accent, strokeWidth: 2, r: 3 }}
                            activeDot={{ r: 5, stroke: accent, strokeWidth: 2 }}
                        />
                        {binDataB && (
                            <Line
                                type="monotone"
                                data={binDataB}
                                dataKey="density"
                                stroke="#7C3AED"
                                strokeWidth={2}
                                dot={{ fill: '#7C3AED', strokeWidth: 2, r: 3 }}
                                activeDot={{ r: 5, stroke: '#7C3AED', strokeWidth: 2 }}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
