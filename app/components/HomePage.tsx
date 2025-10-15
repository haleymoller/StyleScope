import { useState } from 'react';
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Upload, BookOpen } from "lucide-react";

interface HomePageProps {
    onAnalyze: (text: string) => void;
}

export function HomePage({ onAnalyze }: HomePageProps) {
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!text.trim()) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Analyze failed');
            // Pass original text to keep local compute compatible downstream
            onAnalyze(text);
        } catch (e) {
            // no-op display for now
        } finally {
            setIsLoading(false);
        }
    };

    const handleSampleText = () => {
        const sampleText = `She was thinking, her book yielding to the vision that had created it. (And indeed it was impossible to think of her, of Virginia Woolf, now, without seeing her as she was in that last struggle with madness.) The flowers in the window box (how they remind her of childhood summers in Cornwall) seemed to pulse with life. Mrs. Ramsay, she thought, would understand. (Time passes, she had written, but does it really?) The waves continued their eternal conversation with the shore.`;
        setText(sampleText);
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <BookOpen className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl">Woolf&apos;s Parentheses — Analyzer</h1>
                    </div>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Quantify Woolf&apos;s &quot;thought-within-thought&quot;: parentheses frequency, length, and placement across her literary works.
                    </p>
                </div>

                {/* Main Card */}
                <Card className="mb-8 border text-[var(--secondary-foreground)]"
                    style={{
                        backgroundColor: "color-mix(in srgb, var(--secondary) 14%, transparent)",
                        borderColor: "color-mix(in srgb, var(--secondary) 45%, transparent)"
                    }}
                >
                    <CardHeader>
                        <CardTitle>Analyze Text</CardTitle>
                        <CardDescription className="!text-[var(--secondary-foreground)]/85">
                            Paste a passage from Virginia Woolf or upload a text file to analyze parenthetical usage patterns.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Text Input */}
                        <div className="space-y-2">
                            <label htmlFor="text-input" className="text-sm font-medium">
                                Text to Analyze
                            </label>
                            <Textarea
                                id="text-input"
                                placeholder="Paste your Virginia Woolf text here..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={12}
                                className="resize-none text-sm leading-relaxed"
                            />
                        </div>

                        {/* Upload Option */}
                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                            <Upload className="h-8 w-8 mx-auto mb-2 text-[var(--secondary-foreground)]/90" />
                            <p className="text-sm mb-2 text-[var(--secondary-foreground)]/80">
                                Or upload a .txt file
                            </p>
                            <input
                                type="file"
                                accept=".txt"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const content = await file.text();
                                    setText(content);
                                }}
                                className="block mx-auto text-sm"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <Button
                                onClick={handleAnalyze}
                                disabled={!text.trim() || isLoading}
                                className="flex-1"
                            >
                                {isLoading ? "Analyzing..." : "Analyze Parentheses"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleSampleText}
                            >
                                Use Sample Text
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Note */}
                <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                        Supports nested parentheses. Works with public-domain texts.
                    </p>
                </div>
            </div>
        </div>
    );
}
