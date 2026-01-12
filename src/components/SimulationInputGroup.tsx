import React from 'react';
import { NumberInput } from './ui/NumberInput';
import { Slider } from './ui/Slider';

interface SimulationInputGroupProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  helperText?: string;
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
}) => {
  return (
    <div className="group">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-zinc-300">{label}</label>
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
            className="w-28" // Fixed width for consistency
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
