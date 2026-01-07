
import React, { useState } from 'react';
import { BoxOfficeProjection } from '../types';
import { HISTORICAL_MOVIES } from '../services/backtestData';
import { generateBacktestPrediction } from '../services/geminiService';
import { PlayCircle, Loader2, Target, CheckCircle } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';

const BacktestDashboard: React.FC = () => {
  const [results, setResults] = useState<BoxOfficeProjection[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  const runBacktest = async () => {
    setIsRunning(true);
    setResults([]);

    for (const movie of HISTORICAL_MOVIES) {
      setCurrentTest(`Simulating ${movie.releaseYear} for: ${movie.title}...`);
      try {
        // Add artificial delay to simulate processing and avoid rate limits
        await new Promise(r => setTimeout(r, 1000));
        const prediction = await generateBacktestPrediction(movie);
        setResults(prev => [...prev, prediction]);
      } catch (e) {
        console.error("Backtest failed for", movie.title);
      }
    }

    setIsRunning(false);
    setCurrentTest('');
  };

  const chartData = results.map(r => ({
    name: r.movieTitle,
    actual: r.actualWorldwide,
    predicted: r.worldwideTotal,
    error: Math.abs(r.errorMargin || 0)
  }));

  const formatMoney = (val: number) => `$${val.toLocaleString()}M`;

  return (
    <div className="animate-fade-in font-mono pb-20">
      <div className="mb-8 border-b-4 border-black pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold uppercase tracking-tighter">Model Validation</h2>
          <p className="text-sm text-gray-600 mt-1">
            Backtest the predictive engine against known historical outcomes (2021-2024).
          </p>
        </div>
        <button
          onClick={runBacktest}
          disabled={isRunning}
          className="flex items-center px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isRunning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlayCircle className="h-4 w-4 mr-2" />}
          {isRunning ? 'Running Simulation...' : 'Start Backtest'}
        </button>
      </div>

      {isRunning && (
        <div className="mb-8 bg-gray-900 text-green-400 p-4 font-mono text-xs rounded">
          <span className="animate-pulse">_</span> {currentTest}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-12">
          {/* STATS SUMMARY */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white border border-gray-200 p-6 shadow-sm">
                <h4 className="text-xs uppercase text-gray-500 font-bold mb-2">Mean Absolute Error</h4>
                <div className="text-3xl font-bold text-black">
                   {Math.round(results.reduce((acc, curr) => acc + Math.abs(curr.errorMargin || 0), 0) / results.length)}%
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Avg deviation from actuals</p>
             </div>
             <div className="bg-white border border-gray-200 p-6 shadow-sm">
                <h4 className="text-xs uppercase text-gray-500 font-bold mb-2">Most Accurate</h4>
                <div className="text-xl font-bold text-black truncate">
                   {results.sort((a, b) => Math.abs(a.errorMargin || 0) - Math.abs(b.errorMargin || 0))[0].movieTitle}
                </div>
                <p className="text-[10px] text-green-600 mt-1 font-bold">
                   {Math.round(Math.abs(results.sort((a, b) => Math.abs(a.errorMargin || 0) - Math.abs(b.errorMargin || 0))[0].errorMargin || 0))}% Variance
                </p>
             </div>
             <div className="bg-white border border-gray-200 p-6 shadow-sm">
                <h4 className="text-xs uppercase text-gray-500 font-bold mb-2">Sample Size</h4>
                <div className="text-3xl font-bold text-black">
                   {results.length} / {HISTORICAL_MOVIES.length}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Verified Blockbusters</p>
             </div>
          </div>

          {/* CHART */}
          <div className="bg-white border border-gray-200 p-6 h-96">
            <h3 className="font-bold text-xs uppercase mb-4 tracking-widest border-b border-gray-100 pb-2">Predicted vs Actual Gross</h3>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="actual" name="Actual" unit="M" label={{ value: 'Actual Box Office ($M)', position: 'insideBottom', offset: -10, fontSize: 10 }} />
                <YAxis type="number" dataKey="predicted" name="Predicted" unit="M" label={{ value: 'Predicted ($M)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
                    if (payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                            <div className="bg-white p-2 border border-black text-xs font-mono shadow-lg">
                                <p className="font-bold">{data.name}</p>
                                <p>Actual: ${data.actual}M</p>
                                <p>Model: ${data.predicted}M</p>
                                <p className={data.error < 20 ? 'text-green-600' : 'text-red-600'}>Var: {Math.round(data.error)}%</p>
                            </div>
                        );
                    }
                    return null;
                }} />
                {/* Perfect Prediction Line */}
                <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 3000, y: 3000 }]} stroke="red" strokeDasharray="3 3" />
                <Scatter name="Movies" data={chartData} fill="#000" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* TABLE */}
          <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 text-xs font-bold uppercase tracking-wider flex justify-between">
                <span>Detailed Logs</span>
                <span>Variance</span>
            </div>
            <div className="divide-y divide-gray-100">
                {results.map(r => (
                    <div key={r.movieId} className="px-4 py-3 flex justify-between items-center text-sm hover:bg-gray-50 transition-colors">
                        <div>
                            <div className="font-bold">{r.movieTitle}</div>
                            <div className="text-xs text-gray-500">
                                Predicted: <span className="text-black font-medium">{formatMoney(r.worldwideTotal)}</span> vs Actual: <span className="text-black font-medium">{formatMoney(r.actualWorldwide!)}</span>
                            </div>
                        </div>
                        <div className={`text-right font-bold ${Math.abs(r.errorMargin || 0) < 15 ? 'text-green-600' : Math.abs(r.errorMargin || 0) < 30 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {r.errorMargin && r.errorMargin > 0 ? '+' : ''}{Math.round(r.errorMargin || 0)}%
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {!isRunning && results.length === 0 && (
         <div className="flex flex-col items-center justify-center py-24 text-gray-400 bg-gray-50/50 border border-dashed border-gray-300 rounded font-mono">
            <Target className="h-12 w-12 mb-4 opacity-20" />
            <p>Click "Start Backtest" to verify model accuracy.</p>
         </div>
      )}
    </div>
  );
};

export default BacktestDashboard;
