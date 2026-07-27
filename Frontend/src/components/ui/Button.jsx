import React from "react";
import { cn } from "../../utils/cn";

export const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:pointer-events-none disabled:opacity-50 rounded-lg cursor-pointer";
    
    const variants = {
      default: "bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800 shadow-md shadow-purple-900/20",
      outline: "border border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-100",
      ghost: "hover:bg-zinc-800 text-zinc-200 hover:text-white",
      danger: "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-md shadow-rose-900/20",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      default: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base font-semibold",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
