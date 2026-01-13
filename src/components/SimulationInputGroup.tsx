import React from 'react';
import { CircleHelp } from 'lucide-react';
import { NumberInput } from './ui/NumberInput';
import { Slider } from './ui/Slider';
import { Tooltip } from './ui/Tooltip';
import { cn } from '@/lib/utils';

interface SimulationInputGroupProps {
  label: React.ReactNode;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  helperText?: string;
  inputClassName?: string;
  tooltip?: string;
}

export const SimulationInputGroup: React.FC<SimulationInputGroupProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  helperText,
  inputClassName,
  tooltip,
}) => {
  return (
    <div className="group">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium text-zinc-300 flex items-center gap-2">
          {label}
          {tooltip && (
            <Tooltip content={tooltip}>
              <CircleHelp className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-help" />
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-2">
          {helperText && (
            <span className="text-xs text-zinc-500 font-mono tabular-nums">
              {helperText}
            </span>
          )}
          <NumberInput
            value={value}
            onChange={onChange}
            prefix={prefix}
            suffix={suffix}
            className={cn("w-24", inputClassName)} // Default to w-24, allow override
          />
        </div>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};
