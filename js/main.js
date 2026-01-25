/**
 * CineMark - Main Entry Point
 * Handles search orchestration and event listeners
 */

/**
 * Main search function - orchestrates movie or TV search
 */
function searchMedia() {
    const title = document.getElementById('movieTitle').value.trim();
    const year = document.getElementById('movieYear').value.trim();
    const apiKey = document.getElementById('apiKey').value.trim();

    if (!title) {
        showError(`Please enter a ${currentMediaType === 'tv' ? 'TV show' : 'movie'} title`);
        return;
    }

    if (currentMediaType === 'tv') {
        // TV shows use TMDb directly
        fetchTVShowFromAPI(title, year);
    } else {
        // Movies: try OMDb first, then TMDb fallback
        if (apiKey) {
            fetchMovieFromAPI(title, year, apiKey);
        } else {
            // Use mock data or show error
            document.getElementById('apiNotice').style.display = 'block';
            if (mockMovieData[title]) {
                currentMediaData = { ...mockMovieData[title], mediaType: 'movie' };
                generateOutput();
            } else {
                showError('Mock data only available for "Interstellar". Add an API key to search other movies.');
            }
        }
    }
}

// Keep backwards compatibility with old function name
function searchMovie() {
    searchMedia();
}

/**
 * Initialize event listeners when DOM is ready
 */
function initializeEventListeners() {
    // Checkbox change listeners for live output updates
    document.querySelectorAll('.checkbox-group input').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (currentMediaData) {
                generateOutput();
            }
        });
    });

    // Enter key to search
    document.getElementById('movieTitle').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchMedia();
    });

    document.getElementById('movieYear').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchMedia();
    });

    // Media type toggle buttons
    document.querySelectorAll('.media-type-toggle button').forEach(btn => {
        btn.addEventListener('click', () => {
            switchMediaType(btn.dataset.type);
        });
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeEventListeners);
