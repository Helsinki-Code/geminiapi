import React from 'react';
import { NAV_ITEMS } from '../constants';
import { NavItem, ViewType } from '../types';

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const machineItems = NAV_ITEMS.filter(item => !['home', 'api_keys'].includes(item.id));
  const utilityItems = NAV_ITEMS.filter(item => item.id === 'api_keys');

  const NavButton = ({ item }: { item: NavItem }) => (
    <button
      onClick={() => setActiveView(item.id)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-200
        ${
        activeView === item.id
          ? 'bg-brand-primary text-white shadow-lg'
          : 'text-content-100 hover:bg-base-300 hover:text-white'
        }`}
    >
      {item.icon}
      <span>{item.title}</span>
    </button>
  );

  return (
    <nav className="w-64 bg-base-200 flex-shrink-0 p-4 flex flex-col">
      <div 
        className="flex items-center gap-3 mb-8 px-2 cursor-pointer"
        onClick={() => setActiveView('home')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-brand-primary">
          <path d="M12.378 1.602a.75.75 0 0 0-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03ZM21.75 7.933l-9 5.25v9.317l9-5.25V7.933ZM2.25 7.933v9.317l9 5.25v-9.317l-9-5.25Z" />
        </svg>
        <h1 className="text-xl font-bold text-white">Gemini API Machine</h1>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
        <ul className="space-y-2">
            {machineItems.map((item) => <li key={item.id}><NavButton item={item} /></li>)}
        </ul>
        <div className="mt-auto">
            <hr className="my-2 border-base-300" />
            <ul className="space-y-2">
                {utilityItems.map((item) => <li key={item.id}><NavButton item={item} /></li>)}
            </ul>
        </div>
      </div>
      
      <div className="mt-4 p-2 text-center text-xs text-content-200">
        <p>&copy; 2024 Gemini API Machine</p>
      </div>
    </nav>
  );
};

export default Sidebar;
