import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const KpiCard = ({ label, value, unit, trend, icon: Icon, iconBg = 'bg-primary-50' }) => {
  const isPositive = trend > 0;
  const isNegative = trend < 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${isNegative ? 'text-green-600' : isPositive ? 'text-red-600' : 'text-slate-500'}`}>
            {isNegative ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-slate-900">{value}</span>
          {unit && <span className="text-sm text-slate-500">{unit}</span>}
        </div>
        <p className="text-sm text-slate-500 mt-1">{label}</p>
      </div>
    </div>
  );
};

export default KpiCard;
