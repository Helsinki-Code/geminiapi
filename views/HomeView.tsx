
import React from 'react';
import { NAV_ITEMS } from '../constants';
import { ViewType } from '../types';

interface HomeViewProps {
  setActiveView: (view: ViewType) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ setActiveView }) => {
  return (
    <div className="text-center">
      <h2 className="text-4xl font-extrabold text-white mb-4">Welcome to the Gemini API Machine</h2>
      <p className="text-lg text-content-200 mb-12 max-w-3xl mx-auto">
        This platform provides a hands-on experience with the Google Gemini API. Each section is a dedicated "machine" designed to demonstrate a specific capability. Explore, experiment, and grab the code snippets to integrate these powerful features into your own applications.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {NAV_ITEMS.filter(item => item.id !== 'home').map(item => (
          <div
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className="bg-base-200 p-6 rounded-lg shadow-lg hover:shadow-xl hover:bg-base-300 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-primary/20 text-brand-primary mx-auto mb-4 group-hover:scale-110 transition-transform">
              {React.cloneElement(item.icon, { className: "w-8 h-8" })}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
            <p className="text-content-200 text-sm">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeView;
