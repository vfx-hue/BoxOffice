
import { MovieData } from "../types";

export interface HistoricalMovie extends MovieData {
  actualWorldwide: number;
  releaseYear: number;
}

export const HISTORICAL_MOVIES: HistoricalMovie[] = [
  {
    id: "hist_1",
    title: "Oppenheimer",
    releaseDate: "July 21, 2023",
    studio: "Universal",
    director: "Christopher Nolan",
    cast: ["Cillian Murphy", "Robert Downey Jr.", "Emily Blunt"],
    budget: 100,
    actualWorldwide: 975,
    releaseYear: 2023
  },
  {
    id: "hist_2",
    title: "Barbie",
    releaseDate: "July 21, 2023",
    studio: "Warner Bros",
    director: "Greta Gerwig",
    cast: ["Margot Robbie", "Ryan Gosling"],
    budget: 145,
    actualWorldwide: 1446,
    releaseYear: 2023
  },
  {
    id: "hist_3",
    title: "The Super Mario Bros. Movie",
    releaseDate: "April 5, 2023",
    studio: "Universal",
    director: "Aaron Horvath",
    cast: ["Chris Pratt", "Anya Taylor-Joy"],
    budget: 100,
    actualWorldwide: 1361,
    releaseYear: 2023
  },
  {
    id: "hist_4",
    title: "Top Gun: Maverick",
    releaseDate: "May 27, 2022",
    studio: "Paramount",
    director: "Joseph Kosinski",
    cast: ["Tom Cruise", "Miles Teller"],
    budget: 170,
    actualWorldwide: 1493,
    releaseYear: 2022
  },
  {
    id: "hist_5",
    title: "Indiana Jones and the Dial of Destiny",
    releaseDate: "June 30, 2023",
    studio: "Disney",
    director: "James Mangold",
    cast: ["Harrison Ford", "Phoebe Waller-Bridge"],
    budget: 300,
    actualWorldwide: 383,
    releaseYear: 2023
  },
  {
    id: "hist_6",
    title: "The Marvels",
    releaseDate: "November 10, 2023",
    studio: "Disney",
    director: "Nia DaCosta",
    cast: ["Brie Larson", "Iman Vellani"],
    budget: 270,
    actualWorldwide: 206,
    releaseYear: 2023
  },
  {
    id: "hist_7",
    title: "Spider-Man: No Way Home",
    releaseDate: "December 17, 2021",
    studio: "Sony",
    director: "Jon Watts",
    cast: ["Tom Holland", "Zendaya", "Benedict Cumberbatch"],
    budget: 200,
    actualWorldwide: 1912,
    releaseYear: 2021
  },
  {
    id: "hist_8",
    title: "Dune: Part Two",
    releaseDate: "March 1, 2024",
    studio: "Warner Bros",
    director: "Denis Villeneuve",
    cast: ["Timothée Chalamet", "Zendaya"],
    budget: 190,
    actualWorldwide: 711,
    releaseYear: 2024
  }
];
