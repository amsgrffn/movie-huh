/**
 * CineMark - URL Helper Functions
 * Generates URLs for various movie/TV databases
 */

function createSlug(name) {
    return name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

function getIMDbURL(imdbID) {
    return `https://www.imdb.com/title/${imdbID}/`;
}

function getLetterboxdURL(title, year) {
    const slug = createSlug(title);
    return `https://letterboxd.com/film/${slug}-${year}/`;
}

function getMetacriticURL(title, mediaType = 'movie') {
    const slug = createSlug(title);
    if (mediaType === 'tv') {
        return `https://www.metacritic.com/tv/${slug}/`;
    }
    return `https://www.metacritic.com/movie/${slug}/`;
}

function getRottenTomatoesURL(title, mediaType = 'movie') {
    const slug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '_')
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_');
    if (mediaType === 'tv') {
        return `https://www.rottentomatoes.com/tv/${slug}`;
    }
    return `https://www.rottentomatoes.com/m/${slug}`;
}

function getTMDbURL(title, year, mediaType = 'movie') {
    // TMDb URLs don't always follow a predictable pattern, so we use search
    return `https://www.themoviedb.org/search?query=${encodeURIComponent(title)}`;
}

function getLetterboxdGenreLink(genre) {
    const slug = createSlug(genre);
    return `https://letterboxd.com/films/genre/${slug}/`;
}

function getLetterboxdActorLink(name) {
    const slug = createSlug(name);
    return `https://letterboxd.com/actor/${slug}/`;
}

function getLetterboxdDirectorLink(name) {
    const slug = createSlug(name);
    return `https://letterboxd.com/director/${slug}/`;
}

function getTMDBSearchLink(name, type) {
    // Fallback to TMDB search
    return `https://www.themoviedb.org/search?query=${encodeURIComponent(name)}`;
}

function getTVMazeURL(title) {
    const slug = title.toLowerCase().replace(/\s+/g, '-');
    return `https://www.tvmaze.com/search?q=${encodeURIComponent(title)}`;
}

function getIMDbTVURL(imdbID) {
    return `https://www.imdb.com/title/${imdbID}/`;
}
