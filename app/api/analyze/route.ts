import { addContext, buildHistogramXY, countWords, extractParenthesesNested, median, pctl } from "@/lib/paren";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const text: string = body?.text || "";
        const bins: number = body?.bins ?? 20;
        const windowSize: number = body?.window ?? 50;
        if (typeof text !== "string" || text.trim().length === 0) {
            return new Response(JSON.stringify({ error: "Text is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const spansRaw = extractParenthesesNested(text);
        const wordCount = countWords(text);
        const numSpans = spansRaw.length;
        const per1k = wordCount ? Number(((numSpans / wordCount) * 1000).toFixed(2)) : 0;
        const spans = spansRaw.slice(0, 500).map((s) => ({
            id: s.id,
            text: s.text,
            context: addContext(text, s, windowSize),
            startIndex: s.startIndex,
            tokens: countWords(s.text),
            position: text.length ? s.startIndex / text.length : 0,
        }));
        const tokensArr = spans.map((s) => s.tokens);
        const medianLenTokens = median(tokensArr);
        const p95LenTokens = pctl(tokensArr, 95);
        const histogram = buildHistogramXY(spansRaw, text.length, bins);

        const response = {
            wordCount,
            numSpans,
            per1k,
            medianLenTokens,
            p95LenTokens,
            histogram,
            spans,
        };

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch {
        return new Response(JSON.stringify({ error: "Invalid request" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }
}


