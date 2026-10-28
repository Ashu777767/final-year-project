import React from 'react';
import { Brain } from 'lucide-react';
import Button from '../common/Button';

const PredictionPlaceholder = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-dashed border-slate-300 p-8 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
        <Brain className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">CO₂ Prediction Model</h3>
      <p className="text-slate-600 font-medium mb-3">ML-based prediction coming soon</p>
      <p className="text-slate-500 text-sm max-w-2xl mb-6">
        Our independently trained machine learning model will provide CO₂ level predictions based on traffic patterns, weather data, and historical emissions. This feature will be integrated with the Spring Boot backend.
      </p>
      <Button variant="outline" disabled className="opacity-70 cursor-not-allowed">
        Coming Soon
      </Button>
    </div>
  );
};

export default PredictionPlaceholder;
