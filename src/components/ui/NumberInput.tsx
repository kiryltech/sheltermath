import React, { ChangeEvent } from 'react';
import { cn } from '@/lib/utils'; // Assuming cn exists, I'll check this next

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min,
  max,
  step,
  label,
  prefix,
  suffix,
  className,
}) => {
  const [localValue, setLocalValue] = React.useState<string>(value.toString());

  // Sync local value when prop changes externally
  React.useEffect(() => {
    // Only update if the parsed local value is different from the new prop value
    // This prevents cursor jumping or formatting loss while typing if the parent re-renders
    if (parseFloat(localValue) !== value) {
        setLocalValue(value.toString());
    }
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // Allow numbers and a single decimal point
    if (/^\d*\.?\d*$/.test(rawValue)) {
        setLocalValue(rawValue);

        const numValue = parseFloat(rawValue);
        if (!isNaN(numValue)) {
            onChange(numValue);
        } else if (rawValue === '') {
             // Optional: Handle empty input, maybe don't call onChange or call with 0
             // For now, we keep local state empty but don't update parent to NaN
        }
    }
  };

  const handleBlur = () => {
      // On blur, reset to formatted value from props to ensure consistency
      setLocalValue(value.toString());
  };

  return (
    <div className={cn("relative", className)}>
        {prefix && (
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">
                {prefix}
            </span>
        )}
        <input
            type="text"
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className={cn(
                "bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-right font-mono text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary tabular-nums shadow-sm transition-all",
                prefix && "pl-5",
                suffix && "pr-6" // Add padding for suffix
            )}
        />
         {suffix && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">
                {suffix}
            </span>
        )}
    </div>
  );
};
