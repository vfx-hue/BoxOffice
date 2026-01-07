import { BoxOfficeProjection } from "../types";

// Helper to estimate missing budgets based on genre/title signals
const estimateBudget = (title: string): number => {
    const t = title.toLowerCase();
    
    // MEGA BLOCKBUSTERS ($200M+)
    if (t.includes('avengers') || t.includes('avatar') || t.includes('star wars') || t.includes('mandalorian')) return 250;
    if (t.includes('toy story') || t.includes('shrek') || t.includes('frozen')) return 200;

    // ANIMATION & MAJOR IP ($100M - $175M)
    if (t.includes('hoppers') || t.includes('elior')) return 175;
    if (t.includes('mario') || t.includes('minions') || t.includes('despicable')) return 100;
    if (t.includes('project hail mary')) return 150;
    if (t.includes('michael')) return 155;
    if (t.includes('superman') || t.includes('supergirl') || t.includes('batman')) return 180;
    
    // STAR VEHICLES / ACTION ($60M - $100M)
    if (t.includes('mercy') || t.includes('crime 101') || t.includes('cliffhanger')) return 90; 
    if (t.includes('greenland')) return 75;
    if (t.includes('28 years')) return 75; 
    if (t.includes('mummy')) return 70;
    if (t.includes('goat')) return 80; 
    
    // MID-BUDGET / HORROR FRANCHISE ($30M - $60M)
    if (t.includes('bride')) return 85; 
    if (t.includes('wuthering')) return 60; 
    if (t.includes('scream') || t.includes('insidious') || t.includes('silent hill')) return 40;
    if (t.includes('ready or not')) return 35;
    if (t.includes('dracula')) return 40; 
    
    // LOW BUDGET / HORROR / INDIE ($10M - $25M)
    if (t.includes('strangers') || t.includes('soulm8te')) return 15;
    if (t.includes('plague')) return 10; 
    if (t.includes('fish')) return 20; 
    
    return 45; // Default Mid-Budget
};

// Algorithmic Hype Generation based on Budget and IP strength
const estimateHype = (title: string, budget: number): number => {
    let score = 40; // Base baseline
    const t = title.toLowerCase();

    // 1. Budget Driven Hype
    if (budget >= 200) score += 45;
    else if (budget >= 150) score += 35;
    else if (budget >= 100) score += 25;
    else if (budget >= 50) score += 15;
    else if (budget >= 20) score += 5;

    // 2. IP / Franchise Bonuses
    const megaIP = ['avengers', 'star wars', 'mandalorian', 'toy story', 'shrek', 'frozen', 'avatar', 'batman', 'superman', 'spider-man', 'mario'];
    if (megaIP.some(ip => t.includes(ip))) score += 15;

    const majorIP = ['minions', 'despicable', 'jurassic', 'mission', 'fast', 'furious', 'dune', 'hunger games', 'harry potter', 'lord of the rings'];
    if (majorIP.some(ip => t.includes(ip))) score += 10;
    
    // 3. Sequel / Adaptation Signals
    if (t.includes(' 2') || t.includes(' 3') || t.includes(' 4') || t.includes('part') || t.includes('sequel')) score += 5;

    // 4. Specific buzz adjustments
    if (t.includes('28 years')) score += 10;
    if (t.includes('hail mary')) score += 5;
    if (t.includes('michael')) score += 15;

    return Math.min(Math.max(Math.round(score), 15), 99);
};

