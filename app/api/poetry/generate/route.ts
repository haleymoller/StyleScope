export async function POST(req: Request) {
    try {
        const body = await req.json();
        const prompt: string = (body?.prompt ?? "").toString();
        if (!prompt || prompt.trim().length === 0) {
            return new Response(JSON.stringify({ error: "Missing prompt" }), { status: 400 });
        }
        const poem = stubComposePoem(prompt);
        return Response.json({ poem });
    } catch {
        return new Response(JSON.stringify({ error: "Bad request" }), { status: 400 });
    }
}

function stubComposePoem(prompt: string): string {
    const lines = prompt
        .replaceAll(/\r\n?/g, " ")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 80);
    const title = lines.slice(0, 3).map(capitalize).join(" ");
    const partA = lines.slice(0, Math.ceil(lines.length / 2)).join(" ");
    const partB = lines.slice(Math.ceil(lines.length / 2)).join(" ");
    return `${title}\n\n${wrap(partA, 7)}\n\n—\n\n${wrap(partB, 6)}\n`;
}

function wrap(text: string, perLine: number): string {
    const words = text.split(/\s+/).filter(Boolean);
    const out: string[] = [];
    for (let i = 0; i < words.length; i += perLine) {
        out.push(words.slice(i, i + perLine).join(" "));
    }
    return out.join("\n");
}

function capitalize(s: string): string {
    return s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : s;
}


