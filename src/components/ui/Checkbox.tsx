import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       onChange?.(e)
       onCheckedChange?.(e.target.checked)
    }

    return (
      <div className="relative flex items-center group">
        <input
          type="checkbox"
          className={cn(
            "peer h-4 w-4 appearance-none rounded border border-zinc-600 bg-zinc-900/50 shadow-sm cursor-pointer",
            "checked:bg-primary checked:border-primary",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-0",
            "group-hover:border-zinc-500 transition-all duration-200 ease-out",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          onChange={handleChange}
          ref={ref}
          {...props}
        />
        <Check
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-all duration-200 scale-50 peer-checked:scale-100"
            strokeWidth={3}
        />
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
