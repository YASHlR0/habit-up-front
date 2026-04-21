import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "./utils";

function Button({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold transition-colors",
        "bg-cyan-400 hover:bg-cyan-500 text-black disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
}

export { Button };
