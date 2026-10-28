import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, BarChart3, Flame, FlaskConical, GitCompareArrows, Lightbulb, Leaf, X, MapPin, Building2 } from 'lucide-react';
import { NAV_ITEMS } from '../../utils/constants';
import { LocationContext } from '../../context/LocationContext';

const iconMap = { LayoutDashboard, Map, BarChart3, Flame, FlaskConical, GitCompareArrows, Lightbulb, MapPin, Building2 };

const Sidebar = ({ isOpen, onClose }) => {
  const { savedProfiles, loadProfile } = useContext(LocationContext);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-screen bg-white border-r border-slate-200 z-30 transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-16 lg:w-64'}
        `}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100">
          <div className="flex items-center gap-2 overflow-hidden">
            <Leaf className="w-8 h-8 text-primary-600 flex-shrink-0" />
            <span className={`font-semibold text-lg text-slate-900 whitespace-nowrap ${!isOpen && 'md:hidden lg:block'}`}>
              CO₂ Digital Twin
            </span>
          </div>
          {isOpen && (
            <button onClick={onClose} className="md:hidden text-slate-500 hover:text-slate-700">
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          <ul className="space-y-1 px-2">
            {NAV_ITEMS?.map((item) => {
              const IconComponent = iconMap[item.icon] || LayoutDashboard;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-primary-50 text-primary-700 font-medium border-r-2 border-primary-600' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }
                    `}
                  >
                    <IconComponent size={20} className="flex-shrink-0" />
                    <span className={`whitespace-nowrap ${!isOpen && 'md:hidden lg:block'}`}>
                      {item.label}
                    </span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={`p-4 border-t border-slate-100 text-center ${!isOpen && 'md:hidden lg:block'}`}>
          <p className="text-xs text-slate-500">CO2 Digital Twin</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

