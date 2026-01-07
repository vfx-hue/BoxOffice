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

// Fix: Explicitly use React.Component to resolve prop accessibility error
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Critical Engine Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 font-mono p-4">
          <div className="max-w-xl w-full bg-white border border-red-200 shadow-xl rounded-lg overflow-hidden">
            <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center">
              <TriangleAlert className="h-5 w-5 text-red-600 mr-3" />
              <h1 className="text-lg font-bold text-red-800 uppercase tracking-wider">System Malfunction</h1>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">The predictive engine encountered an error.</p>
              <div className="bg-gray-900 text-red-400 p-4 rounded text-xs overflow-auto max-h-48 mb-6">
                {this.state.error?.toString() || "Unknown rendering exception."}
              </div>
              <button 
                onClick={() => { localStorage.clear(); window.location.reload(); }} 
                className="w-full py-3 bg-black text-white text-xs font-bold uppercase hover:bg-gray-800 transition-colors"
              >
                Clear Data & Reboot
              </button>
            </div>
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
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('LEADERBOARD');
  const [movies, setMovies] = useState<MovieData[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [projection, setProjection] = useState<BoxOfficeProjection | null>(null);
  const [projectionsHistory, setProjectionsHistory] = useState<BoxOfficeProjection[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisLog, setAnalysisLog] = useState<string[]>([]);

  useEffect(() => {
    // Robust local storage initialization
    const saved = localStorage.getItem('boxOfficeProjections_2026');
    let history: BoxOfficeProjection[] = [];
    if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) history = parsed;
        } catch (e) { console.error("History parse failed", e); }
    }
    
    const precomputed = Array.isArray(PRECOMPUTED_PROJECTIONS) ? PRECOMPUTED_PROJECTIONS : [];
    // Ensure we always have the core precomputed data if local storage is empty or smaller
    if (history.length < precomputed.length) {
        setProjectionsHistory(precomputed);
    } else {
        setProjectionsHistory(history);
    }
    
    loadMovies();
  }, []);

  useEffect(() => {
    if (projectionsHistory.length > 0) {
      localStorage.setItem('boxOfficeProjections_2026', JSON.stringify(projectionsHistory));
    }
  }, [projectionsHistory]);

  const loadMovies = async () => {
    setLoadingMovies(true);
    try {
      const data = await fetchUpcomingMovies2026();
      setMovies(data.sort((a, b) => new Date(a.releaseDate || 'Jan 1, 2026').getTime() - new Date(b.releaseDate || 'Jan 1, 2026').getTime()));
    } catch (error) {
      console.error("Movie load failed", error);
    } finally {
      setLoadingMovies(false);
    }
  };

  const addLog = (msg: string) => setAnalysisLog(prev => [...prev, msg]);

  const handleSingleAnalyze = async (movie: MovieData) => {
    setIsAnalyzing(true);
    setAnalysisLog([]); 
    addLog(`INIT: ${movie.title.toUpperCase()}`);
    
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

  const startBatchAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisLog(["BATCH SEQUENCE STARTED..."]);
    const targetMovies = movies.slice(0, 10); // Analyze first 10 for demo speed
    
    for (const movie of targetMovies) {
        addLog(`ANALYZING: ${movie.title}...`);
        await new Promise(r => setTimeout(r, 1000));
        try {
            const result = await generateProjection(movie);
            setProjectionsHistory(prev => {
                const filtered = prev.filter(p => p.movieId !== result.movieId);
                return [...filtered, result];
            });
        } catch (e) { addLog(`FAIL: ${movie.title}`); }
    }
    setIsAnalyzing(false);
    setDashboardTab('LEADERBOARD');
  };

  return (
    <div className="min-h-screen flex flex-col font-mono bg-white text-black">
      <Header onHome={() => { setView(ViewState.DASHBOARD); setProjection(null); }} />
      <main className="flex-grow max-w-5xl mx-auto px-4 py-8 w-full">
        {isAnalyzing && (
            <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center font-mono">
                <div className="w-full max-w-md bg-black text-green-400 p-6 rounded shadow-2xl border border-gray-800">
                    <div className="flex items-center mb-4 border-b border-gray-800 pb-2">
                        <Terminal className="h-4 w-4 mr-2" />
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Analysis Kernel</span>
                    </div>
                    <div className="space-y-2 h-48 overflow-y-auto text-xs flex flex-col-reverse font-bold">
                        <div className="animate-pulse">_</div>
                        {analysisLog.slice().reverse().map((log, idx) => <div key={idx}>{log}</div>)}
                    </div>
                </div>
            </div>
        )}

        {view === ViewState.DASHBOARD && (
          <div>
            <div className="flex items-center space-x-6 md:space-x-8 mb-8 border-b-2 border-black overflow-x-auto">
                <button onClick={() => setDashboardTab('LEADERBOARD')} className={`pb-4 text-xs font-bold uppercase tracking-widest ${dashboardTab === 'LEADERBOARD' ? 'border-b-4 border-black' : 'text-gray-400'}`}><TrendingUp className="h-4 w-4 inline mr-2" />Rankings</button>
                <button onClick={() => setDashboardTab('FANTASY')} className={`pb-4 text-xs font-bold uppercase tracking-widest ${dashboardTab === 'FANTASY' ? 'border-b-4 border-black' : 'text-gray-400'}`}><Trophy className="h-4 w-4 inline mr-2" />Fantasy</button>
                <button onClick={() => setDashboardTab('BACKTEST')} className={`pb-4 text-xs font-bold uppercase tracking-widest ${dashboardTab === 'BACKTEST' ? 'border-b-4 border-black' : 'text-gray-400'}`}><History className="h-4 w-4 inline mr-2" />Backtest</button>
                <button onClick={() => setDashboardTab('SLATE')} className={`pb-4 text-xs font-bold uppercase tracking-widest ${dashboardTab === 'SLATE' ? 'border-b-4 border-black' : 'text-gray-400'}`}><List className="h-4 w-4 inline mr-2" />Slate</button>
            </div>

            {dashboardTab === 'LEADERBOARD' && <Leaderboard projections={projectionsHistory} />}
            {dashboardTab === 'FANTASY' && <FantasyDraft projections={projectionsHistory} />}
            {dashboardTab === 'BACKTEST' && <BacktestDashboard />}
            {dashboardTab === 'SLATE' && (
                <>
                    <div className="flex justify-between items-end mb-8">
                        <h2 className="text-3xl font-bold uppercase tracking-tighter">Release Slate</h2>
                        <button onClick={startBatchAnalysis} disabled={loadingMovies} className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50"><PlayCircle className="h-3 w-3 inline mr-2" />Run Simulations</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-black text-xs uppercase font-bold">
                                    <th className="py-4">Date</th>
                                    <th className="py-4">Title</th>
                                    <th className="py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {movies.map(movie => (
                                    <tr key={movie.id} onClick={() => handleSingleAnalyze(movie)} className="group cursor-pointer border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-4 pr-8 text-gray-500">{movie.releaseDate}</td>
                                        <td className="py-4 font-bold uppercase">{movie.title}</td>
                                        <td className="py-4 text-right font-bold text-gray-300 group-hover:text-black">Analyze &rarr;</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
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