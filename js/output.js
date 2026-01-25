/**
 * CineMark - Output Generation
 * Generates markdown and HTML output for movies and TV shows
 */

/**
 * Get current checkbox options
 */
function getOptions() {
    return {
        includeTitle: document.getElementById('includeTitle').checked,
        includeYear: document.getElementById('includeYear').checked,
        includeRuntime: document.getElementById('includeRuntime').checked,
        includeGenres: document.getElementById('includeGenres').checked,
        includeTagline: document.getElementById('includeTagline').checked,
        includeRatings: document.getElementById('includeRatings').checked,
        includeLetterboxd: document.getElementById('includeLetterboxd').checked,
        includeTMDb: document.getElementById('includeTMDb').checked,
        includePlot: document.getElementById('includePlot').checked,
        includeCast: document.getElementById('includeCast').checked,
        includeCrew: document.getElementById('includeCrew').checked,
        includeLink: document.getElementById('includeLink').checked,
        // TV-specific options
        includeTVInfo: document.getElementById('includeTVInfo')?.checked ?? true
    };
}

/**
 * Generate markdown output for movies
 */
function generateMovieMarkdown(data, options) {
    let md = '';

    if (options.includeLink) {
        const slug = data.Title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        md += `# [${data.Title}`;
        if (options.includeYear && data.Year) {
            md += ` (${data.Year})`;
        }
        md += `](https://letterboxd.com/film/${slug}-${data.Year}/)\n\n`;
    } else if (options.includeTitle) {
        md += `# ${data.Title}`;
        if (options.includeYear && data.Year) {
            md += ` (${data.Year})`;
        }
        md += '\n\n';
    }

    if (options.includeTagline && data.Tagline) {
        md += `> *"${data.Tagline}"*\n\n`;
    }

    // Details section
    md += '## Details\n\n';
    if (options.includeRuntime && data.Runtime) {
        md += `- **Runtime:** ${data.Runtime}\n`;
    }
    if (options.includeGenres && data.Genre) {
        const genres = data.Genre.split(', ');
        const genreLinks = genres.map(genre => {
            let genreUrl = getLetterboxdGenreLink(genre);
            if (data.LetterboxdLinks?.genres) {
                const found = data.LetterboxdLinks.genres.find(g =>
                    g.name.toLowerCase() === genre.toLowerCase()
                );
                if (found) genreUrl = found.url;
            }
            return `[${genre}](${genreUrl})`;
        });
        md += `- **Genres:** ${genreLinks.join(', ')}\n`;
    }
    md += '\n';

    // Ratings
    if (options.includeRatings) {
        md += '## Ratings\n\n';
        if (data.imdbRating && data.imdbRating !== 'N/A') {
            const imdbUrl = getIMDbURL(data.imdbID);
            md += `- **IMDb:** [${data.imdbRating}/10](${imdbUrl})\n`;
        }
        if (options.includeLetterboxd && data.LetterboxdRating && data.LetterboxdRating !== 'N/A') {
            const letterboxdUrl = getLetterboxdURL(data.Title, data.Year);
            md += `- **Letterboxd:** [${data.LetterboxdRating}/5](${letterboxdUrl})\n`;
        }
        if (data.Metascore && data.Metascore !== 'N/A') {
            const metacriticUrl = getMetacriticURL(data.Title);
            md += `- **Metacritic:** [${data.Metascore}/100](${metacriticUrl})\n`;
        }
        if (data.RottenTomatoes && data.RottenTomatoes !== 'N/A') {
            const rtUrl = getRottenTomatoesURL(data.Title);
            md += `- **Rotten Tomatoes:** [${data.RottenTomatoes}](${rtUrl})\n`;
        }
        if (options.includeTMDb && data.TMDbRating && data.TMDbRating !== 'N/A') {
            const tmdbUrl = getTMDbURL(data.Title, data.Year);
            md += `- **TMDb:** [${data.TMDbRating}/10](${tmdbUrl})\n`;
        }
        md += '\n';
    }

    // Plot
    if (options.includePlot && data.Plot) {
        md += '## Plot Summary\n\n';
        md += `${data.Plot}\n\n`;
    }

    // Cast
    if (options.includeCast && data.Actors) {
        md += '## Cast\n\n';
        const actors = data.Actors.split(', ');
        const actorLinks = actors.map(actor => {
            let actorUrl = data.LetterboxdLinks?.cast?.[actor] || getLetterboxdActorLink(actor);
            return `[${actor}](${actorUrl})`;
        });
        md += `${actorLinks.join(', ')}\n\n`;
    }

    // Crew
    if (options.includeCrew) {
        md += '## Key Crew\n\n';
        if (data.Director && data.Director !== 'N/A') {
            const directorUrl = data.LetterboxdLinks?.crew?.[data.Director] || getLetterboxdDirectorLink(data.Director);
            md += `- **Director:** [${data.Director}](${directorUrl})\n`;
        }
        if (data.Writer && data.Writer !== 'N/A') {
            const writerUrl = data.LetterboxdLinks?.crew?.[data.Writer] || getTMDBSearchLink(data.Writer, 'person');
            md += `- **Writer:** [${data.Writer}](${writerUrl})\n`;
        }
        if (data.Cinematographer && data.Cinematographer !== 'N/A') {
            const cinematographerUrl = data.LetterboxdLinks?.crew?.[data.Cinematographer] || getTMDBSearchLink(data.Cinematographer, 'person');
            md += `- **Cinematographer:** [${data.Cinematographer}](${cinematographerUrl})\n`;
        }
        if (data.Editor && data.Editor !== 'N/A') {
            const editorUrl = data.LetterboxdLinks?.crew?.[data.Editor] || getTMDBSearchLink(data.Editor, 'person');
            md += `- **Editor:** [${data.Editor}](${editorUrl})\n`;
        }
        if (data.Producer && data.Producer !== 'N/A') {
            const producerUrl = data.LetterboxdLinks?.crew?.[data.Producer] || getTMDBSearchLink(data.Producer, 'person');
            md += `- **Producer:** [${data.Producer}](${producerUrl})\n`;
        }
    }

    return md;
}

