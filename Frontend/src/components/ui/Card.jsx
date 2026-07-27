import React from "react";
import { cn } from "../../utils/cn";

export const Card = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl backdrop-blur-md transition-all hover:border-zinc-700/80",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
