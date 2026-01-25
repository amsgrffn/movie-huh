/**
 * CineMark - UI Functions
 * Handles user interface interactions
 */

/**
 * Display markdown output
 */
function showMarkdown(markdown) {
    const container = document.getElementById('outputContainer');
    container.innerHTML = `<div class="markdown-output">${escapeHtml(markdown)}</div>`;
}

/**
 * Display HTML preview
 */
function showHTML(html) {
    const container = document.getElementById('outputContainer');
    container.innerHTML = `<div class="html-preview">${html}</div>`;
}

/**
 * Switch between markdown and HTML views
 */
function switchView(view) {
    currentView = view;

    // Update button states
    const buttons = document.querySelectorAll('.view-toggle button');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Regenerate output if we have data
    if (currentMediaData) {
        generateOutput();
    }
}

/**
 * Copy output to clipboard
 */
async function copyToClipboard() {
    if (!currentMediaData) {
        showError('No data to copy');
        return;
    }

    const options = getOptions();
    let textToCopy;

    if (currentView === 'markdown') {
        textToCopy = generateMarkdown(currentMediaData, options);
    } else {
        textToCopy = generateHTML(currentMediaData, options);
    }

    try {
        await navigator.clipboard.writeText(textToCopy);

        // Show success feedback
        const btn = document.querySelector('.copy-btn');
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');

        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('copied');
        }, 2000);
    } catch (err) {
        showError('Failed to copy to clipboard');
        console.error(err);
    }
}

/**
 * Display error message
 */