/**
 * Generate markdown output for TV shows
 */
function generateTVMarkdown(data, options) {
    let md = '';

    if (options.includeTitle) {
        md += `# ${data.Title}`;
        if (options.includeYear && data.Year) {
            md += ` (${data.Year})`;
        }
        md += '\n\n';
    }

    if (options.includeTagline && data.Tagline) {
        md += `> *"${data.Tagline}"*\n\n`;
    }

    // TV Show Info
    if (options.includeTVInfo) {
        md += '## Show Info\n\n';
        if (data.Seasons && data.Seasons !== 'N/A') {
            md += `- **Seasons:** ${data.Seasons}\n`;
        }
        if (data.Episodes && data.Episodes !== 'N/A') {
            md += `- **Episodes:** ${data.Episodes}\n`;
        }
        if (data.Status && data.Status !== 'N/A') {
            md += `- **Status:** ${data.Status}\n`;
        }
        if (data.Network && data.Network !== 'N/A') {
            md += `- **Network:** ${data.Network}\n`;
        }
        if (data.FirstAirDate && data.FirstAirDate !== 'N/A') {
            md += `- **First Aired:** ${data.FirstAirDate}\n`;
        }
        if (data.LastAirDate && data.LastAirDate !== 'N/A' && data.Status === 'Ended') {
            md += `- **Last Aired:** ${data.LastAirDate}\n`;
        }
        md += '\n';
    }

    // Details section
    md += '## Details\n\n';
    if (options.includeRuntime && data.Runtime) {
        md += `- **Episode Runtime:** ${data.Runtime}\n`;
    }
    if (options.includeGenres && data.Genre) {
        md += `- **Genres:** ${data.Genre}\n`;
    }
    md += '\n';

    // Ratings
    if (options.includeRatings) {
        md += '## Ratings\n\n';
        if (data.imdbRating && data.imdbRating !== 'N/A') {
            const imdbUrl = getIMDbURL(data.imdbID);
            md += `- **IMDb:** [${data.imdbRating}/10](${imdbUrl})\n`;
        }
        if (options.includeTMDb && data.TMDbRating && data.TMDbRating !== 'N/A') {
            const tmdbUrl = getTMDbURL(data.Title, data.Year, 'tv');
            md += `- **TMDb:** [${data.TMDbRating}/10](${tmdbUrl})\n`;
        }
        md += '\n';
    }

    // Plot
    if (options.includePlot && data.Plot) {
        md += '## Synopsis\n\n';
        md += `${data.Plot}\n\n`;
    }

    // Cast
    if (options.includeCast && data.Actors) {
        md += '## Cast\n\n';
        const actors = data.Actors.split(', ');
        const actorLinks = actors.map(actor => {
            return `[${actor}](${getTMDBSearchLink(actor, 'person')})`;
        });
        md += `${actorLinks.join(', ')}\n\n`;
    }

    // Crew
    if (options.includeCrew && data.Creator && data.Creator !== 'N/A') {
        md += '## Created By\n\n';
        const creators = data.Creator.split(', ');
        const creatorLinks = creators.map(creator => {
            return `[${creator}](${getTMDBSearchLink(creator, 'person')})`;
        });
        md += `${creatorLinks.join(', ')}\n\n`;
    }

    return md;
}

