import { Card, CardContent } from "./ui/card";

interface MetricItem {
    label: string;
    value: string | number;
    icon?: string;
}

interface MetricsStripProps {
    items: MetricItem[];
}

export function MetricsStrip({ items }: MetricsStripProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {items.map((item, index) => (
                <Card key={index} className="bg-card border border-border shadow-sm">
                    <CardContent className="p-6">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">{item.label}</p>
                            <p className="text-2xl tracking-tight">{item.value}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
