export function analyzeText(text: string) {
    const parenthesesRegex = /\([^\)]+\)/g;
    const matches = [...text.matchAll(parenthesesRegex)];
    const words = text.trim().length ? text.split(/\s+/).length : 0;

    const spans = matches.map((match, index) => {
        const fullMatch = match[0];
        const innerText = fullMatch.slice(1, -1);
        const startIndex = match.index || 0;
        const tokens = innerText.trim().length ? innerText.split(/\s+/).length : 0;
        const contextStart = Math.max(0, startIndex - 50);
        const contextEnd = Math.min(text.length, startIndex + fullMatch.length + 50);
        const context = text.slice(contextStart, contextEnd);
        return {
            id: index + 1,
            text: innerText,
            context,
            startIndex,
            tokens,
            position: text.length ? startIndex / text.length : 0,
        };
    });

    const spanLengths = spans.map((s) => s.tokens).sort((a, b) => a - b);
    const medianLength = spanLengths.length
        ? spanLengths[Math.floor(spanLengths.length / 2)]
        : 0;

    return {
        totalWords: words,
        parentheticalSpans: spans.length,
        perThousandWords: words > 0 ? (spans.length / words) * 1000 : 0,
        medianSpanLength: medianLength,
        spans,
    };
}


