import React from 'react';
import { Calendar, Film, Briefcase, BarChart2 } from 'lucide-react';
import { MovieData } from '../types';

interface MovieCardProps {
  movie: MovieData;
  onSelect: (movie: MovieData) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(movie)}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-accent hover:shadow-md transition-all duration-300 cursor-pointer group relative flex flex-col h-full"
    >
      <div className="h-40 bg-gray-100 relative overflow-hidden border-b border-gray-100">
        {movie.imageUrl ? (
            <img src={movie.imageUrl} alt={movie.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
        ) : (
            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                <Film className="h-10 w-10 text-gray-300 group-hover:text-accent transition-colors" />
            </div>
        )}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-[10px] font-bold px-2 py-0.5 rounded text-gray-900 border border-gray-200 shadow-sm">
            2026
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-base font-bold text-gray-900 mb-1 leading-tight group-hover:text-accent transition-colors">
            {movie.title}
        </h3>
        <div className="flex flex-wrap gap-2 mb-4 mt-2">
           <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
             {movie.studio || 'Indie'}
           </span>
           <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
             {movie.genre || 'Drama'}
           </span>
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
             <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {movie.releaseDate || 'TBD'}
             </div>
             <div className="flex items-center text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Configure Model <BarChart2 className="h-3 w-3 ml-1" />
             </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;