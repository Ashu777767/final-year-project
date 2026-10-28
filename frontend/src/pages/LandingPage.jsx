import React from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf,
  ArrowRight,
  BarChart3,
  Map,
  Flame,
  FlaskConical,
  GitCompareArrows,
  BrainCircuit,
  ChevronRight,
  Globe,
  Target,
  Lightbulb,
  Database,
  Cpu,
  Shield,
} from 'lucide-react';

const steps = [
  { icon: Database, label: 'Urban Data', desc: 'Collect emission, traffic & environmental data' },
  { icon: Cpu, label: 'CO₂ Modeling', desc: 'Process and model emission patterns' },
  { icon: Globe, label: 'Digital Twin', desc: 'Build virtual urban representation' },
  { icon: Flame, label: 'Hotspot Detection', desc: 'Identify high-emission zones' },
  { icon: FlaskConical, label: 'Capture Simulation', desc: 'Simulate intervention strategies' },
  { icon: Shield, label: 'Decision Support', desc: 'Generate actionable recommendations' },
];

const capabilities = [
  { icon: Map, title: 'Digital Twin Visualization', desc: 'Interactive map-based virtual representation of urban CO₂ emissions with real-time layer controls.' },
  { icon: BarChart3, title: 'CO₂ Analytics', desc: 'Comprehensive emission trend analysis, area comparisons, and source distribution insights.' },
  { icon: Flame, title: 'Hotspot Detection', desc: 'Automated identification and monitoring of high-emission zones across the urban area.' },
  { icon: BrainCircuit, title: 'CO₂ Prediction', desc: 'ML-powered prediction of future CO₂ levels based on traffic, weather, and historical patterns.' },
  { icon: FlaskConical, title: 'Capture Simulation', desc: 'Simulate tree plantations, green corridors, traffic changes, and CO₂ capture units.' },
  { icon: GitCompareArrows, title: 'Scenario Comparison', desc: 'Compare multiple intervention strategies side-by-side to find the optimal solution.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-slate-900 text-lg">CO₂ Digital Twin</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <a href="#problem" className="hover:text-slate-900 transition-colors">Problem</a>
            <a href="#solution" className="hover:text-slate-900 transition-colors">Solution</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
            <a href="#capabilities" className="hover:text-slate-900 transition-colors">Capabilities</a>
          </div>
          <Link
            to="/dashboard"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            Open Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-white" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
              <Leaf className="w-4 h-4" />
              Environmental Intelligence Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
              Digital Twin for CO₂ Capture in Urban Settings
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl">
              A virtual representation of urban environments to analyze CO₂ emissions,
              identify hotspots, and simulate interventions — enabling data-driven decisions
              for cleaner cities.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                to="/digital-twin"
                className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-primary-700 transition-colors shadow-sm"
              >
                Explore Digital Twin
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/analytics"
                className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 px-6 py-3 rounded-lg text-base font-medium border border-slate-300 hover:bg-slate-50 transition-colors"
              >
                View Analytics
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900">The Problem</h2>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              Urban areas are responsible for over 70% of global CO₂ emissions. Yet, city planners
              and environmental agencies lack effective tools to visualize emission patterns,
              identify critical hotspots, and evaluate the impact of interventions <em>before</em> committing
              resources to implementation.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Invisible Emissions', desc: 'CO₂ emissions are invisible. Without spatial visualization, it\'s impossible to understand where the worst pollution occurs.' },
              { title: 'Costly Trial & Error', desc: 'Implementing urban interventions without simulation leads to wasted resources on ineffective strategies.' },
              { title: 'Data Fragmentation', desc: 'Traffic, industrial, and environmental data exist in silos, preventing holistic emission analysis.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mb-4">
                  <Target className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900">Our Solution</h2>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              We build a <strong>Digital Twin</strong> — a virtual replica of the urban environment
              that integrates traffic, industrial, and environmental data to create a comprehensive
              CO₂ emission model. This enables real-time visualization, predictive analytics, and
              intervention simulation all in one platform.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { title: 'Spatial Visualization', desc: 'Map-based digital twin with heatmaps, hotspot markers, and multi-layer controls for comprehensive emission understanding.' },
              { title: 'Predictive Analytics', desc: 'Machine learning models trained on historical data to predict future CO₂ levels and emission patterns.' },
              { title: 'Intervention Simulation', desc: 'Simulate tree plantations, green corridors, traffic measures, and capture units to evaluate impact before implementation.' },
              { title: 'Decision Intelligence', desc: 'AI-powered recommendations that suggest the most effective interventions for each hotspot based on data analysis.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center mt-1">
                  <Lightbulb className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
            <p className="mt-4 text-lg text-slate-600">From raw urban data to actionable decision support</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative">
                  <div className="bg-white rounded-xl border border-slate-200 p-5 text-center h-full">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="text-xs font-semibold text-primary-600 mb-1">Step {i + 1}</div>
                    <h3 className="font-semibold text-slate-900 text-sm">{step.label}</h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="hidden xl:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <ChevronRight className="w-5 h-5 text-slate-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Capabilities */}
      <section id="capabilities" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Key Capabilities</h2>
            <p className="mt-4 text-lg text-slate-600">A comprehensive platform for urban emission management</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="w-11 h-11 rounded-lg bg-primary-50 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{cap.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{cap.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Explore?</h2>
          <p className="mt-4 text-lg text-primary-100 max-w-2xl mx-auto">
            Dive into the Digital Twin platform to visualize emissions, detect hotspots,
            and simulate interventions for a cleaner urban environment.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/digital-twin"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 px-6 py-3 rounded-lg text-base font-medium hover:bg-primary-50 transition-colors"
            >
              Open Digital Twin
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-primary-700 text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-primary-800 transition-colors border border-primary-500"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">CO₂ Digital Twin</span>
            </div>
            <p className="text-sm text-slate-400">
              Digital Twin for CO₂ Capture in Urban Settings — Final Year Project
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
