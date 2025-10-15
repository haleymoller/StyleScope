import type { Metadata } from "next";
import { Lora, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import "./(ui)/styles.css";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StyleScope",
  description: "Analyze literary style across prose and poetry.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${lora.variable} ${geistMono.variable} antialiased`}>
        <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-semibold">StyleScope</Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link className="hover:font-semibold" href="/about">About</Link>
              <Link className="hover:font-semibold" href="/lab">Try StyleScope</Link>
              <a className="hover:font-semibold" href="https://www.arxiv.org/pdf/2505.17071" target="_blank" rel="noreferrer">Read Paper</a>
              {/* API Docs link removed */}
            </nav>
          </div>
        </header>
        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
        <footer className="border-t bg-background/80">
          <div className="container mx-auto max-w-6xl px-4 h-14 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">© {new Date().getFullYear()} StyleScope</span>
            <div className="flex items-center gap-4">
              <a className="hover:underline" href="https://github.com/" target="_blank" rel="noreferrer">GitHub</a>
              <a className="hover:underline" href="/" target="_blank" rel="noreferrer">Live Demo</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
