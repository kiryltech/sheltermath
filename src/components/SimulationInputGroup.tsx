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
    <div className="group space-y-3">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-200 transition-colors">
                    {label}
                </span>
                {tooltip && (
                    <Tooltip content={tooltip}>
                        <CircleHelp className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-help" />
                    </Tooltip>
                )}
            </div>
             {helperText && (
                <p className="text-[10px] text-zinc-500 font-mono tracking-tight">
                {helperText}
                </p>
            )}
        </div>

        <NumberInput
            value={value}
            onChange={onChange}
            prefix={prefix}
            suffix={suffix}
            className={cn("w-24 shrink-0", inputClassName)}
        />
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
