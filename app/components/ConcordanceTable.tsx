import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";

interface Span {
    id: number;
    text: string;
    context: string;
    startIndex: number;
    tokens: number;
    position: number;
}

interface ConcordanceTableProps {
    spans: Span[];
    onRowClick: (span: Span) => void;
    showAiLabels?: boolean;
    classifications?: Record<number, string[]>;
}

export function ConcordanceTable({ spans, onRowClick, showAiLabels = false, classifications = {} }: ConcordanceTableProps) {
    const formatContext = (context: string, spanText: string) => {
        const spanStart = context.indexOf(`(${spanText})`);
        if (spanStart === -1) return context;

        const before = context.slice(0, spanStart);
        const span = `(${spanText})`;
        const after = context.slice(spanStart + span.length);

        return (
            <>
                {before}
                <span className="font-semibold">{span}</span>
                {after}
            </>
        );
    };

    return (
        <div className="mb-8">
            <h3 className="mb-4">Concordance Table</h3>
            <div className="border border-[var(--line-200)] rounded-[var(--radius-12)] overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[60%]">Context</TableHead>
                            <TableHead className="w-[15%]">Start</TableHead>
                            <TableHead className="w-[15%]">Tokens</TableHead>
                            {showAiLabels && <TableHead className="w-[10%]">Labels</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {spans.map((span, i) => (
                            <TableRow
                                key={span.id}
                                className={`cursor-pointer transition-colors ${i % 2 === 1 ? 'bg-[var(--bg-50)]/60' : ''}`}
                                onClick={() => onRowClick(span)}
                            >
                                <TableCell className="text-sm leading-relaxed line-clamp-2">
                                    {formatContext(span.context, span.text)}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {span.startIndex}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {span.tokens}
                                </TableCell>
                                {showAiLabels && (
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {classifications[span.id]?.map((label, index) => (
                                                <Badge key={index} variant="secondary" className="text-xs bg-[var(--accent-100)] text-[var(--accent-700)]">
                                                    {label}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
