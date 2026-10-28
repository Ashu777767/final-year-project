import React from 'react';

const Dropdown = ({ label, value, onChange, options = [], placeholder, className = '' }) => {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
      <select
        value={value || ''}
        onChange={onChange}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt, idx) => {
          const isObject = typeof opt === 'object';
          const optValue = isObject ? opt.value : opt;
          const optLabel = isObject ? opt.label : opt;
          return (
            <option key={idx} value={optValue}>
              {optLabel}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default Dropdown;
