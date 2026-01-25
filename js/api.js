/**
 * CineMark - API Functions
 * Handles all API calls to OMDb, TMDb for movies and TV shows
 */

/**
 * Fetch movie data from OMDb API
 */
async function fetchMovieFromOMDb(title, year, apiKey) {
    let url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}&plot=full`;
    if (year) {
        url += `&y=${year}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.Response === "True") {
        return data;
    }
    return null;
}

/**
 * Search for a movie on TMDb
 */
async function searchMovieOnTMDb(title, year, tmdbApiKey) {
    let searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(title)}`;
    if (year) {
        searchUrl += `&year=${year}`;
    }

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.results && searchData.results.length > 0) {
        return searchData.results[0];
    }
    return null;
}

/**
 * Search for a TV show on TMDb
 */
async function searchTVOnTMDb(title, year, tmdbApiKey) {
    let searchUrl = `https://api.themoviedb.org/3/search/tv?api_key=${tmdbApiKey}&query=${encodeURIComponent(title)}`;
    if (year) {
        searchUrl += `&first_air_date_year=${year}`;
    }

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.results && searchData.results.length > 0) {
        return searchData.results[0];
    }
    return null;
}

/**
 * Fetch detailed movie data from TMDb
 */
async function fetchMovieDetailsFromTMDb(movieId, tmdbApiKey) {
    const detailsUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${tmdbApiKey}`;
    const creditsUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${tmdbApiKey}`;
    const externalUrl = `https://api.themoviedb.org/3/movie/${movieId}/external_ids?api_key=${tmdbApiKey}`;

    const [detailsResponse, creditsResponse, externalResponse] = await Promise.all([
        fetch(detailsUrl),
        fetch(creditsUrl),
        fetch(externalUrl)
    ]);

    const details = await detailsResponse.json();
    const credits = await creditsResponse.json();
    const external = await externalResponse.json();

    return { details, credits, external };
}

/**
 * Fetch detailed TV show data from TMDb
 */
async function fetchTVDetailsFromTMDb(tvId, tmdbApiKey) {
    const detailsUrl = `https://api.themoviedb.org/3/tv/${tvId}?api_key=${tmdbApiKey}`;
    const creditsUrl = `https://api.themoviedb.org/3/tv/${tvId}/credits?api_key=${tmdbApiKey}`;
    const externalUrl = `https://api.themoviedb.org/3/tv/${tvId}/external_ids?api_key=${tmdbApiKey}`;

    const [detailsResponse, creditsResponse, externalResponse] = await Promise.all([
        fetch(detailsUrl),
        fetch(creditsUrl),
        fetch(externalUrl)
    ]);

    const details = await detailsResponse.json();
    const credits = await creditsResponse.json();
    const external = await externalResponse.json();

    return { details, credits, external };
}

/**
 * Fetch supplementary TMDb data for a movie (poster, crew, rating)
 */
