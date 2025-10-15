import * as React from "react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "color-mix(in srgb, var(--ink-900) 40%, transparent)" }}
      onClick={() => onOpenChange(false)}
    >
      <div className="bg-card text-card-foreground rounded-lg shadow-lg max-h-[90vh] w-[90vw] md:w-[720px] overflow-auto" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={className}>{children}</div>;
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-4 border-b">{children}</div>;
}

export function DialogTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={className}>{children}</div>;
}


