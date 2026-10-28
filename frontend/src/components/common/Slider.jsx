import React from 'react';

const Slider = ({ label, value, onChange, min, max, step, unit, className = '' }) => {
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-2">
        {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
        <span className="text-sm text-slate-600 font-medium">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
      />
    </div>
  );
};

export default Slider;
