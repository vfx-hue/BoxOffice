import React from 'react';

interface HeaderProps {
  onHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHome }) => {
  return (
    <header className="border-b border-black py-6 bg-white">
      <div className="max-w-5xl mx-auto px-4 flex justify-between items-center font-mono">
        <div onClick={onHome} className="cursor-pointer">
           <h1 className="text-xl font-bold uppercase tracking-widest text-black">
             BoxOffice<span className="text-gray-400">Oracle</span>
           </h1>
           <p className="text-[10px] text-gray-500 uppercase mt-1">
             Stanford/Vitelli Regression Model v2.1
           </p>
        </div>
        <div className="text-xs font-bold uppercase text-right hidden md:block">
           <span className="block">Target Year: 2026</span>
           <span className="text-gray-400">Predictive Engine Online</span>
        </div>
      </div>
    </header>
  );
};

export default Header;