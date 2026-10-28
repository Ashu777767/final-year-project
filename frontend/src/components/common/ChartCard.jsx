import React from 'react';

const ChartCard = ({ title, subtitle, children, className = '', action }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col ${className}`}>
      <div className="p-5 pb-0 flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-5 pt-4 flex-1">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
