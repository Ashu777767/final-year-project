import React from 'react';
import {
  Building2, MapPin, Users, Home, Ruler, Car, Zap, Sun, Trees, Fuel,
  Calculator, RefreshCw, AlertCircle, CheckCircle2, Compass, Info, Trash2, LandPlot,
} from 'lucide-react';
import SectionHeader from '../components/common/SectionHeader';
import Button from '../components/common/Button';
import KpiCard from '../components/common/KpiCard';
import EmptyState from '../components/common/EmptyState';
import useSocietyPlanner from '../hooks/useSocietyPlanner';
import { useLocation } from '../context/LocationContext';
import { CO2_UNIT } from '../utils/co2Scope';

const AREA_UNITS = [
  { value: 'acres', label: 'acres' },
  { value: 'hectares', label: 'hectares' },
  { value: 'km2', label: 'km²' },
];

const num = (v) => (v === '' || v === null || v === undefined ? '—' : Number(v).toLocaleString('en-IN'));

const fmt = (v, digits = 2) => {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(digits) : '—';
};

const SocietyPlannerPage = () => {
  const p = useSocietyPlanner();
  const { location } = useLocation();

  const field = (label, key, opts = {}) => {
    const { type = 'number', placeholder, hint, unit, error, key: reactKey } = opts;
    const err = error || p.errors[key];
    return (
      <div key={reactKey}>
        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor={`soc-${key}`}>
          {label}{unit ? <span className="text-slate-400 font-normal"> ({unit})</span> : null}
        </label>
        <input
          id={`soc-${key}`}
          name={key}
          type={type}
          min={type === 'number' ? '0' : undefined}
          step="any"
          placeholder={placeholder}
          value={p.form[key]}
          onChange={(e) => p.updateField(key, e.target.value)}
          className={`w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 ${
            err ? 'border-red-300 focus:ring-red-400' : 'border-slate-300 focus:ring-primary-500'
          }`}
        />
        {hint && !err && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
        {err && <p className="text-xs text-red-600 mt-1">{err}</p>}
      </div>
    );
  };

  const select = (label, key, options, hint) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor={`soc-${key}`}>{label}</label>
      <select
        id={`soc-${key}`}
        name={key}
        value={p.form[key]}
        onChange={(e) => p.updateField(key, e.target.value)}
        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );

  const assumptionFields = [
    ['kmPerVehiclePerDay', 'Average daily distance per vehicle', 'km/day'],
    ['petrolKmPerLitre', 'Petrol vehicle mileage', 'km/litre'],
    ['dieselKmPerLitre', 'Diesel vehicle mileage', 'km/litre'],
    ['electricKwhPerKm', 'Electric vehicle consumption', 'kWh/km'],
  ];

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <SectionHeader
        title="Plan a New Society"
        subtitle="Estimate the operational CO₂ of a proposed residential society before it is built"
      />

      {/* Clearly separate this plan from the app's active area. */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5">
        <p className="text-sm text-amber-900 flex items-start gap-2">
          <Info size={16} className="mt-0.5 flex-shrink-0" />
          <span>
            <span className="font-medium">This is a planning tool.</span> The society you design here is
            <span className="font-medium"> not</span> the active area of the dashboard and does not change it.
            {location?.city
              ? <> Your active area remains <span className="font-medium">{location.city}</span>.</>
              : <> No area is currently active.</>}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ============================ A. DESIGN ============================ */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Building2 className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-slate-900">A. Design your society</h3>
            </div>

            <div className="space-y-6">
              {/* identity + location */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <MapPin size={14} /> Society and location
                </h4>
                {field('Society name', 'societyName', { type: 'text', placeholder: 'e.g. Green Meadows', error: p.errors.societyName })}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="soc-locationQuery">
                    City, locality or PIN code
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="soc-locationQuery"
                      name="locationQuery"
                      type="text"
                      placeholder="e.g. Whitefield, Bengaluru or 560066"
                      value={p.form.locationQuery}
                      onChange={(e) => p.updateField('locationQuery', e.target.value)}
                      className="flex-1 border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <Button
                      variant="outline"
                      icon={Compass}
                      onClick={p.resolveCoordinates}
                      loading={p.isResolving}
                      type="button"
                    >
                      Locate
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Optional when you type coordinates below. A location that cannot be resolved is never
                    replaced with 0,0.
                  </p>
                  {p.resolveMessage && (
                    <p className="text-xs text-green-700 mt-1 flex items-center gap-1">
                      <CheckCircle2 size={12} /> {p.resolveMessage}
                    </p>
                  )}
                  {p.resolveError && (
                    <p className="text-xs text-amber-700 mt-1 flex items-start gap-1">
                      <AlertCircle size={12} className="mt-0.5 flex-shrink-0" /> {p.resolveError}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {field('Latitude', 'latitude', { placeholder: 'e.g. 12.9698', hint: 'India: 6 to 38' })}
                  {field('Longitude', 'longitude', { placeholder: 'e.g. 77.7500', hint: 'India: 68 to 98' })}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {field('City (optional)', 'city', { type: 'text', placeholder: 'e.g. Bengaluru' })}
                  {field('State (optional)', 'state', { type: 'text', placeholder: 'e.g. Karnataka' })}
                </div>
                {p.errors.location && (
                  <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
                    {p.errors.location}
                  </p>
                )}
              </div>

              {/* population + area */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <Users size={14} /> People and land
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {field('Planned resident population', 'population', { unit: 'people', placeholder: 'e.g. 2400' })}
                  {field('Houses / flats', 'households', { unit: 'units', placeholder: 'e.g. 600' })}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {field('Total land area', 'area', { placeholder: 'e.g. 12.5' })}
                  {select('Area unit', 'areaUnit', AREA_UNITS)}
                </div>
                {field('Green-cover area', 'greenCoverArea', {
                  unit: p.form.areaUnit, placeholder: 'e.g. 2.5',
                  hint: `Using the same unit as the total area (${p.form.areaUnit}).`,
                })}
              </div>

              {/* transport */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <Car size={14} /> Vehicles
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {field('Petrol', 'petrolVehicles', { unit: 'vehicles' })}
                  {field('Diesel', 'dieselVehicles', { unit: 'vehicles' })}
                  {field('Electric', 'electricVehicles', { unit: 'vehicles' })}
                </div>
              </div>

              {/* electricity */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <Zap size={14} /> Electricity and solar
                </h4>
                {field('Daily electricity consumption (society)', 'electricityKwhPerDay', {
                  unit: 'kWh/day', placeholder: 'e.g. 18000',
                  hint: 'Residential/common consumption for the whole society, per day.',
                })}
                {field('Daily common-facility / industrial electricity', 'commonFacilityElectricityKwhPerDay', {
                  unit: 'kWh/day', placeholder: 'e.g. 3000',
                  hint: 'Optional — pumps, lifts, clubhouse, STP, shops.',
                })}
                {field('Rooftop solar generation', 'solarGenerationKwhPerDay', {
                  unit: 'kWh/day', placeholder: 'e.g. 2000',
                  hint: 'Optional. Offsets the society’s own grid draw only — surplus is not credited.',
                })}
              </div>

              {/* green cover */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <Trees size={14} /> Trees and green cover
                </h4>
                {field('Number of trees', 'treeCount', { unit: 'trees', placeholder: 'e.g. 350' })}
                <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                  Trees are recorded as a planning input. This project ships no tree-sequestration
                  coefficient, so no carbon reduction is claimed for them unless you supply one below.
                </p>
                <details>
                  <summary className="text-sm font-medium text-primary-700 cursor-pointer">
                    Add a tree sequestration factor (optional, requires a source)
                  </summary>
                  <div className="grid grid-cols-1 gap-3 mt-3">
                    {field('Sequestration factor', 'treeSequestrationKgPerTreePerYear', {
                      unit: 'kg CO₂/tree/year', placeholder: 'e.g. 20',
                      hint: 'Only applied if you also cite its source.',
                    })}
                    {field('Source of that factor', 'treeSequestrationSource', {
                      type: 'text', placeholder: 'e.g. species-specific study, with year',
                    })}
                  </div>
                </details>
              </div>

              {/* additional fuel */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <Fuel size={14} /> Additional fuel (optional)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {field('Fuel consumption', 'additionalFuelLitresPerDay', {
                    unit: 'litres/day', placeholder: 'e.g. 50',
                    hint: 'Generator sets or other direct fuel use.',
                  })}
                  {select('Fuel type', 'additionalFuelType', [
                    { value: 'diesel', label: 'Diesel' },
                    { value: 'petrol', label: 'Petrol' },
                  ])}
                </div>
              </div>

              {/* assumptions */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calculator size={14} /> Assumptions used in the calculation
                </h4>
                <p className="text-xs text-slate-500">
                  These are pre-filled typical values, not measurements. They are labelled as assumptions
                  in the results and you can change any of them.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {assumptionFields.map(([key, label, unit]) => field(label, key, { unit, error: p.errors[key], key }))}
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(p.form.includeModelEstimate)}
                    onChange={(e) => p.updateField('includeModelEstimate', e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  Also request the existing ML model estimate (experimental comparison)
                </label>
                <p className="text-xs text-slate-500">
                  The trained model works at city scale, so its output is shown separately and is never
                  used as the society's emissions figure.
                </p>
              </div>

              {p.serverError && (
                <p role="alert" className="text-sm bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                  {p.serverError}
                </p>
              )}

              <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
                <Button variant="primary" icon={Calculator} onClick={p.runPlan} loading={p.isPlanning}>
                  Calculate CO₂ estimate
                </Button>
                <Button variant="outline" icon={Trash2} onClick={p.reset} disabled={p.isPlanning}>
                  Clear form
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ======================== B. ESTIMATE ======================== */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-1">
              <LandPlot className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-slate-900">B. CO₂ estimate and planning</h3>
            </div>
            <p className="text-sm text-slate-500 mb-5">
              <span className="font-medium text-slate-700">Preliminary Society CO₂ Estimate</span> — an
              activity-based operational estimate built from your inputs and published emission factors.
              It is not a measured inventory.
            </p>

            {!p.plan && (
              <EmptyState
                icon={Building2}
                title="No estimate yet"
                description="Fill in the society design on the left and press “Calculate CO₂ estimate”. Missing required inputs will be listed rather than guessed."
              />
            )}

            {p.plan && (
              <div className="space-y-6">
                {/* headline */}
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                    <h4 className="font-semibold text-slate-900">{p.plan.societyName}</h4>
                    <span className="text-xs text-slate-500">
                      {p.plan.locationLabel} · {fmt(p.plan.latitude, 4)}, {fmt(p.plan.longitude, 4)}
                      {p.plan.resolution ? ` · via ${p.plan.resolution}` : ''}
                    </span>
                  </div>

                  <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 mb-4">
                    <p className="text-xs text-slate-600 mb-1">Preliminary Society CO₂ Estimate (operational)</p>
                    <p className="text-3xl font-bold text-primary-800">
                      {fmt(p.plan.grossOperationalTonnesPerDay, 2)}
                      <span className="text-base font-normal text-slate-600 ml-1">{CO2_UNIT}</span>
                    </p>
                    <p className="text-sm text-slate-600 mt-2">
                      {num(p.plan.grossOperationalTonnesPerYear)} tonnes CO₂/year
                      {p.plan.perResidentKgPerDay != null && (
                        <> · {fmt(p.plan.perResidentKgPerDay, 2)} kg per resident/day</>
                      )}
                      {p.plan.perHouseholdKgPerDay != null && (
                        <> · {fmt(p.plan.perHouseholdKgPerDay, 2)} kg per household/day</>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">{p.plan.scopeNote}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <KpiCard
                      label="Electricity contribution"
                      value={fmt(p.plan.electricity.tonnesPerDay, 2)}
                      unit={`${CO2_UNIT} (${fmt(p.plan.electricity.sharePercent, 1)}%)`}
                      icon={Zap}
                      iconBg="bg-amber-50"
                    />
                    <KpiCard
                      label="Transport contribution"
                      value={fmt(p.plan.transport.tonnesPerDay, 2)}
                      unit={`${CO2_UNIT} (${fmt(p.plan.transport.sharePercent, 1)}%)`}
                      icon={Car}
                      iconBg="bg-blue-50"
                    />
                  </div>
                </div>

                {/* solar */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-amber-900 flex items-center gap-1.5 mb-2">
                    <Sun size={14} /> Rooftop solar
                  </p>
                  <div className="text-sm text-amber-900 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>Generation: <span className="font-medium">{num(p.plan.solar.generationKwhPerDay)} kWh/day</span></div>
                    <div>Displaces: <span className="font-medium">{num(p.plan.solar.displacedGridKwhPerDay)} kWh/day</span></div>
                    <div>Avoided: <span className="font-medium">{fmt(p.plan.solar.avoidedTonnesPerDay, 3)} {CO2_UNIT}</span></div>
                  </div>
                  {p.plan.solar.excessKwhPerDay > 0 && (
                    <p className="text-xs text-amber-800 mt-2">
                      {num(p.plan.solar.excessKwhPerDay)} kWh/day exceeds the society's own consumption and is
                      reported but <span className="font-medium">not</span> credited as a reduction.
                    </p>
                  )}
                  <p className="text-xs text-amber-800 mt-2">{p.plan.solar.method}</p>
                </div>

                {/* green cover */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-900 flex items-center gap-1.5 mb-2">
                    <Trees size={14} /> Trees and green cover
                  </p>
                  <div className="text-sm text-green-900 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>Trees: <span className="font-medium">{num(p.plan.greenCover.treeCount)}</span></div>
                    <div>Green cover: <span className="font-medium">
                      {p.plan.greenCover.greenCoverKm2 != null ? `${fmt(p.plan.greenCover.greenCoverKm2, 4)} km²` : '—'}
                    </span></div>
                    <div>Of site: <span className="font-medium">
                      {p.plan.greenCover.greenCoverPercent != null ? `${fmt(p.plan.greenCover.greenCoverPercent, 1)}%` : '—'}
                    </span></div>
                    <div>Trees/acre: <span className="font-medium">{fmt(p.plan.greenCover.treesPerAcre, 1)}</span></div>
                  </div>
                  <p className={`text-xs mt-2 ${p.plan.greenCover.sequestrationApplied ? 'text-green-800' : 'text-amber-800'}`}>
                    {p.plan.greenCover.sequestrationApplied
                      ? `Sequestration applied at ${p.plan.greenCover.appliedKgPerTreePerYear} kg CO₂/tree/year — ${p.plan.greenCover.source}. Emissions reported above are GROSS; the net figure is shown below.`
                      : p.plan.greenCover.note}
                  </p>
                  {p.plan.netAfterUserOffsetTonnesPerDay != null && (
                    <p className="text-sm text-green-900 mt-2">
                      Net after your offset: <span className="font-semibold">
                        {fmt(p.plan.netAfterUserOffsetTonnesPerDay, 2)} {CO2_UNIT}
                      </span> ({num(p.plan.netAfterUserOffsetTonnesPerYear)} tonnes/year)
                    </p>
                  )}
                </div>

                {/* source-wise breakdown */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 text-sm">Source-wise breakdown</h4>
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2 font-medium">Source</th>
                          <th className="px-3 py-2 font-medium">Activity</th>
                          <th className="px-3 py-2 font-medium">Factor</th>
                          <th className="px-3 py-2 font-medium text-right">t CO₂/day</th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.plan.lines.map((l) => (
                          <tr key={l.source} className="border-b border-slate-100 last:border-0">
                            <td className="px-3 py-2 font-medium text-slate-800">{l.source}</td>
                            <td className="px-3 py-2 text-slate-600">{l.activity}</td>
                            <td className="px-3 py-2 text-slate-600">{l.factor}</td>
                            <td className="px-3 py-2 text-right font-medium text-slate-900">{fmt(l.tonnesPerDay, 3)}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50">
                          <td className="px-3 py-2 font-semibold text-slate-900" colSpan={3}>Gross operational total</td>
                          <td className="px-3 py-2 text-right font-bold text-slate-900">
                            {fmt(p.plan.grossOperationalTonnesPerDay, 3)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* assumptions + factors */}
                <details open>
                  <summary className="text-sm font-medium text-slate-700 cursor-pointer">
                    How this was calculated — factors, assumptions and limitations
                  </summary>
                  <div className="mt-3 space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Emission factors used</p>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {p.plan.factors.map((f) => (
                          <li key={f.factor}>
                            <span className="font-medium text-slate-800">{f.factor}:</span> {f.value} — {f.source}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Assumptions applied</p>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {p.plan.assumptions.map((a, i) => (
                          <li key={`${a.field}-${i}`}>
                            <span className="font-medium text-slate-800">{a.field}:</span> {a.value}
                            {a.userEditable ? ' (editable above)' : ''} — {a.source}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Known limitations</p>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {p.plan.limitations.map((a, i) => (
                          <li key={`lim-${i}`}>
                            <span className="font-medium text-slate-800">{a.field}:</span> {a.value} — {a.source}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </details>

                {/* optional experimental model estimate */}
                {p.plan.modelEstimate && (
                  <div className="border border-slate-300 border-dashed rounded-lg p-4 bg-slate-50">
                    <p className="text-sm font-semibold text-slate-700 mb-1">
                      Experimental comparison — existing ML model
                    </p>
                    {p.plan.modelEstimate.status === 'OK' ? (
                      <p className="text-sm text-slate-700">
                        Modelled CO₂ for one sampled location: <span className="font-medium">
                          {fmt(p.plan.modelEstimate.predictedTonnesPerDay, 4)} {CO2_UNIT}
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm text-amber-700">Model estimate {p.plan.modelEstimate.status}.</p>
                    )}
                    <p className="text-xs text-slate-600 mt-2">{p.plan.modelEstimate.warning}</p>
                    <p className="text-xs text-slate-500 mt-1">{p.plan.modelEstimate.scope}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ===================== SCENARIOS ===================== */}
          {p.plan && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-slate-900">Planning scenarios</h3>
              </div>
              <p className="text-sm text-slate-500 mb-5">
                Each scenario is recalculated with the same documented method as the design above — never by
                scaling the result. Set the adjustments and update.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="sc-elec">Electricity reduction (%)</label>
                  <input id="sc-elec" type="number" min="0" max="100" value={p.scenarioInputs.electricityReductionPercent}
                    onChange={(e) => p.setScenarioInput('electricityReductionPercent', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="sc-solar">Solar multiplier (×)</label>
                  <input id="sc-solar" type="number" min="1" step="0.1" value={p.scenarioInputs.solarMultiplier}
                    onChange={(e) => p.setScenarioInput('solarMultiplier', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="sc-ev">Switch to EV (%)</label>
                  <input id="sc-ev" type="number" min="0" max="100" value={p.scenarioInputs.evShiftPercent}
                    onChange={(e) => p.setScenarioInput('evShiftPercent', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="sc-travel">Travel reduction (%)</label>
                  <input id="sc-travel" type="number" min="0" max="100" value={p.scenarioInputs.travelReductionPercent}
                    onChange={(e) => p.setScenarioInput('travelReductionPercent', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="sc-trees">Additional trees</label>
                  <input id="sc-trees" type="number" min="0" value={p.scenarioInputs.additionalTrees}
                    onChange={(e) => p.setScenarioInput('additionalTrees', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm" />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" icon={RefreshCw} onClick={p.runScenarios} loading={p.isScenariosLoading} className="w-full justify-center">
                    Update scenarios
                  </Button>
                </div>
              </div>

              {p.scenarios.length === 0 && !p.isScenariosLoading && (
                <p className="text-sm text-slate-500">No scenarios calculated yet.</p>
              )}

              {p.scenarios.length > 0 && (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2 font-medium">Scenario</th>
                        <th className="px-3 py-2 font-medium text-right">t CO₂/day</th>
                        <th className="px-3 py-2 font-medium text-right">Change</th>
                        <th className="px-3 py-2 font-medium text-right">Change %</th>
                        <th className="px-3 py-2 font-medium text-right">Electricity</th>
                        <th className="px-3 py-2 font-medium text-right">Transport</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.scenarios.map((s, i) => (
                        <React.Fragment key={`${s.scenario}-${i}`}>
                          <tr className={`border-b border-slate-100 ${i === 0 ? 'bg-slate-50' : ''}`}>
                            <td className="px-3 py-2">
                              <div className="font-medium text-slate-800">{s.scenario}</div>
                              <div className="text-xs text-slate-500">{s.description}</div>
                            </td>
                            <td className="px-3 py-2 text-right font-medium text-slate-900">{fmt(s.grossOperationalTonnesPerDay, 2)}</td>
                            <td className={`px-3 py-2 text-right font-medium ${
                              s.changeTonnesPerDay < 0 ? 'text-green-600' : 'text-slate-500'
                            }`}>
                              {s.changeTonnesPerDay === 0 ? '—' : `${s.changeTonnesPerDay > 0 ? '+' : ''}${fmt(s.changeTonnesPerDay, 2)}`}
                            </td>
                            <td className={`px-3 py-2 text-right font-medium ${
                              s.changePercent < 0 ? 'text-green-600' : 'text-slate-500'
                            }`}>
                              {s.changePercent == null || s.changePercent === 0 ? '—' : `${s.changePercent > 0 ? '+' : ''}${fmt(s.changePercent, 1)}%`}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-600">{fmt(s.electricityTonnesPerDay, 2)}</td>
                            <td className="px-3 py-2 text-right text-slate-600">{fmt(s.transportTonnesPerDay, 2)}</td>
                          </tr>
                          {s.treeNote && (
                            <tr className="border-b border-slate-100">
                              <td colSpan={6} className="px-3 py-2 text-xs text-amber-800 bg-amber-50">{s.treeNote}</td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocietyPlannerPage;