const RAW_WINTER_DATA = [
    { date: "1/2", title: "The Plague", budget: 5 },
    { date: "1/9", title: "Greenland 2: Migration", budget: 65 },
    { date: "1/9", title: "I Was a Stranger", budget: 8 },
    { date: "1/9", title: "Is This Thing On?", budget: 25 },
    { date: "1/9", title: "Primate", budget: 30 },
    { date: "1/9", title: "The Chronology of Water", budget: 3 },
    { date: "1/16", title: "Dead Man's Wire", budget: 15 },
    { date: "1/16", title: "Charlie the Wonderdog", budget: 20 },
    { date: "1/16", title: "28 Years Later: The Bone Temple", budget: 50 },
    { date: "1/23", title: "H Is for Hawk", budget: 15 },
    { date: "1/23", title: "Return to Silent Hill", budget: 25 },
    { date: "1/23", title: "Clika", budget: 8 },
    { date: "1/23", title: "Mercy", budget: 100 },
    { date: "1/23", title: "The Testament of Ann Lee", budget: 11 },
    { date: "1/30", title: "Arco", budget: 11.2 },
    { date: "1/30", title: "Iron Lung", budget: 5 },
    { date: "1/30", title: "Shelter", budget: 50 },
    { date: "1/30", title: "The Moment", budget: 85 },
    { date: "1/30", title: "Send Help", budget: 40 },
    { date: "2/6", title: "The Strangers: Chapter 3", budget: 8.5 },
    { date: "2/6", title: "Whistle", budget: 18 },
    { date: "2/6", title: "Dracula", budget: 52 },
    { date: "2/6", title: "Solo Mio", budget: 4 },
    { date: "2/6", title: "Cold Storage", budget: 40 },
    { date: "2/13", title: "Good Luck, Have Fun, Don't Die", budget: 10 },
    { date: "2/13", title: "GOAT", budget: 35 },
    { date: "2/13", title: "Crime 101", budget: 110 },
    { date: "2/13", title: "Wuthering Heights", budget: 80 },
    { date: "2/13", title: "Scarlet", budget: 3 },
    { date: "2/20", title: "Psycho Killer", budget: 20 },
    { date: "2/20", title: "I Can Only Imagine 2", budget: 15 },
    { date: "2/27", title: "Scream 7", budget: 50 },
    { date: "2/27", title: "How to Make a Killing", budget: 20 },
    { date: "3/6", title: "Hoppers", budget: 200 },
    { date: "3/6", title: "The Bride!", budget: 100 },
    { date: "3/13", title: "Reminders of Him", budget: 30 },
    { date: "3/13", title: "The Breadwinner", budget: 5 },
    { date: "3/13", title: "The Undertone", budget: 10 },
    { date: "3/20", title: "Project Hail Mary", budget: 175 },
    { date: "3/20", title: "The Pout-Pout Fish", budget: 18 },
    { date: "3/27", title: "They Will Kill You", budget: 35 },
    { date: "3/27", title: "Ready or Not 2: Here I Come", budget: 20 },
    { date: "4/3", title: "The Super Mario Galaxy Movie", budget: 110 },
    { date: "4/3", title: "The Drama", budget: 35 },
    { date: "4/3", title: "A Great Awakening", budget: 10 },
    { date: "4/10", title: "You, Me & Tuscany", budget: 20 },
    { date: "4/17", title: "4 Kids Walk Into a Bank", budget: 30 },
    { date: "4/17", title: "Normal", budget: 25 },
    { date: "4/17", title: "Lee Cronin's The Mummy", budget: 75 },
    { date: "4/24", title: "Michael", budget: 155 },
    { date: "4/24", title: "Mother Mary", budget: 20 }
];

export const WINTER_2026_SLATE: BoxOfficeProjection[] = RAW_WINTER_DATA.map((item, idx) => {
    const budget = item.budget || estimateBudget(item.title);
    const generatedHype = estimateHype(item.title, budget);
    const normalizedHype = Math.min(Math.max(generatedHype, 0), 100) / 100;
    
    let multiplier = 2.0 + (3.0 * normalizedHype);
    if (generatedHype > 80) multiplier += 0.5;
    
    const worldwideTotal = budget * multiplier;

    return {
        movieId: `win_${idx}`,
        movieTitle: item.title,
        timestamp: Date.now(),
        openingWeekendLow: Math.round(worldwideTotal * 0.1),
        openingWeekendHigh: Math.round(worldwideTotal * 0.15),
        domesticTotalLow: Math.round(worldwideTotal * 0.35),
        domesticTotalHigh: Math.round(worldwideTotal * 0.45),
        internationalTotalLow: Math.round(worldwideTotal * 0.5),
        internationalTotalHigh: Math.round(worldwideTotal * 0.6),
        worldwideTotal: Math.round(worldwideTotal),
        confidenceScore: generatedHype,
        reasoning: "Winter 2026 League Projection (Oracle Model)",
        factors: [],
        discoveredBudget: budget,
        isFranchise: false,
        discoveredCast: [],
        comparables: [],
        hypeScore: generatedHype
    };
});