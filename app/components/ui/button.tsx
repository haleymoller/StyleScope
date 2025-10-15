import * as React from "react";

function cn(
  ...inputs: Array<string | number | null | undefined | false>
): string {
  return inputs.filter(Boolean).join(" ");
}

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

const baseClass = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-12)] text-sm font-medium transition-[background-color,box-shadow,transform] duration-120 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border no-underline shadow-[0_1px_0_rgba(0,0,0,0.02)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] active:shadow-[0_1px_0_rgba(0,0,0,0.02)] active:translate-y-[1px]";

const variantClass: Record<ButtonVariant, string> = {
  default: "bg-primary text-primary-foreground border-transparent hover:bg-[color-mix(in_srgb,var(--primary)_-15%,black_15%)]",
  destructive:
    "bg-destructive text-white border-transparent hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
  outline:
    "border border-line-200 bg-background text-foreground hover:bg-bg-50 dark:border-line-200 dark:bg-bg-0 dark:hover:bg-bg-50",
  secondary: "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_srgb,var(--secondary)_-10%,black_10%)]",
  ghost: "hover:bg-accent-100 hover:text-accent-700 dark:hover:bg-accent-100/20",
  link: "border bg-background text-foreground hover:bg-accent-100 hover:text-accent-700",
};

const sizeClass: Record<ButtonSize, string> = {
  default: "h-9 px-4 py-2 has-[>svg]:px-3",
  sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
  lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
  icon: "size-9 rounded-md",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

function Button({ className, variant = "default", size = "default", ...props }: ButtonProps) {
  return (
    <button
      data-slot="button"
      className={cn(baseClass, variantClass[variant], sizeClass[size], className)}
      {...props}
    />
  );
}

export { Button };

