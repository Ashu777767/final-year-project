import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import SectionHeader from '../components/common/SectionHeader';
import StatusBadge from '../components/common/StatusBadge';
import ChartCard from '../components/common/ChartCard';
import { getScenarios } from '../services/api';
import { useLocation } from '../context/LocationContext';

const ScenariosPage = () => {
  const { location } = useLocation();
  const [scenarioData, setScenarioData] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getScenarios(location?.city)
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res) ? res : [];
        setScenarioData(list);
        setSelectedScenario(null);
      })
      .catch((e) => { console.error(e); if (!cancelled) setScenarioData([]); });
    return () => { cancelled = true; };
  }, [location]);

  const comparison = selectedScenario
    ? scenarioData.find((s) => s.scenario === selectedScenario) || null
    : null;
  const baseline = scenarioData.length > 0 ? scenarioData[0] : null;

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <SectionHeader
        title="Scenario Comparison"
        subtitle="Compare different CO₂ capture interventions and their effectiveness"
      />

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Scenario</th>
                  <th className="px-6 py-4 font-medium">Modelled area CO₂ (tonnes/day)</th>
                  <th className="px-6 py-4 font-medium">Reduction (tonnes/day)</th>
                  <th className="px-6 py-4 font-medium">Est. Cost</th>
                  <th className="px-6 py-4 font-medium">Efficiency</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {scenarioData.map((scenario, index) => {
                  const isBaseline = index === 0;
                  const isSelected = selectedScenario === scenario.scenario;
                  return (
                    <tr
                      key={scenario.id || scenario.scenario || index}
                      onClick={() => setSelectedScenario(isBaseline ? null : scenario.scenario)}
                      className={`border-b border-slate-100 transition-colors ${
                        isSelected ? 'bg-primary-50' : isBaseline ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'
                      } ${isBaseline ? '' : 'cursor-pointer'}`}
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">{scenario.scenario}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{Number(scenario.co2).toFixed(2)}</td>
                      <td className={`px-6 py-4 font-medium ${scenario.reduction > 0 ? 'text-green-600' : 'text-slate-500'}`}>
                        {scenario.reduction > 0 ? `-${Number(scenario.reduction).toFixed(2)}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{scenario.cost || '—'}</td>
                      <td className="px-6 py-4 text-slate-600">{scenario.efficiency || '—'}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={scenario.status || (isBaseline ? 'baseline' : 'active')} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {comparison && baseline && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {comparison.scenario} vs Current State
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">Baseline Modelled Area CO₂</p>
                <p className="text-xl font-bold text-slate-900">{Number(baseline.co2).toFixed(2)} <span className="text-sm font-normal">tonnes/day</span></p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">Projected Modelled Area CO₂</p>
                <p className="text-xl font-bold text-green-700">{Number(comparison.co2).toFixed(2)} <span className="text-sm font-normal">tonnes/day</span></p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">Reduction</p>
                <p className="text-xl font-bold text-blue-700">
                  {Number(comparison.reduction).toFixed(2)} <span className="text-sm font-normal">tonnes/day ({comparison.efficiency})</span>
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Estimated Cost</p>
                <p className="text-sm font-medium text-slate-900">{comparison.cost || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Efficiency</p>
                <p className="text-sm font-medium text-slate-900">{comparison.efficiency || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Status</p>
                <StatusBadge status={comparison.status || 'active'} />
              </div>
            </div>
          </div>
        )}

        <ChartCard title="Scenario Impact Comparison">
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={scenarioData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="scenario" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="co2" name="Projected modelled area CO₂ (tonnes/day)" radius={[4, 4, 0, 0]}>
                  {scenarioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#64748b' : '#16a34a'} />
                  ))}
                </Bar>
                <Bar dataKey="reduction" name="Reduction (tonnes/day)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default ScenariosPage;