async function fetchTMDBData(title, year) {
    try {
        const tmdbApiKey = document.getElementById('tmdbApiKey').value.trim();

        if (!tmdbApiKey) {
            console.log('No TMDb API key provided, skipping TMDb data fetch');
            return { poster: null, crew: {}, rating: null };
        }

        const movie = await searchMovieOnTMDb(title, year, tmdbApiKey);
        if (!movie) {
            return { poster: null, crew: {}, rating: null };
        }

        const movieId = movie.id;
        let poster = null;
        let tmdbRating = null;

        if (movie.poster_path) {
            poster = `https://image.tmdb.org/t/p/original${movie.poster_path}`;
        }

        if (movie.vote_average) {
            tmdbRating = movie.vote_average.toFixed(1);
        }

        // Fetch crew information
        const creditsUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${tmdbApiKey}`;
        const creditsResponse = await fetch(creditsUrl);
        const creditsData = await creditsResponse.json();

        const crew = {};

        if (creditsData.crew) {
            const cinematographer = creditsData.crew.find(person =>
                person.job === 'Director of Photography' || person.job === 'Cinematography'
            );
            if (cinematographer) {
                crew.Cinematographer = cinematographer.name;
            }

            const editor = creditsData.crew.find(person => person.job === 'Editor');
            if (editor) {
                crew.Editor = editor.name;
            }
        }

        return { poster, crew, rating: tmdbRating };
    } catch (error) {
        console.error('Error fetching TMDb data:', error);
        return { poster: null, crew: {}, rating: null };
    }
}

/**
 * Main function to fetch movie data from API (OMDb with TMDb fallback)
 */
async function fetchMovieFromAPI(title, year, apiKey) {
    const outputContainer = document.getElementById('outputContainer');
    outputContainer.innerHTML = '<div class="loading">Searching for movie...</div>';

    try {
        const omdbData = await fetchMovieFromOMDb(title, year, apiKey);

        if (omdbData) {
            document.getElementById('apiNotice').style.display = 'none';

            // Fetch additional data
            outputContainer.innerHTML = '<div class="loading">Fetching additional data from Letterboxd and TMDb...</div>';
            const [letterboxdRating, letterboxdLinks, tmdbData] = await Promise.all([
                fetchLetterboxdRating(omdbData.Title, omdbData.Year),
                fetchLetterboxdLinks(omdbData.Title, omdbData.Year),
                fetchTMDBData(omdbData.Title, omdbData.Year)
            ]);

            currentMediaData = {
                Title: omdbData.Title,
                Year: omdbData.Year,
                Runtime: omdbData.Runtime,
                Genre: omdbData.Genre,
                Plot: omdbData.Plot,
                Actors: omdbData.Actors,
                Director: omdbData.Director,
                Writer: omdbData.Writer,
                Producer: omdbData.Producer || "N/A",
                Cinematographer: tmdbData.crew?.Cinematographer || "N/A",
                Editor: tmdbData.crew?.Editor || "N/A",
                imdbID: omdbData.imdbID,
                imdbRating: omdbData.imdbRating,
                Metascore: omdbData.Metascore,
                RottenTomatoes: omdbData.Ratings?.find(r => r.Source === "Rotten Tomatoes")?.Value || "N/A",
                TMDbRating: tmdbData.rating || "N/A",
                Tagline: omdbData.Plot.split('.')[0] + '.',
                LetterboxdRating: letterboxdRating,
                LetterboxdLinks: letterboxdLinks,
                Poster: tmdbData.poster || (omdbData.Poster !== "N/A" ? omdbData.Poster : null),
                mediaType: 'movie'
            };
            generateOutput();
        } else {
            // Fallback to TMDb
            console.log('OMDb search failed, trying TMDb fallback...');
            outputContainer.innerHTML = '<div class="loading">Movie not found in OMDb, trying TMDb...</div>';
            await fetchMovieFromTMDB(title, year);
        }
    } catch (error) {
        showError('Error fetching movie data. Please check your API key and try again.');
        console.error(error);
    }
}

/**
 * Fetch movie directly from TMDb (when OMDb fails)
 */
async function fetchMovieFromTMDB(title, year) {
    const outputContainer = document.getElementById('outputContainer');
    const tmdbApiKey = document.getElementById('tmdbApiKey').value.trim();

    if (!tmdbApiKey) {
        showError('TMDb API key required to search this movie. Please add your TMDb API key.');
        return;
    }

    try {
        outputContainer.innerHTML = '<div class="loading">Searching TMDb...</div>';

        const movie = await searchMovieOnTMDb(title, year, tmdbApiKey);
        if (!movie) {
            showError('Movie not found on TMDb');
            return;
        }

        const movieId = movie.id;

        outputContainer.innerHTML = '<div class="loading">Fetching movie details...</div>';
        const { details, credits, external } = await fetchMovieDetailsFromTMDb(movieId, tmdbApiKey);

        const tmdbRating = details.vote_average ? details.vote_average.toFixed(1) : 'N/A';

        // Fetch Letterboxd data
        outputContainer.innerHTML = '<div class="loading">Fetching additional data from Letterboxd...</div>';
        const [letterboxdRating, letterboxdLinks] = await Promise.all([
            fetchLetterboxdRating(details.title, details.release_date?.split('-')[0]),
            fetchLetterboxdLinks(details.title, details.release_date?.split('-')[0])
        ]);

        // Extract crew info
        const director = credits.crew.find(person => person.job === 'Director')?.name || 'N/A';
        const writer = credits.crew.find(person => person.job === 'Writer' || person.job === 'Screenplay')?.name || 'N/A';
        const producer = credits.crew.find(person => person.job === 'Producer')?.name || 'N/A';
        const cinematographer = credits.crew.find(person => person.job === 'Director of Photography')?.name || 'N/A';
        const editor = credits.crew.find(person => person.job === 'Editor')?.name || 'N/A';

        const topCast = credits.cast.slice(0, 5).map(actor => actor.name).join(', ');
        const runtime = details.runtime ? `${details.runtime} min` : 'N/A';
        const genres = details.genres.map(g => g.name).join(', ');
        const imdbID = external.imdb_id || 'N/A';

        // Scrape ratings
        outputContainer.innerHTML = '<div class="loading">Scraping ratings from IMDb, Metacritic, and Rotten Tomatoes...</div>';
        const [imdbRating, metacriticScore, rtScore] = await Promise.all([
            scrapeIMDbRating(imdbID),
            scrapeMetacriticScore(details.title),
            scrapeRottenTomatoesScore(details.title)
        ]);

        currentMediaData = {
            Title: details.title,
            Year: details.release_date?.split('-')[0] || 'N/A',
            Runtime: runtime,
            Genre: genres,
            Plot: details.overview || 'N/A',
            Actors: topCast || 'N/A',
            Director: director,
            Writer: writer,
            Producer: producer,
            Cinematographer: cinematographer,
            Editor: editor,
            imdbID: imdbID,
            imdbRating: imdbRating,
            Metascore: metacriticScore,
            RottenTomatoes: rtScore,
            TMDbRating: tmdbRating,
            Tagline: details.tagline || (details.overview ? details.overview.split('.')[0] + '.' : ''),
            LetterboxdRating: letterboxdRating,
            LetterboxdLinks: letterboxdLinks,
            Poster: details.poster_path ? `https://image.tmdb.org/t/p/original${details.poster_path}` : null,
            mediaType: 'movie'
        };

        generateOutput();
    } catch (error) {
        showError('Error fetching movie data from TMDb. Please check your API key and try again.');
        console.error(error);
    }
}

