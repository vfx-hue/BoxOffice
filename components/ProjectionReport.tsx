
import React from 'react';
import { BoxOfficeProjection } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ProjectionReportProps {
  data: BoxOfficeProjection;
  onReset: () => void;
}

const ProjectionReport: React.FC<ProjectionReportProps> = ({ data, onReset }) => {
  const chartData = [
    { name: 'Opening', val: data.openingWeekendHigh },
    { name: 'Domestic', val: data.domesticTotalHigh },
    { name: 'Intl', val: data.internationalTotalHigh },
  ];

  const formatMoney = (val: number) => `$${val.toLocaleString()}M`;

  return (
    <div className="max-w-4xl mx-auto font-mono text-sm pb-20 animate-fade-in">
      <button onClick={onReset} className="mb-8 text-xs font-bold uppercase hover:underline">
        &lt; Close Report
      </button>

      <div className="border-b-4 border-black pb-4 mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end">
             <div>
                 <span className="text-xs font-bold bg-black text-white px-2 py-0.5 uppercase mb-2 inline-block">
                    Ensemble Model Result
                 </span>
                 <h1 className="text-4xl font-bold uppercase">{data.movieTitle}</h1>
             </div>
             <div className="text-left md:text-right mt-4 md:mt-0">
                <span className="block text-xs text-gray-500">Global Projection</span>
                <span className="block text-4xl font-bold">{formatMoney(data.worldwideTotal)}</span>
             </div>
        </div>
      </div>

      {/* DETECTED DATA SECTION */}
      <div className="bg-gray-100 p-6 mb-12 border border-gray-200">
        <h3 className="font-bold text-xs uppercase text-gray-500 mb-4 tracking-widest">Automated Data Discovery (Inputs)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
                <span className="block text-xs text-gray-500">Est. Budget (Log)</span>
                <span className="font-bold text-lg">{data.discoveredBudget ? `$${data.discoveredBudget}M` : 'N/A'}</span>
            </div>
            <div>
                <span className="block text-xs text-gray-500">Franchise IP</span>
                <span className="font-bold text-lg">{data.isFranchise ? 'YES' : 'NO'}</span>
            </div>
            <div className="col-span-2">
                <span className="block text-xs text-gray-500">Key Cast Nodes (Centrality)</span>
                <span className="font-bold text-base truncate block">{data.discoveredCast?.join(', ') || 'Unknown'}</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
        <div>
            <h3 className="font-bold border-b border-black mb-4 pb-1">01. FINANCIAL ESTIMATES</h3>
            <table className="w-full text-left">
                <tbody>
                    <tr className="border-b border-gray-200">
                        <td className="py-3 text-gray-500">Opening Wknd</td>
                        <td className="py-3 text-right font-bold">{formatMoney(data.openingWeekendLow)} - {formatMoney(data.openingWeekendHigh)}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                        <td className="py-3 text-gray-500">Domestic Total</td>
                        <td className="py-3 text-right font-bold">{formatMoney(data.domesticTotalLow)} - {formatMoney(data.domesticTotalHigh)}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                        <td className="py-3 text-gray-500">Intl. Total</td>
                        <td className="py-3 text-right font-bold">{formatMoney(data.internationalTotalLow)} - {formatMoney(data.internationalTotalHigh)}</td>
                    </tr>
                    <tr>
                         <td className="py-4 text-gray-500">Model Confidence</td>
                         <td className="py-4 text-right font-bold">{data.confidenceScore}%</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div>
             <h3 className="font-bold border-b border-black mb-4 pb-1">02. VISUALIZATION</h3>
             <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#000" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                        cursor={{fill: '#f3f4f6'}} 
                        contentStyle={{ fontFamily: 'monospace', border: '1px solid #e5e7eb' }} 
                    />
                    <Bar dataKey="val" fill="#000" barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
        </div>
      </div>

      <div className="mb-12">
         <h3 className="font-bold border-b border-black mb-4 pb-1">03. WEIGHTED FACTORS (TMDB + VITELLI)</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.factors.map((factor, idx) => (
                <div key={idx} className="bg-white border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-xs uppercase leading-tight">{factor.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 uppercase ${factor.impact === 'negative' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {factor.impact}
                        </span>
                    </div>
                    <p className="text-gray-500 text-xs leading-relaxed h-12 overflow-hidden">
                        {factor.description}
                    </p>
                    <div className="mt-2 w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                         <div className="bg-black h-full" style={{ width: `${(factor.score / 10) * 100}%` }}></div>
                    </div>
                </div>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
         <div>
            <h3 className="font-bold border-b border-black mb-4 pb-1">04. ALGORITHMIC REASONING</h3>
            <p className="whitespace-pre-line text-gray-700 leading-relaxed text-xs md:text-sm">
                {data.reasoning}
            </p>
         </div>
         
         <div>
            <h3 className="font-bold border-b border-black mb-4 pb-1">05. HISTORICAL COMPARABLES</h3>
            <ul className="space-y-2">
                {data.comparables.map((comp, idx) => (
                    <li key={idx} className="flex justify-between items-center bg-gray-50 px-3 py-3 border-l-2 border-black">
                        <span>{comp.title} <span className="text-gray-400 text-xs">({comp.year})</span></span>
                        <span className="font-bold">{formatMoney(comp.worldwideGross)}</span>
                    </li>
                ))}
            </ul>
         </div>
      </div>

      {/* GROUNDING SOURCES (MANDATORY FOR SEARCH TOOL) */}
      {data.groundingUrls && data.groundingUrls.length > 0 && (
        <div className="pt-8 border-t border-black">
          <h3 className="font-bold text-xs uppercase text-gray-500 mb-4 tracking-widest">06. Grounding Sources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            {data.groundingUrls.map((source, idx) => (
              <a 
                key={idx} 
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[10px] text-blue-600 hover:underline truncate py-1 flex items-center"
              >
                <span className="inline-block w-4 h-4 bg-blue-50 text-blue-800 text-center rounded-sm mr-2 leading-4">{idx + 1}</span>
                {source.title || source.url}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectionReport;
