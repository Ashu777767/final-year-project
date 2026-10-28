import React, { useState } from 'react';
import { Loader2, MapPin, AlertCircle, Compass } from 'lucide-react';
import Button from '../common/Button';

/**
 * "Help us locate your area" step.
 *
 * Shown when an area name cannot be resolved to coordinates automatically. The user
 * supplies progressively broader information (pincode -> address -> locality/city)
 * or explicit coordinates. Coordinates are never invented, and the response records
 * HOW the location was resolved so the UI can label approximations honestly.
 */
const LocationAssistForm = ({ areaName, onSubmit, onCancel, submitting, error }) => {
  const [form, setForm] = useState({
    pincode: '',
    address: '',
    locality: '',
    city: '',
    state: '',
    landmark: '',
    latitude: '',
    longitude: '',
  });
  const [showManual, setShowManual] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const hasAnyInput = Object.values(form).some((v) => String(v).trim() !== '');

  const submit = (e) => {
    e.preventDefault();
    if (!hasAnyInput) return;
    onSubmit({
      areaName,
      pincode: form.pincode.trim() || undefined,
      address: form.address.trim() || undefined,
      locality: form.locality.trim() || undefined,
      city: form.city.trim() || undefined,
      state: form.state.trim() || undefined,
      landmark: form.landmark.trim() || undefined,
      // Only meaningful when the user actually typed them.
      latitude: form.latitude.trim() === '' ? undefined : Number(form.latitude),
      longitude: form.longitude.trim() === '' ? undefined : Number(form.longitude),
    });
  };

  const field = (label, key, placeholder, type = 'text') => (
    <div className="flex flex-col gap-1">
      <label htmlFor={`assist-${key}`} className="text-sm font-medium text-slate-700">{label}</label>
      <input
        id={`assist-${key}`}
        name={key}
        type={type}
        value={form[key]}
        onChange={set(key)}
        placeholder={placeholder}
        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>
  );

  return (
    <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
          <Compass className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Help us locate your area</h2>
          <p className="text-sm text-slate-600 mt-1">
            We couldn't find the exact location for <span className="font-medium">{areaName}</span> automatically.
            Provide any additional information below and we'll try to resolve it.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field('Pincode', 'pincode', 'e.g. 411038')}
        {field('Locality / Area', 'locality', 'e.g. Kothrud')}
        {field('City', 'city', 'e.g. Pune')}
        {field('State', 'state', 'e.g. Maharashtra')}
        <div className="sm:col-span-2">
          {field('Full Address', 'address', 'Building, street, area, city')}
        </div>
        {field('Landmark (optional)', 'landmark', 'e.g. near City Mall')}
      </div>

      <p className="text-xs text-slate-500 mt-4">
        We try these in order: pincode, then full address, then locality/city. If a broader
        match is used, we will say so clearly — we never guess or invent coordinates.
      </p>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => setShowManual((s) => !s)}
          className="text-sm font-medium text-primary-700 hover:underline inline-flex items-center gap-1.5"
        >
          <MapPin size={14} />
          {showManual ? 'Hide manual coordinates' : 'Enter coordinates manually'}
        </button>

        {showManual && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {field('Latitude', 'latitude', 'e.g. 18.5074', 'number')}
            {field('Longitude', 'longitude', 'e.g. 73.8077', 'number')}
            <p className="text-xs text-slate-500 sm:col-span-2">
              Valid range for India: latitude 6–38, longitude 68–98. These will be labelled
              "Location entered manually".
            </p>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}

      <div className="flex flex-wrap gap-3 mt-6">
        <Button type="submit" variant="primary" disabled={!hasAnyInput || submitting}>
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Finding location…
            </span>
          ) : 'Find Location'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default LocationAssistForm;
