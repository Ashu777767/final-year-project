import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import LocationSearch from './LocationSearch';
import { useLocation } from '../../context/LocationContext';

const Navbar = ({ title, onMenuClick }) => {
  const { location } = useLocation();
  return (
    <header className="sticky top-0 h-16 bg-white border-b border-slate-200 z-10 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          <Menu size={20} />
        </button>
        <Link to="/" className="text-sm font-medium text-primary-600 hover:underline">Home</Link>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <LocationSearch />
        
        <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-medium">
            AK
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

