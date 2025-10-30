import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 whitespace-nowrap font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        success: "bg-[#10b981] text-white",
        warning: "bg-[#f59e0b] text-white",
        error: "bg-[#ef4444] text-white",
        info: "bg-[#3b82f6] text-white",
        neutral: "bg-[#6b7280] text-white",
        outline: "border border-border bg-background text-foreground",
      },
      size: {
        sm: "min-h-[18px] px-2 py-0.5 text-xs rounded-[4px]",
        default: "min-h-[20px] px-2.5 py-1 text-xs rounded-[5px]",
        lg: "min-h-[24px] px-3 py-1 text-sm rounded-[6px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