/**
 * Generate HTML output for movies
 */
function generateMovieHTML(data, options) {
    let html = '<div class="movie-details">\n';

    if (options.includeTitle) {
        if (options.includeLink) {
            const slug = data.Title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            html += `  <h2><a href="https://letterboxd.com/film/${slug}-${data.Year}/">${data.Title}</a></h2>\n`;
        } else {
            html += `  <h2>${data.Title}</h2>\n`;
        }
    }

    // Year, Runtime, Genres as list
    if (options.includeYear || options.includeRuntime || options.includeGenres) {
        html += '  <ul>\n';
        if (options.includeYear && data.Year) {
            html += `    <li><strong>Year:</strong> ${data.Year}</li>\n`;
        }
        if (options.includeRuntime && data.Runtime) {
            html += `    <li><strong>Runtime:</strong> ${data.Runtime}</li>\n`;
        }
        if (options.includeGenres && data.Genre) {
            const genres = data.Genre.split(', ');
            const genreLinks = genres.map(genre => {
                let genreUrl = getLetterboxdGenreLink(genre);
                if (data.LetterboxdLinks?.genres) {
                    const found = data.LetterboxdLinks.genres.find(g =>
                        g.name.toLowerCase() === genre.toLowerCase()
                    );
                    if (found) genreUrl = found.url;
                }
                return `<a href="${genreUrl}" target="_blank">${genre}</a>`;
            });
            html += `    <li><strong>Genres:</strong> ${genreLinks.join(', ')}</li>\n`;
        }
        html += '  </ul>\n';
    }

    if (options.includeTagline && data.Tagline) {
        html += `  <p class="tagline"><em>"${data.Tagline}"</em></p>\n`;
    }

    // Ratings as list
    if (options.includeRatings) {
        html += '  <h3>Ratings</h3>\n';
        html += '  <ul>\n';
        if (data.imdbRating && data.imdbRating !== 'N/A') {
            const imdbUrl = getIMDbURL(data.imdbID);
            html += `    <li><strong>IMDb:</strong> <a href="${imdbUrl}" target="_blank">${data.imdbRating}/10</a></li>\n`;
        }
        if (options.includeLetterboxd && data.LetterboxdRating && data.LetterboxdRating !== 'N/A') {
            const letterboxdUrl = getLetterboxdURL(data.Title, data.Year);
            html += `    <li><strong>Letterboxd:</strong> <a href="${letterboxdUrl}" target="_blank">${data.LetterboxdRating}/5</a></li>\n`;
        }
        if (data.Metascore && data.Metascore !== 'N/A') {
            const metacriticUrl = getMetacriticURL(data.Title);
            html += `    <li><strong>Metacritic:</strong> <a href="${metacriticUrl}" target="_blank">${data.Metascore}/100</a></li>\n`;
        }
        if (data.RottenTomatoes && data.RottenTomatoes !== 'N/A') {
            const rtUrl = getRottenTomatoesURL(data.Title);
            html += `    <li><strong>Rotten Tomatoes:</strong> <a href="${rtUrl}" target="_blank">${data.RottenTomatoes}</a></li>\n`;
        }
        if (options.includeTMDb && data.TMDbRating && data.TMDbRating !== 'N/A') {
            const tmdbUrl = getTMDbURL(data.Title, data.Year);
            html += `    <li><strong>TMDb:</strong> <a href="${tmdbUrl}" target="_blank">${data.TMDbRating}/10</a></li>\n`;
        }
        html += '  </ul>\n';
    }

    if (options.includePlot && data.Plot) {
        html += `  <h3>Plot Summary</h3>\n  <p>${data.Plot}</p>\n`;
    }

    if (options.includeCast && data.Actors) {
        html += '  <h3>Cast</h3>\n  <p>';
        const actors = data.Actors.split(', ');
        const actorLinks = actors.map(actor => {
            let actorUrl = data.LetterboxdLinks?.cast?.[actor] || getLetterboxdActorLink(actor);
            return `<a href="${actorUrl}" target="_blank">${actor}</a>`;
        });
        html += actorLinks.join(', ');
        html += '</p>\n';
    }

    if (options.includeCrew) {
        html += '  <h3>Key Crew</h3>\n  <p>\n';
        if (data.Director && data.Director !== 'N/A') {
            const directorUrl = data.LetterboxdLinks?.crew?.[data.Director] || getLetterboxdDirectorLink(data.Director);
            html += `    <strong>Director:</strong> <a href="${directorUrl}" target="_blank">${data.Director}</a><br>\n`;
        }
        if (data.Writer && data.Writer !== 'N/A') {
            const writerUrl = data.LetterboxdLinks?.crew?.[data.Writer] || getTMDBSearchLink(data.Writer, 'person');
            html += `    <strong>Writer:</strong> <a href="${writerUrl}" target="_blank">${data.Writer}</a><br>\n`;
        }
        if (data.Cinematographer && data.Cinematographer !== 'N/A') {
            const cinematographerUrl = data.LetterboxdLinks?.crew?.[data.Cinematographer] || getTMDBSearchLink(data.Cinematographer, 'person');
            html += `    <strong>Cinematographer:</strong> <a href="${cinematographerUrl}" target="_blank">${data.Cinematographer}</a><br>\n`;
        }
        if (data.Editor && data.Editor !== 'N/A') {
            const editorUrl = data.LetterboxdLinks?.crew?.[data.Editor] || getTMDBSearchLink(data.Editor, 'person');
            html += `    <strong>Editor:</strong> <a href="${editorUrl}" target="_blank">${data.Editor}</a><br>\n`;
        }
        if (data.Producer && data.Producer !== 'N/A') {
            const producerUrl = data.LetterboxdLinks?.crew?.[data.Producer] || getTMDBSearchLink(data.Producer, 'person');
            html += `    <strong>Producer:</strong> <a href="${producerUrl}" target="_blank">${data.Producer}</a>\n`;
        }
        html += '  </p>\n';
    }

    html += '</div>';
    return html;
}

