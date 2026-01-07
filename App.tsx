import React, { Component, useState, useEffect } from 'react';
import Header from './components/Header';
import ProjectionReport from './components/ProjectionReport';
import Leaderboard from './components/Leaderboard';
import FantasyDraft from './components/FantasyDraft';
import BacktestDashboard from './components/BacktestDashboard';
import { fetchUpcomingMovies2026, generateProjection } from './services/geminiService';
import { PRECOMPUTED_PROJECTIONS } from './services/precomputedData';
import { MovieData, BoxOfficeProjection, ViewState } from './types';
import { Loader2, Terminal, List, TrendingUp, PlayCircle, Trophy, History, TriangleAlert } from 'lucide-react';

interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Critical Engine Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white font-mono p-4">
          <div className="max-w-xl w-full border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <h1 className="text-3xl font-black uppercase mb-4">Engine Failure</h1>
            <p className="mb-6 text-sm">The box office prediction core has melted down.</p>
            <div className="bg-black text-red-500 p-4 mb-6 text-xs overflow-auto">
              {this.state.error?.message || "Unknown internal error"}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-black text-white font-bold uppercase hover:bg-gray-800"
            >
              Reboot Simulation
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

type DashboardTab = 'SLATE' | 'LEADERBOARD' | 'FANTASY' | 'BACKTEST';

const AppContent: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('FANTASY');
  const [movies, setMovies] = useState<MovieData[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [projection, setProjection] = useState<BoxOfficeProjection | null>(null);
  const [projectionsHistory, setProjectionsHistory] = useState<BoxOfficeProjection[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisLog, setAnalysisLog] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('boxOfficeProjections_2026');
    let history: BoxOfficeProjection[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) history = parsed;
      } catch (e) { console.error("History parse failed", e); }
    }
    
    const precomputed = Array.isArray(PRECOMPUTED_PROJECTIONS) ? PRECOMPUTED_PROJECTIONS : [];
    if (history.length < precomputed.length) {
      setProjectionsHistory(precomputed);
    } else {
      setProjectionsHistory(history);
    }
    
    loadMovies();
  }, []);

  const loadMovies = async () => {
    setLoadingMovies(false);
    try {
      const data = await fetchUpcomingMovies2026();
      setMovies(data);
    } catch (error) {
      console.error("Movie load failed", error);
    }
  };

  const addLog = (msg: string) => setAnalysisLog(prev => [...prev, msg]);

  const handleSingleAnalyze = async (movie: MovieData) => {
    setIsAnalyzing(true);
    setAnalysisLog([`INIT: ${movie.title.toUpperCase()}`]);
    try {
      const result = await generateProjection(movie);
      setProjectionsHistory(prev => {
        const filtered = prev.filter(p => p.movieId !== result.movieId);
        return [...filtered, result];
      });
      setProjection(result);
      setView(ViewState.REPORT);
    } catch (error) {
      addLog("CRITICAL: ANALYSIS FAILURE");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-mono bg-white text-black">
      <Header onHome={() => { setView(ViewState.DASHBOARD); setProjection(null); }} />
      <main className="flex-grow max-w-6xl mx-auto px-4 py-8 w-full">
        {isAnalyzing && (
          <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg bg-black text-green-500 p-8 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)]">
               <div className="flex items-center mb-6 border-b border-green-900 pb-2">
                 <Terminal className="h-4 w-4 mr-2" />
                 <span className="text-[10px] uppercase font-bold tracking-widest">Oracle Kernel</span>
               </div>
               <div className="h-64 overflow-y-auto text-xs space-y-2 flex flex-col-reverse">
                 <div className="animate-pulse">_</div>
                 {analysisLog.slice().reverse().map((log, i) => <div key={i}>{log}</div>)}
               </div>
            </div>
          </div>
        )}

        {view === ViewState.DASHBOARD && (
          <div>
            <div className="flex items-center space-x-8 mb-12 border-b-4 border-black overflow-x-auto whitespace-nowrap">
              <button onClick={() => setDashboardTab('FANTASY')} className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${dashboardTab === 'FANTASY' ? 'border-b-[8px] border-black scale-105' : 'text-gray-300 hover:text-black'}`}>
                <Trophy className="h-5 w-5 inline mr-2" />Fantasy Board
              </button>
              <button onClick={() => setDashboardTab('LEADERBOARD')} className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${dashboardTab === 'LEADERBOARD' ? 'border-b-[8px] border-black scale-105' : 'text-gray-300 hover:text-black'}`}>
                <TrendingUp className="h-5 w-5 inline mr-2" />Rankings
              </button>
              <button onClick={() => setDashboardTab('BACKTEST')} className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${dashboardTab === 'BACKTEST' ? 'border-b-[8px] border-black scale-105' : 'text-gray-300 hover:text-black'}`}>
                <History className="h-5 w-5 inline mr-2" />Backtest
              </button>
              <button onClick={() => setDashboardTab('SLATE')} className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${dashboardTab === 'SLATE' ? 'border-b-[8px] border-black scale-105' : 'text-gray-300 hover:text-black'}`}>
                <List className="h-5 w-5 inline mr-2" />Full Slate
              </button>
            </div>

            {dashboardTab === 'LEADERBOARD' && <Leaderboard projections={projectionsHistory} />}
            {dashboardTab === 'FANTASY' && <FantasyDraft projections={projectionsHistory} />}
            {dashboardTab === 'BACKTEST' && <BacktestDashboard />}
            {dashboardTab === 'SLATE' && (
              <div className="animate-in fade-in duration-500">
                <div className="flex justify-between items-end mb-8">
                  <h2 className="text-4xl font-black uppercase tracking-tighter">2026 Production Slate</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b-2 border-black text-[10px] uppercase font-black tracking-widest text-gray-400">
                        <th className="py-4">Launch Date</th>
                        <th className="py-4">Production Title</th>
                        <th className="py-4 text-right">Model Kernel</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {movies.map(movie => (
                        <tr key={movie.id} onClick={() => handleSingleAnalyze(movie)} className="group cursor-pointer border-b border-gray-100 hover:bg-black transition-colors">
                          <td className="py-5 pr-8 font-medium text-gray-500 group-hover:text-gray-400">{movie.releaseDate}</td>
                          <td className="py-5 font-black uppercase group-hover:text-white">{movie.title}</td>
                          <td className="py-5 text-right font-black text-gray-200 group-hover:text-accent tracking-tighter">INITIATE SIMULATION &rarr;</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
        {view === ViewState.REPORT && projection && <ProjectionReport data={projection} onReset={() => setView(ViewState.DASHBOARD)} />}
      </main>
    </div>
  );
}

const App: React.FC = () => <ErrorBoundary><AppContent /></ErrorBoundary>;
export default App;