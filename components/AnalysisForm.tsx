import React, { useState } from 'react';
import { MovieData } from '../types';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

interface AnalysisFormProps {
  movie: MovieData;
  onAnalyze: (movie: MovieData, context: string) => void;
  isLoading: boolean;
  onBack: () => void;
}

const AnalysisForm: React.FC<AnalysisFormProps> = ({ movie, onAnalyze, isLoading, onBack }) => {
  // Fields mapped to Vitelli Paper features
  const [cast, setCast] = useState<string>(movie.cast?.join(', ') || '');
  const [director, setDirector] = useState<string>(movie.director || '');
  const [budget, setBudget] = useState<string>(movie.budget?.toString() || '');
  const [mpaa, setMpaa] = useState<string>('PG-13');
  const [competitionLevel, setCompetitionLevel] = useState<string>('Normal'); // Proxy for Movie-Movie graph degree
  const [theaterCount, setTheaterCount] = useState<string>('4000');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct context emphasizing the paper's variables
    const context = `
      VITELLI MODEL INPUTS:
      1. Actor Centrality Nodes: ${cast} (Analyze past box office connections).
      2. Movie-Movie Competition Degree: ${competitionLevel} (Proxy for graph density).
      3. MPAA Rating: ${mpaa}.
      4. Log(Budget): $${budget}M.
      5. Opening Theaters: ${theaterCount}.
      6. Director: ${director}.
    `;
    
    const updatedMovie = { 
        ...movie, 
        budget: budget ? parseInt(budget) : undefined,
        mpaaRating: mpaa,
    };
    onAnalyze(updatedMovie, context);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="mb-8 text-xs font-bold uppercase hover:underline">
        &lt; Back to List
      </button>

      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
        <p className="font-mono text-sm text-gray-600">
          Initialize Vitelli/Stanford Prediction Model. <br/>
          Please verify feature vectors below for accurate Graph Centrality calculation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 font-mono">
        
        {/* Section 1: Network Centrality */}
        <div className="border-t border-black pt-6">
          <h3 className="font-bold text-sm uppercase mb-4">I. Actor-Director Graph Features (Star Power)</h3>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-xs uppercase mb-2">Lead Cast (Comma Separated)</label>
              <input
                type="text"
                value={cast}
                onChange={(e) => setCast(e.target.value)}
                placeholder="e.g. Tom Cruise, Zendaya (Used for Degree Centrality)"
                className="w-full bg-transparent border-b border-gray-300 focus:border-black py-2 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase mb-2">Director</label>
              <input
                type="text"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                className="w-full bg-transparent border-b border-gray-300 focus:border-black py-2 outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Market & Metadata */}
        <div className="border-t border-black pt-6">
          <h3 className="font-bold text-sm uppercase mb-4">II. Market & Competition Features</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
               <label className="block text-xs uppercase mb-2">Est. Production Budget ($M)</label>
               <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="200"
                className="w-full bg-transparent border-b border-gray-300 focus:border-black py-2 outline-none"
              />
            </div>

            <div>
               <label className="block text-xs uppercase mb-2">Est. Opening Theaters</label>
               <input
                type="number"
                value={theaterCount}
                onChange={(e) => setTheaterCount(e.target.value)}
                className="w-full bg-transparent border-b border-gray-300 focus:border-black py-2 outline-none"
              />
            </div>

            <div>
               <label className="block text-xs uppercase mb-2">MPAA Rating</label>
               <select 
                  value={mpaa} 
                  onChange={(e) => setMpaa(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-300 focus:border-black py-2 outline-none"
               >
                 <option value="G">G</option>
                 <option value="PG">PG</option>
                 <option value="PG-13">PG-13</option>
                 <option value="R">R</option>
               </select>
            </div>

            <div>
               <label className="block text-xs uppercase mb-2">Release Window Competition</label>
               <select 
                  value={competitionLevel} 
                  onChange={(e) => setCompetitionLevel(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-300 focus:border-black py-2 outline-none"
               >
                 <option value="Low">Low (Jan, Feb, Sept)</option>
                 <option value="Medium">Medium (July, Dec)</option>
                 <option value="High">High (June, Nov - Vitelli Paper)</option>
               </select>
            </div>
          </div>
        </div>

        <div className="pt-8">
            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
                {isLoading ? (
                    <span className="flex items-center justify-center">
                        <Loader2 className="animate-spin mr-2 h-4 w-4" /> Computing Regression...
                    </span>
                ) : (
                    "Run Prediction Model"
                )}
            </button>
        </div>
      </form>
    </div>
  );
};

export default AnalysisForm;