/**
 * Generate HTML output for TV shows
 */
function generateTVHTML(data, options) {
    let html = '<div class="movie-details">\n';

    if (options.includeTitle) {
        html += `  <h2>${escapeHtml(data.Title)}</h2>\n`;
    }

    // TV Show specific info
    if (options.includeTVInfo) {
        html += '  <div class="tv-info">\n';
        if (data.Seasons && data.Seasons !== 'N/A') {
            html += `    <span class="tv-info-item"><strong>Seasons:</strong> ${data.Seasons}</span>\n`;
        }
        if (data.Episodes && data.Episodes !== 'N/A') {
            html += `    <span class="tv-info-item"><strong>Episodes:</strong> ${data.Episodes}</span>\n`;
        }
        if (data.Status && data.Status !== 'N/A') {
            html += `    <span class="tv-info-item"><strong>Status:</strong> ${data.Status}</span>\n`;
        }
        if (data.Network && data.Network !== 'N/A') {
            html += `    <span class="tv-info-item"><strong>Network:</strong> ${data.Network}</span>\n`;
        }
        html += '  </div>\n';
    }

    // Year, Runtime, Genres as list
    if (options.includeYear || options.includeRuntime || options.includeGenres) {
        html += '  <ul>\n';
        if (options.includeYear && data.Year) {
            html += `    <li><strong>Year:</strong> ${data.Year}</li>\n`;
        }
        if (options.includeRuntime && data.Runtime) {
            html += `    <li><strong>Episode Runtime:</strong> ${data.Runtime}</li>\n`;
        }
        if (options.includeGenres && data.Genre) {
            html += `    <li><strong>Genres:</strong> ${data.Genre}</li>\n`;
        }
        html += '  </ul>\n';
    }

    if (options.includeTagline && data.Tagline) {
        html += `  <p class="tagline"><em>"${escapeHtml(data.Tagline)}"</em></p>\n`;
    }

    // Ratings
    if (options.includeRatings) {
        html += '  <h3>Ratings</h3>\n';
        html += '  <ul>\n';
        if (data.imdbRating && data.imdbRating !== 'N/A') {
            const imdbUrl = getIMDbURL(data.imdbID);
            html += `    <li><strong>IMDb:</strong> <a href="${imdbUrl}" target="_blank">${data.imdbRating}/10</a></li>\n`;
        }
        if (options.includeTMDb && data.TMDbRating && data.TMDbRating !== 'N/A') {
            const tmdbUrl = getTMDbURL(data.Title, data.Year, 'tv');
            html += `    <li><strong>TMDb:</strong> <a href="${tmdbUrl}" target="_blank">${data.TMDbRating}/10</a></li>\n`;
        }
        html += '  </ul>\n';
    }

    if (options.includePlot && data.Plot) {
        html += `  <h3>Synopsis</h3>\n  <p>${escapeHtml(data.Plot)}</p>\n`;
    }

    if (options.includeCast && data.Actors) {
        html += '  <h3>Cast</h3>\n  <p>';
        const actors = data.Actors.split(', ');
        const actorLinks = actors.map(actor => {
            return `<a href="${getTMDBSearchLink(actor, 'person')}" target="_blank">${escapeHtml(actor)}</a>`;
        });
        html += actorLinks.join(', ');
        html += '</p>\n';
    }

    if (options.includeCrew && data.Creator && data.Creator !== 'N/A') {
        html += '  <h3>Created By</h3>\n  <p>';
        const creators = data.Creator.split(', ');
        const creatorLinks = creators.map(creator => {
            return `<a href="${getTMDBSearchLink(creator, 'person')}" target="_blank">${escapeHtml(creator)}</a>`;
        });
        html += creatorLinks.join(', ');
        html += '</p>\n';
    }

    html += '</div>';
    return html;
}

