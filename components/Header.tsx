import React from 'react';

interface HeaderProps {
    onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => (
  <header className="bg-gray-800/50 backdrop-blur-sm shadow-md sticky top-0 z-20">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
      <div className="flex-1"></div>
      <div className="flex-1 text-center">
        <h1 className="text-3xl font-extrabold text-white">
          <span className="text-indigo-400">YouTube</span> 
          <span className="ml-2">Channel Dashboard</span>
        </h1>
      </div>
      <div className="flex-1 flex justify-end">
        <button 
            onClick={onOpenSettings} 
            className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700"
            aria-label="Open Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  </header>
);
