import React from 'react';

const StatusBadge = ({ status, size = 'md' }) => {
  const colors = {
    Critical: 'bg-red-50 text-red-700',
    High: 'bg-orange-50 text-orange-700',
    Medium: 'bg-amber-50 text-amber-700',
    Low: 'bg-green-50 text-green-700',
    'Very High': 'bg-red-50 text-red-700',
    Moderate: 'bg-blue-50 text-blue-700',
    Baseline: 'bg-slate-100 text-slate-600'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-0.5 text-xs'
  };

  const colorClass = colors[status] || colors.Baseline;
  const sizeClass = sizes[size] || sizes.md;

  return (
    <span className={`inline-flex items-center justify-center rounded-full font-medium ${colorClass} ${sizeClass}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
