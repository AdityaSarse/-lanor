import React from "react";
import { cn } from "../../utils/cn";

export const Input = React.forwardRef(({ className, type = "text", error, label, ...props }, ref) => {
  return (
    <div className="w-full text-left space-y-1.5">
      {label && <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">{label}</label>}
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900/90 px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";
