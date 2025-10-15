import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Copy, X } from "lucide-react";
const toast = { success: (_: string) => { } };

interface Span {
    id: number;
    text: string;
    context: string;
    startIndex: number;
    tokens: number;
    position: number;
}

interface SpanModalProps {
    span: Span | null;
    isOpen: boolean;
    onClose: () => void;
    classifications?: string[];
}

export function SpanModal({ span, isOpen, onClose, classifications = [] }: SpanModalProps) {
    if (!span) return null;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    const getFullContext = (context: string, spanText: string) => {
        // Simulate getting fuller context with surrounding sentences
        return `...${context}. The writing continues with rich, flowing prose that captures the essence of consciousness itself. These parenthetical moments reveal the layered nature of thought and experience...`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        Span Detail
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Span Text */}
                    <div>
                        <label className="text-sm text-muted-foreground">Parenthetical Text</label>
                        <div className="mt-1 p-3 bg-accent rounded-lg">
                            <p>({span.text})</p>
                        </div>
                    </div>

                    {/* Full Context */}
                    <div>
                        <label className="text-sm text-muted-foreground">Full Context (±2 sentences)</label>
                        <div className="mt-1 p-3 border rounded-lg">
                            <p className="leading-relaxed">
                                {getFullContext(span.context, span.text)}
                            </p>
                        </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-4 p-3 bg-muted rounded-lg">
                        <div>
                            <label className="text-xs text-muted-foreground">Position</label>
                            <p>{Math.round(span.position * 100)}%</p>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground">Start Index</label>
                            <p>{span.startIndex}</p>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground">Token Count</label>
                            <p>{span.tokens}</p>
                        </div>
                    </div>

                    {/* AI Classifications */}
                    {classifications.length > 0 && (
                        <div>
                            <label className="text-sm text-muted-foreground">AI Classification</label>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {classifications.map((label, index) => (
                                    <Badge key={index} variant="default" className="bg-primary text-primary-foreground">
                                        Likely: {label}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={() => copyToClipboard(`(${span.text})`)}
                            className="flex items-center gap-2"
                        >
                            <Copy className="h-4 w-4" />
                            Copy Quote
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => copyToClipboard(getFullContext(span.context, span.text))}
                            className="flex items-center gap-2"
                        >
                            <Copy className="h-4 w-4" />
                            Copy Context
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
