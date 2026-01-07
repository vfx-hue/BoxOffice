
export interface MovieData {
  id: string;
  title: string;
  studio?: string;
  releaseDate?: string;
  director?: string;
  cast?: string[];
  budget?: number; // In millions
  genre?: string;
  franchise?: boolean; // Key feature for Kaggle/TMDB model
  synopsis?: string;
  imageUrl?: string;
  runtime?: number; // Minutes
  
  // Advanced ML Features
  mpaaRating?: string;
  distributor?: string;
  estimatedTheaters?: number;
}

export interface ProjectionFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  score: number; // 1-10 intensity representing feature importance
  description: string;
}

export interface BoxOfficeProjection {
  movieId: string;
  movieTitle: string;
  timestamp: number;
  
  // Financials (in Millions)
  openingWeekendLow: number;
  openingWeekendHigh: number;
  domesticTotalLow: number;
  domesticTotalHigh: number;
  internationalTotalLow: number;
  internationalTotalHigh: number;
  worldwideTotal: number; // The weighted average prediction
  
  confidenceScore: number; // 0-100
  factors: ProjectionFactor[]; // Feature Importance
  reasoning: string;
  
  // Auto-Discovered Data Points (for transparency)
  discoveredBudget?: number;
  discoveredCast?: string[];
  isFranchise?: boolean;
  hypeScore?: number; // New field for Fantasy League
  
  comparables: {
    title: string;
    worldwideGross: number;
    year: number;
  }[];

  // Search Grounding URLs (Mandatory for Google Search Tool)
  groundingUrls?: { title: string; url: string }[];

  // Backtesting specifics
  actualWorldwide?: number;
  errorMargin?: number;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  REPORT = 'REPORT'
}
