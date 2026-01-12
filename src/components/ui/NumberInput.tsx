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
  // Helper to format with commas
  const formatNumber = (num: number) => num.toLocaleString('en-US', { maximumFractionDigits: 10 });
  const parseNumber = (str: string) => parseFloat(str.replace(/,/g, ''));

  const [localValue, setLocalValue] = React.useState<string>(formatNumber(value));
  const [isFocused, setIsFocused] = React.useState(false);

  // Sync local value when prop changes externally, but only if not focused (to avoid fighting user input)
  React.useEffect(() => {
    if (!isFocused) {
        setLocalValue(formatNumber(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // Allow numbers, commas, and decimal point
    // Regex allows: digits, commas, optional single decimal point followed by digits
    if (/^[\d,]*\.?[\d]*$/.test(rawValue)) {
        setLocalValue(rawValue);

        const numValue = parseNumber(rawValue);
        if (!isNaN(numValue)) {
            onChange(numValue);
        } else if (rawValue === '') {
             // Optional: Handle empty input
        }
    }
  };

  const handleFocus = () => {
      setIsFocused(true);
      // On focus, strip commas for easier editing?
      // Actually, standard behavior is often to keep them or strip them.
      // Let's keep them for now, but ensure parsing handles them.
      // If we want to strip on focus:
      // setLocalValue(localValue.replace(/,/g, ''));
      // But user asked for comma as separator, implying display.
      // Let's keep commas in display always if possible, or re-add them as user types?
      // Simple approach: Format on blur. Strip on focus?
      // Let's strip on focus to make editing easier (standard for some number inputs),
      // OR keep them and handle cursor... handling cursor with commas is hard.
      // Easiest robust UX: Strip commas on focus (raw number), format on blur.
      setLocalValue(value.toString());
  };

  const handleBlur = () => {
      setIsFocused(false);
      // On blur, re-format
      const num = parseNumber(localValue);
      if (!isNaN(num)) {
          setLocalValue(formatNumber(num));
      } else {
          setLocalValue(formatNumber(value)); // Revert if invalid
      }
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
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
                "w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-right font-mono text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary tabular-nums shadow-sm transition-all",
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
