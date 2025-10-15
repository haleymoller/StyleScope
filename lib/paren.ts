export type ParenSpan = {
  id: number;
  text: string;
  startIndex: number; // index of '('
  endIndex: number;   // index AFTER ')'
};

export function extractParenthesesNested(input: string): ParenSpan[] {
  const spans: ParenSpan[] = [];
  const stack: number[] = [];
  let id = 1;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === '(') {
      stack.push(i);
    } else if (ch === ')') {
      const start = stack.pop();
      if (start !== undefined && start < i) {
        const inner = input.slice(start + 1, i);
        spans.push({ id: id++, text: inner, startIndex: start, endIndex: i + 1 });
      }
    }
  }
  // Preserve source order by start index
  spans.sort((a, b) => a.startIndex - b.startIndex);
  return spans;
}

export function addContext(source: string, span: { startIndex: number; endIndex: number }, window = 50): string {
  const start = Math.max(0, span.startIndex - window);
  const end = Math.min(source.length, span.endIndex + window);
  return source.slice(start, end).replaceAll(/\n+/g, " ");
}

export function normalizeCenters(spans: Array<{ startIndex: number; endIndex: number }>, textLength: number): number[] {
  if (!textLength) return spans.map(() => 0);
  return spans.map((s) => ((s.startIndex + s.endIndex) / 2) / textLength);
}

export function countWords(s: string): number {
  const t = s.trim();
  return t.length ? t.split(/\s+/).length : 0;
}

export function median(nums: number[]): number {
  if (!nums.length) return 0;
  const arr = [...nums].sort((a, b) => a - b);
  return arr[Math.floor(arr.length / 2)];
}

export function pctl(nums: number[], p = 95): number {
  if (!nums.length) return 0;
  const arr = [...nums].sort((a, b) => a - b);
  const idx = Math.min(arr.length - 1, Math.floor((p / 100) * arr.length));
  return arr[idx];
}

export function buildHistogram(spans: Array<{ startIndex: number }>, textLength: number, bins = 20): number[] {
  const n = Math.max(1, Math.min(200, Math.floor(bins)));
  const hist = Array.from({ length: n }, () => 0);
  if (!textLength) return hist;
  for (const s of spans) {
    const bucket = Math.max(0, Math.min(n - 1, Math.floor((s.startIndex / textLength) * n)));
    hist[bucket] += 1;
  }
  return hist;
}

export function buildHistogramXY(spans: Array<{ startIndex: number }>, textLength: number, bins = 60): { x: number[]; y: number[] } {
  const y = buildHistogram(spans, textLength, bins);
  const n = y.length;
  const x = Array.from({ length: n }, (_, i) => (i + 1) / n);
  return { x, y };
}