function showError(message) {
    const container = document.getElementById('outputContainer');
    container.innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Generate and display output
 */
function generateOutput() {
    const options = getOptions();
    const markdown = generateMarkdown(currentMediaData, options);
    const html = generateHTML(currentMediaData, options);

    // Show/hide poster section
    const posterSection = document.getElementById('posterSection');
    const posterImage = document.getElementById('posterImage');
    const downloadBtn = document.getElementById('downloadPosterBtn');

    if (currentMediaData.Poster) {
        posterSection.style.display = 'block';
        posterImage.src = currentMediaData.Poster;
        posterImage.alt = `${currentMediaData.Title} poster`;

        // Set up download link
        const fileName = `${currentMediaData.Title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-poster.jpg`;
        downloadBtn.href = currentMediaData.Poster;
        downloadBtn.download = fileName;
    } else {
        posterSection.style.display = 'none';
    }

    // Check for missing ratings and show manual input if needed
    checkMissingRatings();

    if (currentView === 'markdown') {
        showMarkdown(markdown);
    } else {
        showHTML(html);
    }
}

/**
 * Check for missing ratings and show manual input fields
 */
function checkMissingRatings() {
    const manualRatingsSection = document.getElementById('manualRatingsSection');
    const manualRatingsGrid = document.getElementById('manualRatingsGrid');

    const missingRatings = [];

    // Only check relevant ratings based on media type
    if (currentMediaData.mediaType === 'movie') {
        if (!currentMediaData.imdbRating || currentMediaData.imdbRating === 'N/A') {
            missingRatings.push({ key: 'imdbRating', label: 'IMDb Rating', placeholder: 'e.g., 7.5', suffix: '/10' });
        }
        if (!currentMediaData.LetterboxdRating || currentMediaData.LetterboxdRating === 'N/A') {
            missingRatings.push({ key: 'LetterboxdRating', label: 'Letterboxd Rating', placeholder: 'e.g., 3.8', suffix: '/5' });
        }
        if (!currentMediaData.Metascore || currentMediaData.Metascore === 'N/A') {
            missingRatings.push({ key: 'Metascore', label: 'Metacritic Score', placeholder: 'e.g., 65', suffix: '/100' });
        }
        if (!currentMediaData.RottenTomatoes || currentMediaData.RottenTomatoes === 'N/A') {
            missingRatings.push({ key: 'RottenTomatoes', label: 'Rotten Tomatoes', placeholder: 'e.g., 75%', suffix: '' });
        }
    }

    // Common ratings
    if (!currentMediaData.TMDbRating || currentMediaData.TMDbRating === 'N/A') {
        missingRatings.push({ key: 'TMDbRating', label: 'TMDb Rating', placeholder: 'e.g., 7.2', suffix: '/10' });
    }

    if (missingRatings.length > 0) {
        manualRatingsSection.style.display = 'block';
        manualRatingsGrid.innerHTML = '';

        missingRatings.forEach(rating => {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'manual-rating-field';
            fieldDiv.innerHTML = `
                <label>${rating.label} ${rating.suffix}</label>
                <input type="text"
                       id="manual_${rating.key}"
                       placeholder="${rating.placeholder}"
                       data-key="${rating.key}">
            `;
            manualRatingsGrid.appendChild(fieldDiv);
        });
    } else {
        manualRatingsSection.style.display = 'none';
    }
}

/**
 * Update output with manually entered ratings
 */
function updateWithManualRatings() {
    const inputs = document.querySelectorAll('.manual-rating-field input');

    inputs.forEach(input => {
        const key = input.getAttribute('data-key');
        const value = input.value.trim();

        if (value) {
            currentMediaData[key] = value;
        }
    });

    // Hide manual ratings section
    document.getElementById('manualRatingsSection').style.display = 'none';

    // Regenerate output with updated data
    generateOutput();
}

/**
 * Switch media type (Movie/TV Show)
 */
function switchMediaType(type) {
    currentMediaType = type;

    // Update button states
    const buttons = document.querySelectorAll('.media-type-toggle button');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === type) {
            btn.classList.add('active');
        }
    });

    // Update UI labels
    const searchBtn = document.querySelector('.search-btn');
    const titleLabel = document.querySelector('label[for="movieTitle"]');
    const yearLabel = document.querySelector('label[for="movieYear"]');
    const titleInput = document.getElementById('movieTitle');

    if (type === 'tv') {
        searchBtn.textContent = '🔍 Search TV Show';
        titleLabel.textContent = 'TV Show Title';
        yearLabel.textContent = 'First Air Year (optional)';
        titleInput.placeholder = 'Enter TV show title...';
    } else {
        searchBtn.textContent = '🔍 Search Movie';
        titleLabel.textContent = 'Movie Title';
        yearLabel.textContent = 'Year (optional)';
        titleInput.placeholder = 'Enter movie title...';
    }

    // Show/hide TV-specific options
    const tvInfoCheckbox = document.getElementById('includeTVInfoGroup');
    const letterboxdCheckbox = document.getElementById('includeLetterboxdGroup');

    if (tvInfoCheckbox) {
        tvInfoCheckbox.style.display = type === 'tv' ? 'flex' : 'none';
    }
    if (letterboxdCheckbox) {
        // Letterboxd is primarily for movies
        letterboxdCheckbox.style.display = type === 'movie' ? 'flex' : 'none';
    }

    // Hide episode picker when switching to movie mode
    const episodePickerSection = document.getElementById('episodePickerSection');
    if (episodePickerSection && type === 'movie') {
        episodePickerSection.style.display = 'none';
    }
}

// Global state for episode picker
let currentTVId = null;
let currentSeasons = [];
let currentEpisodeData = null;

/**
 * Show the episode picker after a TV show is searched
 */
function showEpisodePicker(tvId, seasons) {
    currentTVId = tvId;
    currentSeasons = seasons || [];

    const episodePickerSection = document.getElementById('episodePickerSection');
    const seasonSelect = document.getElementById('seasonSelect');
    const episodeSelect = document.getElementById('episodeSelect');
    const fetchBtn = document.getElementById('fetchEpisodeBtn');

    // Reset state
    episodeSelect.innerHTML = '<option value="">-- Select Episode --</option>';
    episodeSelect.disabled = true;
    fetchBtn.disabled = true;

    // Populate seasons dropdown (filter out specials/season 0 if desired)
    seasonSelect.innerHTML = '<option value="">-- Select Season --</option>';
    currentSeasons.forEach(season => {
        if (season.season_number > 0) { // Skip specials
            const option = document.createElement('option');
            option.value = season.season_number;
            option.textContent = `Season ${season.season_number} (${season.episode_count} episodes)`;
            seasonSelect.appendChild(option);
        }
    });

    episodePickerSection.style.display = 'block';
}

/**
 * Handle season selection change
 */
