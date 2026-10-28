import React from 'react';

const SimulationResultCard = ({ result }) => {
  if (!result) return null;

  const { before, after, reduction, reductionPercent, area, intervention, sampleDataNotice } = result;

  // The API returns kg/day; show tonnes/day as the headline so every CO2 figure in
  // the app uses the same canonical unit, with kg/day alongside for precision.
  const toTonnes = (kg) => (Number(kg) / 1000).toFixed(2);
  const toKg = (kg) => Number(kg).toLocaleString('en-IN');

  const beforePct = before + after > 0 ? (before / (before + after)) * 100 : 50;
  const afterPct = before + after > 0 ? (after / (before + after)) * 100 : 50;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
      {(area || intervention) && (
        <div className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          {area && <span className="font-medium text-slate-900">{area}</span>}
          {area && intervention && <span className="text-slate-400">·</span>}
          {intervention && <span className="text-slate-600">{intervention}</span>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-red-50 rounded-lg p-4 text-center border border-red-100">
          <p className="text-sm text-slate-500 mb-1">Baseline Modelled Area CO₂</p>
          <p className="text-2xl font-bold text-red-700">
            {toTonnes(before)} <span className="text-sm font-normal">tonnes/day</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">{toKg(before)} kg/day</p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">Intervention</p>
          <p className="text-sm font-semibold text-slate-800 leading-snug">
            {intervention || 'Not specified'}
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 text-center border border-green-100">
          <p className="text-sm text-slate-500 mb-1">Projected Modelled Area CO₂</p>
          <p className="text-2xl font-bold text-green-700">
            {toTonnes(after)} <span className="text-sm font-normal">tonnes/day</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">{toKg(after)} kg/day</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
          <p className="text-xs text-slate-500 mb-1">Absolute Reduction</p>
          <p className="text-lg font-bold text-blue-700">
            {toTonnes(reduction)} <span className="text-xs font-normal">tonnes/day</span>
          </p>
          <p className="text-xs text-slate-500">{toKg(reduction)} kg/day</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
          <p className="text-xs text-slate-500 mb-1">Reduction %</p>
          <p className="text-lg font-bold text-blue-700">{reductionPercent}%</p>
          <p className="text-xs text-slate-500">of the modelled baseline</p>
        </div>
      </div>

      <div className="h-4 w-full flex rounded-full overflow-hidden mb-4 bg-slate-100">
        <div className="h-full bg-red-400" style={{ width: `${beforePct}%` }} />
        <div className="h-full bg-green-400" style={{ width: `${afterPct}%` }} />
      </div>

      <p className="text-xs text-slate-500">
        Baseline and projected values use the same modelled scope, so the reduction is
        directly comparable.
      </p>

      {sampleDataNotice && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
          <p className="text-sm text-amber-700 text-center">{sampleDataNotice}</p>
        </div>
      )}
    </div>
  );
};

export default SimulationResultCard;
