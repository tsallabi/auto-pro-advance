import React, { useState, useEffect, useRef } from 'react';

interface DualRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
}

export const DualRangeSlider: React.FC<DualRangeSliderProps> = ({ min, max, value, onChange, step = 1 }) => {
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);

  useEffect(() => {
    setMinVal(value[0]);
    setMaxVal(value[1]);
  }, [value]);

  const getPercent = (val: number) => {
    let p = Math.round(((val - min) / (max - min)) * 100);
    if (p < 0) p = 0;
    if (p > 100) p = 100;
    return p;
  };

  const minPercent = getPercent(minVal);
  const maxPercent = getPercent(maxVal);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxVal - step);
    setMinVal(val);
    onChange([val, maxVal]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minVal + step);
    setMaxVal(val);
    onChange([minVal, val]);
  };

  return (
    <div className="relative w-full h-10 flex items-center justify-center">
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          pointer-events: auto;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ffffff;
          border: 4px solid #0f172a;
          cursor: grab;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
        }
        input[type="range"]::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.1);
        }
        input[type="range"]::-moz-range-thumb {
          pointer-events: auto;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ffffff;
          border: 4px solid #0f172a;
          cursor: grab;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
        }
        input[type="range"]::-moz-range-thumb:active {
          cursor: grabbing;
          transform: scale(1.1);
        }
      `}</style>
      
      {/* Background Track */}
       <div className="absolute w-full h-1.5 bg-slate-200 rounded-full z-0"></div>
       
       {/* Active Track */}
       <div 
         className="absolute h-1.5 bg-slate-900 rounded-full z-10"
         style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
       ></div>
       
       {/* Inputs */}
       <input
         type="range"
         min={min}
         max={max}
         step={step}
         value={minVal}
         onChange={handleMinChange}
         title="Minimum Value"
         aria-label="Minimum Value Slider"
         className="absolute w-full appearance-none bg-transparent pointer-events-none z-20 h-0"
       />

       <input
         type="range"
         min={min}
         max={max}
         step={step}
         value={maxVal}
         onChange={handleMaxChange}
         title="Maximum Value"
         aria-label="Maximum Value Slider"
         className="absolute w-full appearance-none bg-transparent pointer-events-none z-30 h-0"
       />
    </div>
  );
};