async function onSeasonChange() {
    const seasonSelect = document.getElementById('seasonSelect');
    const episodeSelect = document.getElementById('episodeSelect');
    const fetchBtn = document.getElementById('fetchEpisodeBtn');
    const episodePreview = document.getElementById('episodePreview');

    const seasonNumber = seasonSelect.value;

    // Reset episode dropdown and preview
    episodeSelect.innerHTML = '<option value="">-- Loading Episodes --</option>';
    episodeSelect.disabled = true;
    fetchBtn.disabled = true;
    episodePreview.style.display = 'none';

    if (!seasonNumber || !currentTVId) {
        episodeSelect.innerHTML = '<option value="">-- Select Episode --</option>';
        return;
    }

    // Fetch episodes for this season
    const seasonData = await fetchSeasonEpisodes(currentTVId, seasonNumber);

    if (seasonData && seasonData.episodes) {
        episodeSelect.innerHTML = '<option value="">-- Select Episode --</option>';
        seasonData.episodes.forEach(ep => {
            const option = document.createElement('option');
            option.value = ep.episode_number;
            option.textContent = `${ep.episode_number}. ${ep.name}`;
            episodeSelect.appendChild(option);
        });
        episodeSelect.disabled = false;
    } else {
        episodeSelect.innerHTML = '<option value="">-- No episodes found --</option>';
    }
}

/**
 * Handle episode selection change
 */
function onEpisodeChange() {
    const episodeSelect = document.getElementById('episodeSelect');
    const fetchBtn = document.getElementById('fetchEpisodeBtn');

    fetchBtn.disabled = !episodeSelect.value;
}

/**
 * Fetch and display selected episode details
 */
async function fetchSelectedEpisode() {
    const seasonSelect = document.getElementById('seasonSelect');
    const episodeSelect = document.getElementById('episodeSelect');
    const episodePreview = document.getElementById('episodePreview');

    const seasonNumber = seasonSelect.value;
    const episodeNumber = episodeSelect.value;

    if (!seasonNumber || !episodeNumber || !currentTVId) {
        return;
    }

    episodePreview.innerHTML = '<div class="loading">Loading episode details...</div>';
    episodePreview.style.display = 'block';

    const result = await fetchEpisodeDetails(currentTVId, seasonNumber, episodeNumber);

    if (result && result.episode) {
        const ep = result.episode;
        const credits = result.credits;

        // Extract crew
        const directors = credits?.crew?.filter(c => c.job === 'Director').map(c => c.name) || [];
        const writers = credits?.crew?.filter(c => c.job === 'Writer' || c.department === 'Writing').map(c => c.name) || [];
        const guestStars = credits?.guest_stars?.slice(0, 5).map(g => g.name) || [];

        // Build episode data object
        currentEpisodeData = {
            mediaType: 'episode',
            ShowTitle: currentMediaData?.Title || 'Unknown Show',
            Title: ep.name || 'Unknown Episode',
            SeasonNumber: seasonNumber,
            EpisodeNumber: episodeNumber,
            AirDate: ep.air_date || 'N/A',
            Runtime: ep.runtime ? `${ep.runtime} min` : 'N/A',
            Plot: ep.overview || 'No synopsis available.',
            TMDbRating: ep.vote_average ? ep.vote_average.toFixed(1) : 'N/A',
            Director: directors.length > 0 ? directors.join(', ') : 'N/A',
            Writer: writers.length > 0 ? [...new Set(writers)].slice(0, 3).join(', ') : 'N/A',
            GuestStars: guestStars,
            StillImage: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : null
        };

        // Update the main output to show episode
        currentMediaData = currentEpisodeData;
        generateOutput();

        // Show preview
        episodePreview.innerHTML = `
            <div class="episode-info-card">
                <strong>Now showing:</strong> S${seasonNumber}E${episodeNumber} - ${escapeHtml(ep.name)}
                <br><small>The output above has been updated with episode details. Copy it as Markdown or HTML.</small>
            </div>
        `;
    } else {
        episodePreview.innerHTML = '<div class="error">Failed to load episode details. Please try again.</div>';
    }
}

/**
 * Reset to show TV show details instead of episode
 */
function showTVShowDetails() {
    // This would reset to the TV show data
    // For now, user can just search again
}