/**
 * Fetch TV show data from TMDb
 */
async function fetchTVShowFromAPI(title, year) {
    const outputContainer = document.getElementById('outputContainer');
    const tmdbApiKey = document.getElementById('tmdbApiKey').value.trim();

    if (!tmdbApiKey) {
        showError('TMDb API key required to search TV shows. Please add your TMDb API key.');
        return;
    }

    try {
        outputContainer.innerHTML = '<div class="loading">Searching for TV show...</div>';

        const tvShow = await searchTVOnTMDb(title, year, tmdbApiKey);
        if (!tvShow) {
            showError('TV show not found on TMDb');
            return;
        }

        const tvId = tvShow.id;

        outputContainer.innerHTML = '<div class="loading">Fetching TV show details...</div>';
        const { details, credits, external } = await fetchTVDetailsFromTMDb(tvId, tmdbApiKey);

        const tmdbRating = details.vote_average ? details.vote_average.toFixed(1) : 'N/A';

        // Extract crew info
        const creators = details.created_by?.map(c => c.name).join(', ') || 'N/A';
        const topCast = credits.cast?.slice(0, 5).map(actor => actor.name).join(', ') || 'N/A';
        const genres = details.genres?.map(g => g.name).join(', ') || 'N/A';
        const imdbID = external.imdb_id || 'N/A';
        const networks = details.networks?.map(n => n.name).join(', ') || 'N/A';

        // Calculate episode runtime
        const episodeRuntime = details.episode_run_time?.length > 0
            ? `${details.episode_run_time[0]} min`
            : 'N/A';

        // Scrape IMDb rating
        outputContainer.innerHTML = '<div class="loading">Fetching ratings...</div>';
        const imdbRating = await scrapeIMDbRating(imdbID);

        currentMediaData = {
            Title: details.name,
            Year: details.first_air_date?.split('-')[0] || 'N/A',
            Runtime: episodeRuntime,
            Genre: genres,
            Plot: details.overview || 'N/A',
            Actors: topCast,
            Creator: creators,
            Director: 'N/A', // TV shows typically have multiple directors
            Writer: 'N/A',
            imdbID: imdbID,
            imdbRating: imdbRating,
            TMDbRating: tmdbRating,
            Tagline: details.tagline || (details.overview ? details.overview.split('.')[0] + '.' : ''),
            Poster: details.poster_path ? `https://image.tmdb.org/t/p/original${details.poster_path}` : null,
            mediaType: 'tv',
            // TV-specific fields
            Seasons: details.number_of_seasons || 'N/A',
            Episodes: details.number_of_episodes || 'N/A',
            Status: details.status || 'N/A',
            Network: networks,
            FirstAirDate: details.first_air_date || 'N/A',
            LastAirDate: details.last_air_date || 'N/A',
            InProduction: details.in_production || false
        };

        generateOutput();

        // Show episode picker for TV shows
        showEpisodePicker(tvId, details.seasons);
    } catch (error) {
        showError('Error fetching TV show data. Please check your API key and try again.');
        console.error(error);
    }
}

/**
 * Fetch all episodes for a specific season
 */
async function fetchSeasonEpisodes(tvId, seasonNumber) {
    const tmdbApiKey = document.getElementById('tmdbApiKey').value.trim();

    if (!tmdbApiKey) {
        console.error('TMDb API key required');
        return null;
    }

    try {
        const url = `https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}?api_key=${tmdbApiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching season episodes:', error);
        return null;
    }
}

/**
 * Fetch detailed episode information
 */
async function fetchEpisodeDetails(tvId, seasonNumber, episodeNumber) {
    const tmdbApiKey = document.getElementById('tmdbApiKey').value.trim();

    if (!tmdbApiKey) {
        showError('TMDb API key required');
        return null;
    }

    try {
        const url = `https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${tmdbApiKey}`;
        const creditsUrl = `https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}/credits?api_key=${tmdbApiKey}`;

        const [episodeResponse, creditsResponse] = await Promise.all([
            fetch(url),
            fetch(creditsUrl)
        ]);

        const episode = await episodeResponse.json();
        const credits = await creditsResponse.json();

        return { episode, credits };
    } catch (error) {
        console.error('Error fetching episode details:', error);
        return null;
    }
}
