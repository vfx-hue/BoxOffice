
import React, { useState, useMemo } from 'react';
import { BoxOfficeProjection } from '../types';
import { WINTER_2026_SLATE } from '../services/winter2026Data';
import { TrendingUp, Search, RefreshCw, CheckCircle2, Flame, Skull, Info } from 'lucide-react';

interface FantasyDraftProps {
  projections: BoxOfficeProjection[]; 
}

interface ScoredMovie extends BoxOfficeProjection {
  breakEvenPoint: number;
  fantasyScore: number; // Worldwide - (2.5 * Budget)
  roi: number; // Return on Investment multiplier
  source: 'AI_ORACLE' | 'HYPE_ESTIMATE';
}

const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]|_/g, "").trim();

const FantasyDraft: React.FC<FantasyDraftProps> = ({ projections }) => {
  const [draftedIds, setDraftedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Merge Winter Data with Official Projections to ensure consistency
  const mergedLeagueData = useMemo(() => {
    return WINTER_2026_SLATE.map(winterMovie => {
      // Find matching movie in the main app projections (Leaderboard data)
      const officialProjection = projections.find(p => 
        normalize(p.movieTitle) === normalize(winterMovie.movieTitle) ||
        normalize(p.movieTitle).includes(normalize(winterMovie.movieTitle)) ||
        normalize(winterMovie.movieTitle).includes(normalize(p.movieTitle))
      );

      if (officialProjection) {
        // PREFER OFFICIAL DATA for consistency
        return {
          ...winterMovie,
          worldwideTotal: officialProjection.worldwideTotal,
          // Use Winter budget if official is missing or seems like a default heuristic, 
          // otherwise trust the official one if it differs significantly? 
          // Actually, consistency with Rankings implies using the Ranking's Budget too, 
          // but Winter budgets were tuned for this specific game.
          // Let's stick to Winter Budget as the "Game Rule" but use Official Gross as the "Outcome".
          discoveredBudget: winterMovie.discoveredBudget, 
          source: 'AI_ORACLE' as const
        };
      }

      return {
        ...winterMovie,
        source: 'HYPE_ESTIMATE' as const
      };
    });
  }, [projections]);

  // 2. Calculate scores based on the Merged Data
  const allScoredMovies: ScoredMovie[] = useMemo(() => {
    return mergedLeagueData
      .filter(p => p.discoveredBudget && p.discoveredBudget > 0)
      .map(p => {
        const budget = p.discoveredBudget || 0;
        const breakEven = budget * 2.5;
        const score = p.worldwideTotal - breakEven;
        const roi = p.worldwideTotal / budget;
        return {
          ...p,
          breakEvenPoint: breakEven,
          fantasyScore: score,
          roi
        };
      });
  }, [mergedLeagueData]);

  // 3. Filter out drafted movies to get the "Available Pool"
  const availableMovies = useMemo(() => {
    return allScoredMovies.filter(m => !draftedIds.has(m.movieId));
  }, [allScoredMovies, draftedIds]);

  // 4. Sort for Best and Worst from the AVAILABLE pool
  const bestPicks = useMemo(() => {
    return [...availableMovies].sort((a, b) => b.fantasyScore - a.fantasyScore).slice(0, 20);
  }, [availableMovies]);

  const negativePicks = useMemo(() => {
    return [...availableMovies].sort((a, b) => a.fantasyScore - b.fantasyScore).slice(0, 20);
  }, [availableMovies]);

  // 5. Search Results
  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    return availableMovies.filter(m => 
      m.movieTitle.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [availableMovies, searchTerm]);

  const handleDraft = (id: string) => {
    const newSet = new Set(draftedIds);
    newSet.add(id);
    setDraftedIds(newSet);
    setSearchTerm(''); 
  };

  const handleReset = () => {
    if (confirm('Reset the Winter 2026 draft board?')) {
      setDraftedIds(new Set());
      setSearchTerm('');
    }
  };

  const formatMoney = (val: number) => {
    const absVal = Math.abs(val);
    const formatted = `$${Math.round(absVal).toLocaleString()}M`;
    return val < 0 ? `-${formatted}` : `+${formatted}`;
  };

  return (
    <div className="animate-fade-in font-mono pb-20">
      
      {/* HEADER & CONTROLS */}
      <div className="mb-8 border-b-4 border-black pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h2 className="text-3xl font-bold uppercase tracking-tighter flex items-center">
                <Flame className="h-6 w-6 mr-2 text-red-500" />
                Winter 2026 League
            </h2>
            <p className="text-sm text-gray-600 mt-1">
                Draft Goal: Maximize Profit (>2.5x Budget) + Pick 1 Strategic Bomb.
            </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search movie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 w-full text-sm focus:outline-none focus:border-black transition-colors"
                />
                {/* Search Dropdown */}
                {searchTerm && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 shadow-lg z-50">
                        {searchResults.map(movie => (
                            <div 
                                key={movie.movieId}
                                onClick={() => handleDraft(movie.movieId)}
                                className="px-4 py-3 hover:bg-black hover:text-white cursor-pointer border-b border-gray-100 last:border-0 flex justify-between items-center group"
                            >
                                <span className="font-bold text-xs uppercase">{movie.movieTitle}</span>
                                <span className="text-[10px] bg-gray-100 text-gray-800 px-1 group-hover:bg-gray-700 group-hover:text-white">DRAFT</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <button 
                onClick={handleReset}
                className="p-2 text-gray-400 hover:text-red-600 border border-gray-200 hover:border-red-200 transition-colors"
                title="Reset Board"
            >
                <RefreshCw className="h-4 w-4" />
            </button>
        </div>
      </div>

      {/* DRAFT STATUS TICKER */}
      {draftedIds.size > 0 && (
          <div className="mb-8 bg-gray-900 text-white px-4 py-2 text-xs flex items-center overflow-x-auto whitespace-nowrap">
              <span className="font-bold mr-4 text-gray-500 uppercase tracking-widest">Roster ({draftedIds.size}):</span>
              {Array.from(draftedIds).map(id => {
                  const m = allScoredMovies.find(mv => mv.movieId === id);
                  return m ? (
                      <span key={id} className="mr-4 flex items-center text-gray-300">
                          <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                          {m.movieTitle}
                      </span>
                  ) : null;
              })}
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* GREEN LIST - BEST VALUE */}
        <div className="bg-white border border-green-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="bg-green-50 px-4 py-3 border-b border-green-200 flex justify-between items-center">
                <div className="flex items-center text-green-800">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    <h3 className="font-bold uppercase tracking-widest text-sm">Top Value Picks</h3>
                </div>
                <div className="text-[10px] text-right">
                    <span className="block font-bold text-green-600">Highest Profit</span>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="border-b border-green-100 bg-green-50/30 text-green-800/60 uppercase tracking-wider">
                            <th className="py-2 px-3 w-8">#</th>
                            <th className="py-2 px-1">Title</th>
                            <th className="py-2 px-1 w-12 text-center">Hype</th>
                            <th className="py-2 px-1 text-right">Budget</th>
                            <th className="py-2 px-1 text-right">Proj. Gross</th>
                            <th className="py-2 px-1 text-right">Profit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bestPicks.map((m, idx) => (
                            <tr 
                                key={m.movieId} 
                                onClick={() => handleDraft(m.movieId)}
                                className="border-b border-gray-50 hover:bg-green-500 hover:text-white transition-colors cursor-pointer group"
                            >
                                <td className="py-3 px-3 font-bold text-gray-400 group-hover:text-white/70">{idx + 1}</td>
                                <td className="py-3 px-1 font-bold truncate max-w-[120px] md:max-w-xs flex items-center">
                                    {m.movieTitle}
                                    {m.source === 'AI_ORACLE' && (
                                        <div className="ml-1 w-2 h-2 rounded-full bg-blue-500" title="Synced with Official Rankings"></div>
                                    )}
                                </td>
                                <td className="py-3 px-1 text-center font-medium">
                                    <span className={`px-1.5 py-0.5 rounded ${m.hypeScore && m.hypeScore >= 70 ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                                        {m.hypeScore}
                                    </span>
                                </td>
                                <td className="py-3 px-1 text-right opacity-70">${m.discoveredBudget}M</td>
                                <td className="py-3 px-1 text-right opacity-70">${Math.round(m.worldwideTotal)}M</td>
                                <td className="py-3 px-1 text-right font-bold text-green-600 group-hover:text-white">
                                    {formatMoney(m.fantasyScore)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* RED LIST - NEGATIVE PICKS */}
        <div className="bg-white border border-red-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="bg-red-50 px-4 py-3 border-b border-red-200 flex justify-between items-center">
                <div className="flex items-center text-red-800">
                    <Skull className="h-5 w-5 mr-2" />
                    <h3 className="font-bold uppercase tracking-widest text-sm">Bomb Targets</h3>
                </div>
                <div className="text-[10px] text-right">
                    <span className="block font-bold text-red-600">Draft 1 to sabotage</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="border-b border-red-100 bg-red-50/30 text-red-800/60 uppercase tracking-wider">
                            <th className="py-2 px-3 w-8">#</th>
                            <th className="py-2 px-1">Title</th>
                            <th className="py-2 px-1 w-12 text-center">Hype</th>
                            <th className="py-2 px-1 text-right">Budget</th>
                            <th className="py-2 px-1 text-right">Proj. Gross</th>
                            <th className="py-2 px-1 text-right">Loss</th>
                        </tr>
                    </thead>
                    <tbody>
                        {negativePicks.map((m, idx) => (
                            <tr 
                                key={m.movieId} 
                                onClick={() => handleDraft(m.movieId)}
                                className="border-b border-gray-50 hover:bg-red-500 hover:text-white transition-colors cursor-pointer group"
                            >
                                <td className="py-3 px-3 font-bold text-gray-400 group-hover:text-white/70">{idx + 1}</td>
                                <td className="py-3 px-1 font-bold truncate max-w-[120px] md:max-w-xs flex items-center">
                                    {m.movieTitle}
                                    {m.source === 'AI_ORACLE' && (
                                        <div className="ml-1 w-2 h-2 rounded-full bg-blue-500" title="Synced with Official Rankings"></div>
                                    )}
                                </td>
                                <td className="py-3 px-1 text-center font-medium">
                                     <span className={`px-1.5 py-0.5 rounded ${m.hypeScore && m.hypeScore < 30 ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}>
                                        {m.hypeScore}
                                    </span>
                                </td>
                                <td className="py-3 px-1 text-right opacity-70">${m.discoveredBudget}M</td>
                                <td className="py-3 px-1 text-right opacity-70">${Math.round(m.worldwideTotal)}M</td>
                                <td className="py-3 px-1 text-right font-bold text-red-600 group-hover:text-white">
                                    {formatMoney(m.fantasyScore)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

      </div>

      <div className="mt-12 p-4 bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-start">
          <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-bold uppercase mb-1">Live Oracle Synchronization Active</h4>
            <p className="mb-2">
                Movies marked with a <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mx-1"></span> are synced with the main Rankings Dashboard. 
                Running a new AI Analysis on the dashboard will automatically update these fantasy scores.
            </p>
            <ul className="list-disc pl-4 space-y-1 text-blue-700/80">
                <li><strong>Profit Calculation:</strong> Worldwide Gross - (2.5 × Budget).</li>
                <li><strong>Unsynced Movies:</strong> Use the Hype-based estimation formula (Budget × Hype/20).</li>
            </ul>
          </div>
      </div>
    </div>
  );
};

export default FantasyDraft;
