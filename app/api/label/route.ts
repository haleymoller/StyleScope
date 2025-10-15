export async function POST(req: Request) {
  try {
    const body = await req.json();
    const spans: string[] = Array.isArray(body?.spans) ? body.spans : [];
    const labels = ["aside", "interiority", "scene-setting", "time/place"] as const;
    const out = spans.slice(0, 50).map((s, i) => ({
      span: s,
      labels: [labels[i % labels.length]],
    }));
    return new Response(JSON.stringify({ results: out }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
}


