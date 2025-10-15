import { analyzePoem } from "@/lib/poetry";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const text: string = (body?.text ?? "").toString();
        if (!text || text.trim().length === 0) {
            return new Response(JSON.stringify({ error: "Missing poem text" }), { status: 400 });
        }
        const analysis = analyzePoem(text);
        return Response.json(analysis);
    } catch (err: any) {
        return new Response(JSON.stringify({ error: "Bad request" }), { status: 400 });
    }
}