/**
 * Main HTML generation function
 */
function generateHTML(data, options) {
    if (data.mediaType === 'episode') {
        return generateEpisodeHTML(data, options);
    }
    if (data.mediaType === 'tv') {
        return generateTVHTML(data, options);
    }
    return generateMovieHTML(data, options);
}

/**
 * Generate markdown output for TV episode
 */
function generateEpisodeMarkdown(data, options) {
    let md = '';

    // Title with show name
    if (options.includeTitle) {
        md += `# ${data.ShowTitle}\n\n`;
        md += `## Season ${data.SeasonNumber}, Episode ${data.EpisodeNumber}: ${data.Title}\n\n`;
    }

    // Air date and runtime
    md += '## Episode Details\n\n';
    if (data.AirDate && data.AirDate !== 'N/A') {
        md += `- **Air Date:** ${data.AirDate}\n`;
    }
    if (options.includeRuntime && data.Runtime) {
        md += `- **Runtime:** ${data.Runtime}\n`;
    }
    if (data.TMDbRating && data.TMDbRating !== 'N/A') {
        md += `- **TMDb Rating:** ${data.TMDbRating}/10\n`;
    }
    md += '\n';

    // Plot
    if (options.includePlot && data.Plot) {
        md += '## Synopsis\n\n';
        md += `${data.Plot}\n\n`;
    }

    // Director and Writer
    if (options.includeCrew) {
        const hasCrew = (data.Director && data.Director !== 'N/A') || (data.Writer && data.Writer !== 'N/A');
        if (hasCrew) {
            md += '## Crew\n\n';
            if (data.Director && data.Director !== 'N/A') {
                md += `- **Directed by:** ${data.Director}\n`;
            }
            if (data.Writer && data.Writer !== 'N/A') {
                md += `- **Written by:** ${data.Writer}\n`;
            }
            md += '\n';
        }
    }

    // Guest Stars
    if (options.includeCast && data.GuestStars && data.GuestStars.length > 0) {
        md += '## Guest Stars\n\n';
        md += data.GuestStars.join(', ') + '\n\n';
    }

    return md;
}

