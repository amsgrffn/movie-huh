/**
 * CineMark - Configuration and Global State
 * Contains global variables, constants, and mock data
 */

// Global state
let currentView = 'markdown';
let currentMediaData = null;
let currentMediaType = 'movie'; // 'movie' or 'tv'

// Default API keys
const DEFAULT_OMDB_KEY = 'c7c06a7c';
const DEFAULT_TMDB_KEY = '6ba568970f260dcd909b33c000890463';

// CORS proxy for web scraping
const CORS_PROXY = 'https://api.allorigins.win/get?url=';

// Mock data for testing without API keys
const mockMovieData = {
    "Interstellar": {
        Title: "Interstellar",
        Year: "2014",
        Runtime: "169 min",
        Genre: "Adventure, Drama, Science Fiction",
        Plot: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
        Actors: "Matthew McConaughey, Anne Hathaway, Michael Caine, Jessica Chastain, Casey Affleck",
        Director: "Christopher Nolan",
        Writer: "Jonathan Nolan",
        Producer: "Lynda Obst",
        Cinematographer: "Hoyte van Hoytema",
        Editor: "Lee Smith",
        imdbID: "tt0816692",
        imdbRating: "8.7",
        Metascore: "74",
        RottenTomatoes: "73%",
        TMDbRating: "8.4",
        Tagline: "Mankind was born on Earth. It was never meant to die here.",
        LetterboxdRating: "4.2",
        Poster: "https://image.tmdb.org/t/p/original/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        mediaType: "movie",
        LetterboxdLinks: {
            cast: {
                "Matthew McConaughey": "https://letterboxd.com/actor/matthew-mcconaughey/",
                "Anne Hathaway": "https://letterboxd.com/actor/anne-hathaway/",
                "Michael Caine": "https://letterboxd.com/actor/michael-caine/",
                "Jessica Chastain": "https://letterboxd.com/actor/jessica-chastain/",
                "Casey Affleck": "https://letterboxd.com/actor/casey-affleck/"
            },
            crew: {
                "Christopher Nolan": "https://letterboxd.com/director/christopher-nolan/",
                "Jonathan Nolan": "https://letterboxd.com/writer/jonathan-nolan/"
            },
            genres: [
                { name: "Adventure", url: "https://letterboxd.com/films/genre/adventure/" },
                { name: "Drama", url: "https://letterboxd.com/films/genre/drama/" },
                { name: "Science Fiction", url: "https://letterboxd.com/films/genre/science-fiction/" }
            ]
        }
    }
};

const mockTVData = {
    "Breaking Bad": {
        Title: "Breaking Bad",
        Year: "2008",
        Runtime: "45 min",
        Genre: "Crime, Drama, Thriller",
        Plot: "A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student in order to secure his family's future.",
        Actors: "Bryan Cranston, Aaron Paul, Anna Gunn, Dean Norris, Betsy Brandt",
        Director: "Vince Gilligan",
        Writer: "Vince Gilligan",
        Creator: "Vince Gilligan",
        imdbID: "tt0903747",
        imdbRating: "9.5",
        TMDbRating: "8.9",
        Tagline: "All Hail the King.",
        Poster: "https://image.tmdb.org/t/p/original/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
        mediaType: "tv",
        Seasons: 5,
        Episodes: 62,
        Status: "Ended",
        Network: "AMC",
        FirstAirDate: "2008-01-20",
        LastAirDate: "2013-09-29"
    }
};
