export type Repetition = { word: string; count: number };
export type RepeatedLine = { line: string; count: number };
export type Anaphora = { word: string; lines: number[] };

export type PoetryAnalysis = {
    lines: string[];
    stanzas: number[][];
    syllablesPerLine: number[];
    wordsPerLine: number[];
    rhymeKeys: string[];
    rhymeScheme: string[];
    repetitions: Repetition[];
    repeatedLines: RepeatedLine[];
    anaphora: Anaphora[];
    alliterationScore: number[];
    punctuationCounts: Record<string, number>;
    metrics: {
        numLines: number;
        numStanzas: number;
        vocabularySize: number;
        typeTokenRatio: number;
        avgSyllablesPerLine: number;
        medianSyllablesPerLine: number;
        avgWordsPerLine: number;
    };
};

const VOWELS = /[aeiouy]+/i;
const VOWEL_GROUPS = /[aeiouy]+/gi;
const NON_WORD = /[^a-zA-Z']/g;
const STOPWORDS = new Set([
    "a", "an", "and", "the", "of", "in", "on", "to", "for", "is", "it", "that", "with", "as", "at", "by", "from", "be", "i", "you", "he", "she", "we", "they", "this", "those", "these", "was", "were", "are", "or", "but", "so"
]);

export function analyzePoem(input: string): PoetryAnalysis {
    const norm = input.replaceAll(/\r\n?/g, "\n");
    const rawLines = norm.split("\n");
    const lines = rawLines.map((l) => l.trimEnd());

    // Stanzas separated by blank lines
    const stanzas: number[][] = [];
    let current: number[] = [];
    lines.forEach((line, idx) => {
        if (line.trim().length === 0) {
            if (current.length) stanzas.push(current), (current = []);
        } else {
            current.push(idx);
        }
    });
    if (current.length) stanzas.push(current);

    const wordsPerLine = lines.map((l) => tokenizeWords(l).length);
    const syllablesPerLine = lines.map((l) => countSyllablesInLine(l));
    const rhymeKeys = lines.map((l) => buildRhymeKey(l));
    const rhymeScheme = letterizeRhymeScheme(rhymeKeys, stanzas);
    const repetitions = countRepetitions(lines);
    const repeatedLines = countRepeatedLines(lines);
    const anaphora = detectAnaphora(lines);
    const alliterationScore = lines.map((l) => computeAlliterationScore(l));
    const punctuationCounts = countPunctuation(norm);

    const allWords = tokenizeWords(norm);
    const vocab = new Set(allWords);
    const avgSyl = average(syllablesPerLine);
    const medSyl = median(syllablesPerLine);
    const avgWpl = average(wordsPerLine);

    return {
        lines,
        stanzas,
        syllablesPerLine,
        wordsPerLine,
        rhymeKeys,
        rhymeScheme,
        repetitions: repetitions.slice(0, 20),
        repeatedLines: repeatedLines.slice(0, 10),
        anaphora,
        alliterationScore,
        punctuationCounts,
        metrics: {
            numLines: lines.length,
            numStanzas: stanzas.length,
            vocabularySize: vocab.size,
            typeTokenRatio: vocab.size / Math.max(1, allWords.length),
            avgSyllablesPerLine: avgSyl,
            medianSyllablesPerLine: medSyl,
            avgWordsPerLine: avgWpl,
        },
    };
}

export function tokenizeWords(text: string): string[] {
    return text
        .toLowerCase()
        .replaceAll(NON_WORD, " ")
        .split(/\s+/)
        .filter(Boolean);
}

export function countSyllables(word: string): number {
    const w = word.toLowerCase().replaceAll(/[^a-z]/g, "");
    if (!w) return 0;
    if (w.length <= 3) return 1;
    // Remove trailing silent e (not in -le)
    const cleaned = w.endsWith("e") && !w.endsWith("le") ? w.slice(0, -1) : w;
    const groups = cleaned.match(VOWEL_GROUPS);
    const base = groups ? groups.length : (VOWELS.test(cleaned) ? 1 : 0);
    return Math.max(1, base);
}

export function countSyllablesInLine(line: string): number {
    const words = tokenizeWords(line);
    return words.reduce((sum, w) => sum + countSyllables(w), 0);
}

export function buildRhymeKey(line: string): string {
    const words = tokenizeWords(line);
    const last = words.length ? words[words.length - 1] : "";
    if (!last) return "";
    // last vowel nucleus + trailing consonants
    const m = Array.from(last.matchAll(/[aeiouy][a-z]*$/g));
    if (m.length) return m[m.length - 1][0];
    return last.slice(-3);
}

export function letterizeRhymeScheme(keys: string[], stanzas: number[][]): string[] {
    const scheme = new Array<string>(keys.length).fill("");
    let nextCode = 65; // 'A'
    for (const stanza of stanzas) {
        const map = new Map<string, string>();
        for (const idx of stanza) {
            const k = keys[idx];
            if (!k) {
                scheme[idx] = "-";
                continue;
            }
            if (!map.has(k)) {
                map.set(k, String.fromCharCode(nextCode));
                nextCode = nextCode === 90 ? 65 : nextCode + 1; // wrap after 'Z'
            }
            scheme[idx] = map.get(k)!;
        }
    }
    return scheme;
}

export function countRepetitions(lines: string[]): Repetition[] {
    const freq = new Map<string, number>();
    for (const line of lines) {
        for (const w of tokenizeWords(line)) {
            if (STOPWORDS.has(w)) continue;
            freq.set(w, (freq.get(w) || 0) + 1);
        }
    }
    return Array.from(freq.entries())
        .filter(([, c]) => c > 1)
        .sort((a, b) => b[1] - a[1])
        .map(([word, count]) => ({ word, count }));
}

export function countRepeatedLines(lines: string[]): RepeatedLine[] {
    const freq = new Map<string, number>();
    for (const l of lines) {
        const k = l.trim();
        if (!k) continue;
        freq.set(k, (freq.get(k) || 0) + 1);
    }
    return Array.from(freq.entries())
        .filter(([, c]) => c > 1)
        .sort((a, b) => b[1] - a[1])
        .map(([line, count]) => ({ line, count }));
}

export function detectAnaphora(lines: string[]): Anaphora[] {
    const groups = new Map<string, number[]>();
    lines.forEach((l, i) => {
        const w = tokenizeWords(l)[0];
        if (!w) return;
        if (!groups.has(w)) groups.set(w, []);
        groups.get(w)!.push(i);
    });
    return Array.from(groups.entries())
        .filter(([, idxs]) => idxs.length >= 2)
        .map(([word, lines]) => ({ word, lines }));
}

export function computeAlliterationScore(line: string): number {
    const words = tokenizeWords(line).filter((w) => w.length > 1 && !STOPWORDS.has(w));
    if (!words.length) return 0;
    const freq = new Map<string, number>();
    for (const w of words) {
        const key = w[0];
        freq.set(key, (freq.get(key) || 0) + 1);
    }
    const max = Math.max(...freq.values());
    return max / words.length;
}

export function countPunctuation(text: string): Record<string, number> {
    const punct = [",", ".", ";", ":", "?", "!", "—", "-", "(", ")", "\"", "'"];
    const out: Record<string, number> = {};
    for (const p of punct) out[p] = 0;
    for (const ch of text) {
        if (out[ch] !== undefined) out[ch]++;
    }
    return out;
}

export function average(nums: number[]): number {
    if (!nums.length) return 0;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function median(nums: number[]): number {
    if (!nums.length) return 0;
    const arr = [...nums].sort((a, b) => a - b);
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
}


