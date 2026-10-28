import React, { useState, useEffect } from 'react';

const EMPTY_FORM = {
  population_est: '',
  population_level: 'Medium',
  area_km2: '',
  vehicles_est: '',
  traffic_level: 'Medium',
  industry_level: 'Medium',
  electricity_kwh: '',
  electricity_level: 'Medium'
};

// Shows the value the user actually typed, grouped for readability, with its unit.
// Falls back to the chosen qualitative level when the numeric field is blank, and
// marks that as a level so a category is never mistaken for a measured quantity.
const formatNumberOrLevel = (rawValue, fallback, unit) => {
  if (rawValue === '' || rawValue === null || rawValue === undefined) {
    return fallback ? `${fallback} (level)` : 'Not specified';
  }
  const num = Number(rawValue);
  if (!Number.isFinite(num)) {
    return fallback ? `${fallback} (level)` : 'Not specified';
  }
  return `${num.toLocaleString('en-IN')}${unit ? ` ${unit}` : ''}`;
};

/** Turns a raw numeric input into a positive number, or null when blank/invalid. */
const toNumberOrNull = (rawValue) => {
  if (rawValue === '' || rawValue === null || rawValue === undefined) return null;
  const num = Number(rawValue);
  return Number.isFinite(num) && num > 0 ? num : null;
};

const SurveyModal = ({ isOpen, onClose, onSubmit, locationData, submitting, error }) => {
  // NOTE: hooks must run unconditionally and before any early return,
  // otherwise React throws "Rendered fewer hooks than expected" on close.
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  // Reset the wizard whenever a new area profile is opened.
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData(EMPTY_FORM);
    }
  }, [isOpen, locationData?.city]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // The model consumes annual kWh per capita, so show the user the value that will
  // actually be used. Displayed for transparency only - the submitted numbers are the
  // ones the user typed.
  const population = toNumberOrNull(formData.population_est);
  const electricityPerDay = toNumberOrNull(formData.electricity_kwh);
  const derivedElectricityPerCapita =
    population && electricityPerDay ? (electricityPerDay * 365) / population : null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800">Complete Area Profile</h2>
          <p className="text-slate-500 mt-1">We need a few details about {locationData?.city} to build its CO₂ Digital Twin.</p>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`h-2 flex-1 rounded-full ${s <= step ? 'bg-primary-600' : 'bg-slate-100'}`} />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">1. Population & Area</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Population (people)</label>
                  <input type="number" min="0" placeholder="e.g. 500000" className="w-full border rounded-lg p-3" value={formData.population_est} onChange={e => setFormData({...formData, population_est: e.target.value})} />
                  <p className="text-xs text-slate-500 mt-1">Total resident population of this area. If unknown, leave blank.</p>
                </div>

                {!formData.population_est && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Population Level (Fallback)</label>
                    <select className="w-full border rounded-lg p-3" value={formData.population_level} onChange={e => setFormData({...formData, population_level: e.target.value})}>
                      <option>Low</option><option>Medium</option><option>High</option><option>Very High</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Used only while the population above is blank.</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Area Size (km²)</label>
                  <input type="number" min="0" placeholder="e.g. 150" className="w-full border rounded-lg p-3" value={formData.area_km2} onChange={e => setFormData({...formData, area_km2: e.target.value})} />
                  <p className="text-xs text-slate-500 mt-1">Land area of the same boundaries as the population above, in square kilometres.</p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">2. Transport & Traffic</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Approximate Number of Vehicles (vehicles)</label>
                  <input type="number" min="0" placeholder="e.g. 200000" className="w-full border rounded-lg p-3" value={formData.vehicles_est} onChange={e => setFormData({...formData, vehicles_est: e.target.value})} />
                  <p className="text-xs text-slate-500 mt-1">Total registered vehicles in this area, not vehicles per household.</p>
                </div>

                {!formData.vehicles_est && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Traffic Level (Fallback)</label>
                    <select className="w-full border rounded-lg p-3" value={formData.traffic_level} onChange={e => setFormData({...formData, traffic_level: e.target.value})}>
                      <option>Low</option><option>Medium</option><option>High</option><option>Very High</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Used only while the vehicle count above is blank.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">3. Industry & Electricity</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Industrial Activity Level</label>
                  <select className="w-full border rounded-lg p-3" value={formData.industry_level} onChange={e => setFormData({...formData, industry_level: e.target.value})}>
                    <option>Low</option><option>Medium</option><option>High</option><option>Very High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Total Electricity Consumption (kWh/day)</label>
                  <input type="number" min="0" placeholder="e.g. 1000000" className="w-full border rounded-lg p-3" value={formData.electricity_kwh} onChange={e => setFormData({...formData, electricity_kwh: e.target.value})} />
                  <p className="text-xs text-slate-500 mt-1">
                    Whole-area consumption per day, all sectors - not per person and not yearly.
                  </p>
                  {derivedElectricityPerCapita !== null && (
                    <p className="text-xs text-slate-500 mt-1">
                      Works out to {Math.round(derivedElectricityPerCapita).toLocaleString('en-IN')} kWh per person per year
                      with the population you entered.
                    </p>
                  )}
                </div>

                {!formData.electricity_kwh && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Electricity Usage (Fallback)</label>
                    <select className="w-full border rounded-lg p-3" value={formData.electricity_level} onChange={e => setFormData({...formData, electricity_level: e.target.value})}>
                      <option>Low</option><option>Medium</option><option>High</option><option>Very High</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Used only while the kWh/day figure above is blank.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">4. Review & Generate</h3>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Location</span>
                  <span className="font-medium">{locationData?.city}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Weather (API)</span>
                  <span className="font-medium text-primary-600">Retrieved ✓</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Population</span>
                  <span className="font-medium">{formatNumberOrLevel(formData.population_est, formData.population_level, 'people')}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Area Size</span>
                  <span className="font-medium">{formatNumberOrLevel(formData.area_km2, null, 'km²')}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Vehicles</span>
                  <span className="font-medium">{formatNumberOrLevel(formData.vehicles_est, formData.traffic_level, 'vehicles')}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Industrial Activity</span>
                  <span className="font-medium">{formData.industry_level} (level)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Electricity</span>
                  <span className="font-medium">{formatNumberOrLevel(formData.electricity_kwh, formData.electricity_level, 'kWh/day')}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                These are the values you entered; nothing above is substituted. The model expects a few derived
                quantities, so the total electricity is spread over the population you gave as an annual kWh-per-person
                figure, and vehicle density is derived from the vehicles and area you gave.
              </p>

              {error && (
                <p role="alert" className="text-sm bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                  {error}
                </p>
              )}

              <p className="text-sm text-slate-500 bg-blue-50 p-3 rounded-lg border border-blue-100 text-blue-800">
                This area profile will be saved persistently for future predictions.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-between bg-slate-50 rounded-b-2xl">
          <button 
            type="button" 
            onClick={step === 1 ? onClose : prevStep} 
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          
          {step < 4 ? (
            <button 
              type="button" 
              onClick={nextStep} 
              className="px-6 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
            >
              Next Step
            </button>
          ) : (
            <button 
              type="button" 
              onClick={handleSubmit} 
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/30 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {submitting && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {submitting ? 'Generating…' : 'Generate Digital Twin'}
            </button>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default SurveyModal;
