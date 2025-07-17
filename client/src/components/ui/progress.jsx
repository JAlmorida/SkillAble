import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-gray-200 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}>
      <div className="w-full bg-blue-100 dark:bg-blue-900 rounded-full h-3">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </ProgressPrimitive.Root>
  );
}

export { Progress }
