import { recommendPoems } from "@/lib/poems";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt: string = (body?.prompt ?? "").toString();
    const limit: number = Math.max(1, Math.min(10, Number(body?.limit ?? 5)));
    if (!prompt.trim()) {
      return new Response(JSON.stringify({ error: "Missing prompt" }), { status: 400 });
    }
    const recs = recommendPoems(prompt, limit);
    return Response.json({ recommendations: recs });
  } catch {
    return new Response(JSON.stringify({ error: "Bad request" }), { status: 400 });
  }
}


