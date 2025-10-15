"use client";

import * as React from "react";

type SwitchProps = {
    id?: string;
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
};

export function Switch({ id, checked, defaultChecked, onCheckedChange, disabled, className }: SwitchProps) {
    const [internalChecked, setInternalChecked] = React.useState<boolean>(defaultChecked ?? false);
    const isControlled = typeof checked === "boolean";
    const value = isControlled ? checked! : internalChecked;

    function handleToggle() {
        if (disabled) return;
        const next = !value;
        if (!isControlled) setInternalChecked(next);
        onCheckedChange?.(next);
    }

    return (
        <button
            id={id}
            type="button"
            role="switch"
            aria-checked={value}
            aria-disabled={disabled}
            onClick={handleToggle}
            disabled={disabled}
            className={`${
                value ? "bg-primary" : "bg-switch-background"
            } relative inline-flex h-6 w-11 items-center rounded-full border transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] ${
                disabled ? "opacity-50 pointer-events-none" : ""
            } ${className ?? ""}`}
        >
            <span
                className={`${
                    value ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-background transition-transform`}
            />
        </button>
    );
}