/**
 * Generate HTML output for TV episode
 */
function generateEpisodeHTML(data, options) {
    let html = '<div class="movie-details episode-details">\n';

    // Title with show name
    if (options.includeTitle) {
        html += `  <h2>${escapeHtml(data.ShowTitle)}</h2>\n`;
        html += `  <h3>Season ${data.SeasonNumber}, Episode ${data.EpisodeNumber}: ${escapeHtml(data.Title)}</h3>\n`;
    }

    // Episode still image
    if (data.StillImage) {
        html += `  <img src="${data.StillImage}" alt="Episode still" class="episode-still">\n`;
    }

    // Episode info
    html += '  <ul>\n';
    if (data.AirDate && data.AirDate !== 'N/A') {
        html += `    <li><strong>Air Date:</strong> ${data.AirDate}</li>\n`;
    }
    if (options.includeRuntime && data.Runtime) {
        html += `    <li><strong>Runtime:</strong> ${data.Runtime}</li>\n`;
    }
    if (data.TMDbRating && data.TMDbRating !== 'N/A') {
        html += `    <li><strong>TMDb Rating:</strong> ${data.TMDbRating}/10</li>\n`;
    }
    html += '  </ul>\n';

    // Plot
    if (options.includePlot && data.Plot) {
        html += `  <h4>Synopsis</h4>\n  <p>${escapeHtml(data.Plot)}</p>\n`;
    }

    // Crew
    if (options.includeCrew) {
        const hasCrew = (data.Director && data.Director !== 'N/A') || (data.Writer && data.Writer !== 'N/A');
        if (hasCrew) {
            html += '  <h4>Crew</h4>\n  <ul>\n';
            if (data.Director && data.Director !== 'N/A') {
                html += `    <li><strong>Directed by:</strong> ${escapeHtml(data.Director)}</li>\n`;
            }
            if (data.Writer && data.Writer !== 'N/A') {
                html += `    <li><strong>Written by:</strong> ${escapeHtml(data.Writer)}</li>\n`;
            }
            html += '  </ul>\n';
        }
    }

    // Guest Stars
    if (options.includeCast && data.GuestStars && data.GuestStars.length > 0) {
        html += '  <h4>Guest Stars</h4>\n';
        html += `  <p>${data.GuestStars.map(g => escapeHtml(g)).join(', ')}</p>\n`;
    }

    html += '</div>';
    return html;
}

/**
 * Main markdown generation function (updated for episodes)
 */
function generateMarkdown(data, options) {
    if (data.mediaType === 'episode') {
        return generateEpisodeMarkdown(data, options);
    }
    if (data.mediaType === 'tv') {
        return generateTVMarkdown(data, options);
    }
    return generateMovieMarkdown(data, options);
}
