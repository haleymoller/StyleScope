import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = 'nodejs';

type AuthorKey = "Woolf" | "Joyce" | "Eliot" | "Faulkner";

function analyze(text: string) {
    const matches = [...text.matchAll(/\([^\)]+\)/g)];
    const words = text.trim().split(/\s+/).filter(Boolean);
    const spans = matches.map((m) => {
        const full = m[0];
        const inner = full.slice(1, -1);
        const tokens = inner.trim().split(/\s+/).filter(Boolean).length;
        return tokens;
    });
    const avgTokens = spans.length ? spans.reduce((a, b) => a + b, 0) / spans.length : 0;
    const per1k = words.length ? (matches.length / words.length) * 1000 : 0;
    return { avgTokens, per1k };
}

function splitIntoChapters(text: string) {
    // naive: split by \n\n or CHAPTER markers
    const parts = text.split(/\n\s*\n|\n?chapter\s+\w+/gi).filter(Boolean);
    if (parts.length < 2) {
        return [text];
    }
    return parts;
}

type AuthorResult = {
    name: AuthorKey;
    avgParenthesisTokens: number;
    per1k: number;
    chapterDistribution: Array<{ chapter: number; value: number }>;
};

export async function GET() {
    try {
        const base = path.join(process.cwd(), "public", "data", "authors");
        const authors: AuthorKey[] = ["Woolf", "Joyce", "Eliot", "Faulkner"];
        const results: Record<AuthorKey, AuthorResult> = {} as Record<AuthorKey, AuthorResult>;

        for (const name of authors) {
            // Support either a single file `${name}.txt` or a folder `${name}/` with multiple files
            const singleFile = path.join(base, `${name}.txt`);
            const dirPath = path.join(base, name);
            let corpusText = "";
            try {
                const stat = await fs.stat(dirPath).catch(() => null);
                if (stat && stat.isDirectory()) {
                    const files = await fs.readdir(dirPath);
                    for (const f of files) {
                        if (!f.toLowerCase().endsWith('.txt')) continue;
                        const p = path.join(dirPath, f);
                        const t = await fs.readFile(p, 'utf8');
                        corpusText += `\n\n${t}`;
                    }
                } else {
                    corpusText = await fs.readFile(singleFile, 'utf8');
                }
            } catch {
                results[name] = { name, avgParenthesisTokens: 0, per1k: 0, chapterDistribution: [] };
                continue;
            }

            const { avgTokens, per1k } = analyze(corpusText);
            const chapters = splitIntoChapters(corpusText);
            const chapterDistribution = chapters.slice(0, 10).map((ch, idx) => ({
                chapter: idx + 1,
                value: analyze(ch).per1k,
            }));
            results[name] = {
                name,
                avgParenthesisTokens: Number(avgTokens.toFixed(2)),
                per1k: Math.round(per1k),
                chapterDistribution,
            };
        }

        return NextResponse.json(results);
    } catch {
        return NextResponse.json({ error: "failed" }, { status: 500 });
    }
}


