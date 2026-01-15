import React, { ChangeEvent } from 'react';
import { cn } from '@/lib/utils';

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

  // Sync local value when prop changes externally, but only if not focused
  React.useEffect(() => {
    if (!isFocused) {
        setLocalValue(formatNumber(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    if (/^[\d,]*\.?[\d]*$/.test(rawValue)) {
        setLocalValue(rawValue);

        const numValue = parseNumber(rawValue);
        if (!isNaN(numValue)) {
            onChange(numValue);
        }
    }
  };

  const handleFocus = () => {
      setIsFocused(true);
      setLocalValue(value.toString());
  };

  const handleBlur = () => {
      setIsFocused(false);
      const num = parseNumber(localValue);
      if (!isNaN(num)) {
          setLocalValue(formatNumber(num));
      } else {
          setLocalValue(formatNumber(value));
      }
  };

  return (
    <div className={cn("relative group", className)}>
        {prefix && (
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-medium group-focus-within:text-zinc-300 transition-colors">
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
                "w-full bg-zinc-900/50 border border-zinc-700/50 rounded-lg px-2 py-1.5 text-right font-mono text-sm text-zinc-100",
                "focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:bg-zinc-900",
                "hover:border-zinc-600 transition-all duration-200 shadow-sm",
                prefix && "pl-6", // slightly more padding
                suffix && "pr-7"
            )}
        />
         {suffix && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-medium group-focus-within:text-zinc-300 transition-colors">
                {suffix}
            </span>
        )}
    </div>
  );
};
