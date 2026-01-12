import React, { ChangeEvent } from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  className,
}) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(parseFloat(e.target.value));
    };

    // Calculate progress percentage for background gradient
    const progress = ((value - min) / (max - min)) * 100;

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={handleChange}
      className={cn("w-full accent-primary cursor-pointer", className)}
      style={{
          background: `linear-gradient(to right, #5048e5 ${progress}%, #3f3f46 ${progress}%)`
      }}
    />
  );
};
