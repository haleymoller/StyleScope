

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b bg-[var(--bg-0)] hero-gradient">
        <div className="container mx-auto max-w-6xl px-4 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-5xl md:text-7xl font-semibold leading-tight tracking-tight">StyleScope</h1>
              <p className="mt-3 text-base md:text-lg text-muted-foreground">Analyze literary style across prose and poetry — visualize density, rhythm, and stylistic signatures.</p>
              <div className="mt-6 flex gap-3">
                <a href="https://www.arxiv.org/pdf/2505.17071" target="_blank" rel="noreferrer" className="inline-flex items-center rounded-[var(--radius-12)] border px-5 h-11 hover:bg-[color-mix(in_srgb,var(--poem-12)_10%,transparent)]">Read Paper</a>
              </div>
            </div>
            <div className="rounded-[var(--radius-12)] border shadow-card overflow-hidden">
              <iframe
                title="What’s in a prompt? (arXiv)"
                src="https://www.arxiv.org/pdf/2505.17071"
                className="w-full h-[520px] bg-white"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="bg-background">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <p className="text-sm text-muted-foreground">This project builds on original research in computational literary style.</p>
        </div>
      </section>
    </div>
  );
}
