/**
 * CineMark - Web Scraping Functions
 * Handles scraping ratings from various sources using CORS proxy
 */

/**
 * Scrape IMDb rating from their website
 */
async function scrapeIMDbRating(imdbID) {
    if (!imdbID || imdbID === 'N/A') return 'N/A';

    try {
        const imdbUrl = `https://www.imdb.com/title/${imdbID}/`;
        const proxyUrl = `${CORS_PROXY}${encodeURIComponent(imdbUrl)}`;

        const response = await fetch(proxyUrl);
        const data = await response.json();

        if (data.contents) {
            // Try regex pattern first (most reliable)
            const ratingMatch = data.contents.match(/"ratingValue":"?([\d.]+)"?/);
            if (ratingMatch && ratingMatch[1]) {
                return ratingMatch[1];
            }

            const parser = new DOMParser();
            const doc = parser.parseFromString(data.contents, 'text/html');

            // Try to find rating in JSON-LD
            const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
            for (const script of scripts) {
                try {
                    const jsonData = JSON.parse(script.textContent);
                    if (jsonData.aggregateRating?.ratingValue) {
                        return jsonData.aggregateRating.ratingValue.toString();
                    }
                } catch (e) {
                    continue;
                }
            }
        }

        console.log('Could not scrape IMDb rating for', imdbID);
        return 'N/A';
    } catch (error) {
        console.error('Error scraping IMDb rating:', error);
        return 'N/A';
    }
}

/**
 * Scrape Metacritic score
 */
async function scrapeMetacriticScore(title, mediaType = 'movie') {
    try {
        const slug = title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');

        const path = mediaType === 'tv' ? 'tv' : 'movie';
        const metacriticUrl = `https://www.metacritic.com/${path}/${slug}/`;
        const proxyUrl = `${CORS_PROXY}${encodeURIComponent(metacriticUrl)}`;

        const response = await fetch(proxyUrl);
        const data = await response.json();

        if (data.contents) {
            // Try regex pattern
            const scoreMatch = data.contents.match(/metascore_w.*?>(\d+)</i);
            if (scoreMatch && scoreMatch[1]) {
                return scoreMatch[1];
            }

            const parser = new DOMParser();
            const doc = parser.parseFromString(data.contents, 'text/html');

            // Try multiple selectors
            const selectors = [
                '.c-siteReviewScore span',
                '[data-v-4cdca9fc] span',
                '.metascore_w'
            ];

            for (const selector of selectors) {
                const element = doc.querySelector(selector);
                if (element && element.textContent.trim()) {
                    const score = element.textContent.trim();
                    if (/^\d+$/.test(score)) {
                        return score;
                    }
                }
            }
        }

        console.log('Could not scrape Metacritic score for', title);
        return 'N/A';
    } catch (error) {
        console.error('Error scraping Metacritic score:', error);
        return 'N/A';
    }
}

/**
 * Scrape Rotten Tomatoes score
 */
async function scrapeRottenTomatoesScore(title, mediaType = 'movie') {
    try {
        const slug = title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '_')
            .replace(/\s+/g, '_')
            .replace(/_+/g, '_');

        const path = mediaType === 'tv' ? 'tv' : 'm';
        const rtUrl = `https://www.rottentomatoes.com/${path}/${slug}`;
        const proxyUrl = `${CORS_PROXY}${encodeURIComponent(rtUrl)}`;

        const response = await fetch(proxyUrl);
        const data = await response.json();

        if (data.contents) {
            // Try regex pattern
            const scoreMatch = data.contents.match(/tomatometerscore['"]\s*:\s*['"]([\d]+)['"]/i);
            if (scoreMatch && scoreMatch[1]) {
                return `${scoreMatch[1]}%`;
            }

            const parser = new DOMParser();
            const doc = parser.parseFromString(data.contents, 'text/html');

            // Try to find tomatometer score
            const scoreElement = doc.querySelector('score-board[tomatometerscore]');
            if (scoreElement) {
                const score = scoreElement.getAttribute('tomatometerscore');
                if (score) {
                    return `${score}%`;
                }
            }
        }

        console.log('Could not scrape Rotten Tomatoes score for', title);
        return 'N/A';
    } catch (error) {
        console.error('Error scraping Rotten Tomatoes score:', error);
        return 'N/A';
    }
}

/**
 * Fetch Letterboxd rating for a movie
 */
async function fetchLetterboxdRating(title, year) {
    try {
        // Create Letterboxd-style slug
        const slug = title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');

        const letterboxdUrl = `https://letterboxd.com/film/${slug}-${year}/`;
        const proxyUrl = `${CORS_PROXY}${encodeURIComponent(letterboxdUrl)}`;

        const response = await fetch(proxyUrl);
        const data = await response.json();

        if (data.contents) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.contents, 'text/html');

            // Letterboxd stores rating in meta tag
            const ratingMeta = doc.querySelector('meta[name="twitter:data2"]');
            if (ratingMeta) {
                const ratingText = ratingMeta.getAttribute('content');
                const rating = ratingText.match(/[\d.]+/)?.[0];
                return rating || "N/A";
            }

            // Alternative: try to find in JSON-LD
            const scriptTag = doc.querySelector('script[type="application/ld+json"]');
            if (scriptTag) {
                const jsonData = JSON.parse(scriptTag.textContent);
                if (jsonData.aggregateRating?.ratingValue) {
                    return jsonData.aggregateRating.ratingValue.toString();
                }
            }
        }

        return "N/A";
    } catch (error) {
        console.error('Error fetching Letterboxd rating:', error);
        return "N/A";
    }
}

/**
 * Fetch Letterboxd links for cast, crew, and genres
 */
async function fetchLetterboxdLinks(title, year) {
    try {
        const slug = title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');

        const letterboxdUrl = `https://letterboxd.com/film/${slug}-${year}/`;
        const proxyUrl = `${CORS_PROXY}${encodeURIComponent(letterboxdUrl)}`;

        const response = await fetch(proxyUrl);
        const data = await response.json();

        if (!data.contents) return null;

        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');

        const links = {
            cast: {},
            crew: {},
            genres: []
        };

        // Extract cast links
        const castLinks = doc.querySelectorAll('a[href*="/actor/"]');
        castLinks.forEach(link => {
            const name = link.textContent.trim();
            const href = link.getAttribute('href');
            if (name && href) {
                links.cast[name] = `https://letterboxd.com${href}`;
            }
        });

        // Extract crew links (director, writer, producer)
        const directorLinks = doc.querySelectorAll('a[href*="/director/"]');
        directorLinks.forEach(link => {
            const name = link.textContent.trim();
            const href = link.getAttribute('href');
            if (name && href) {
                links.crew[name] = `https://letterboxd.com${href}`;
            }
        });

        // Extract genre links
        const genreLinks = doc.querySelectorAll('a[href*="/films/genre/"]');
        genreLinks.forEach(link => {
            const genre = link.textContent.trim();
            const href = link.getAttribute('href');
            if (genre && href) {
                links.genres.push({
                    name: genre,
                    url: `https://letterboxd.com${href}`
                });
            }
        });

        return links;
    } catch (error) {
        console.error('Error fetching Letterboxd links:', error);
        return null;
    }
}
