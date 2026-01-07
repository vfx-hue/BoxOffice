
import React from 'react';
import { BoxOfficeProjection } from '../types';
import { BarChart2 } from 'lucide-react';

interface LeaderboardProps {
  projections: BoxOfficeProjection[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ projections }) => {
  // Sort by Worldwide Total Descending
  const sorted = [...projections].sort((a, b) => b.worldwideTotal - a.worldwideTotal);

  if (sorted.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 border border-dashed border-gray-300 rounded bg-gray-50/50">
              <BarChart2 className="h-12 w-12 mb-4 opacity-20" />
              <p className="font-mono text-sm">No projections generated yet.</p>
              <p className="font-mono text-xs mt-2">Run the model on a movie from the Slate to populate.</p>
          </div>
      );
  }

  return (
    <div className="animate-fade-in font-mono h-[80vh] flex flex-col">
       <div className="mb-4 pb-2 border-b border-gray-200 flex-none">
           <h3 className="font-bold text-xl uppercase tracking-widest text-black">
             Projected 2026 Rankings
           </h3>
           <span className="text-xs text-gray-500 uppercase mt-1">
             Based on {sorted.length} Analyzed Title{sorted.length !== 1 ? 's' : ''}
           </span>
       </div>
       
       <div className="bg-white border border-gray-200 shadow-sm flex flex-col flex-grow overflow-hidden">
          <div className="flex text-[10px] text-gray-500 uppercase tracking-wider bg-gray-50 py-3 px-4 border-b border-gray-200 flex-none z-10">
              <div className="w-16">Rank</div>
              <div className="flex-grow">Title</div>
              <div className="w-32 text-right hidden sm:block">Opening Wknd</div>
              <div className="w-32 text-right hidden sm:block">Domestic</div>
              <div className="w-32 text-right">Worldwide</div>
          </div>
          
          <div className="overflow-y-auto flex-grow">
            {sorted.map((p, idx) => (
                <div 
                    key={p.movieId} 
                    className={`flex items-center justify-between text-sm py-4 px-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${idx < 3 ? 'bg-gray-50/30' : ''}`}
                >
                    <div className="flex items-center flex-grow min-w-0">
                    <span className={`w-16 font-bold text-lg ${idx === 0 ? 'text-accent' : 'text-gray-300'}`}>
                        {idx + 1}
                    </span>
                    <div className="flex flex-col min-w-0 pr-4">
                            <span className="uppercase font-bold truncate">{p.movieTitle}</span>
                            {idx === 0 && (
                                <span className="inline-flex text-[9px] text-accent uppercase tracking-wide font-medium">
                                #1 Projected Global Gross
                                </span>
                            )}
                    </div>
                    </div>
                    
                    <div className="flex items-center space-x-0 sm:space-x-4 text-xs">
                    <div className="text-right w-32 hidden sm:block text-gray-400">
                        ${p.openingWeekendHigh.toLocaleString()}M
                    </div>
                    <div className="text-right w-32 hidden sm:block text-gray-500">
                        ${p.domesticTotalHigh.toLocaleString()}M
                    </div>
                    <div className="text-right w-32 font-bold text-base">
                        ${p.worldwideTotal.toLocaleString()}M
                    </div>
                    </div>
                </div>
            ))}
          </div>
       </div>
    </div>
  );
};

export default Leaderboard;
