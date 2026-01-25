# CineMark - Movie & TV Show Summary Generator

A client-side web application that aggregates movie and TV show data from multiple sources and generates formatted summaries in Markdown and HTML.

## Quick Start

**Just double-click `index.html`** to open the app in your browser. No server required!

## Project Structure

```
movie-huh/
├── index.html          # Main HTML file (entry point)
├── cinemark.html       # Original single-file version (backup)
├── css/
│   └── styles.css      # All styling (Apple-inspired design)
├── js/
│   ├── config.js       # Global state, constants, mock data
│   ├── urls.js         # URL helper functions for various sites
│   ├── api.js          # API functions (OMDb, TMDb)
│   ├── scraper.js      # Web scraping functions (CORS proxy)
│   ├── output.js       # Markdown/HTML generation
│   ├── ui.js           # UI interactions (copy, toggle, errors)
│   └── main.js         # Entry point, event listeners
└── CLAUDE.md           # This file
```

## Features

### Movie Search
- Fetches data from **OMDb API** (primary) with **TMDb API** fallback
- Scrapes ratings from IMDb, Metacritic, Rotten Tomatoes, Letterboxd
- Generates links to cast/crew profiles on Letterboxd
- High-resolution poster downloads from TMDb

### TV Show Search
- Uses **TMDb API** for comprehensive TV data
- Shows seasons, episodes, status, network information
- Fetches cast and creator information
- IMDb ratings via web scraping

### Output Options
- Toggle between **Markdown** and **HTML** preview
- Customizable output with 12+ checkbox options
- One-click copy to clipboard
- Manual rating entry for missing data

## API Keys Required

### OMDb API (for movies)
- Get a free key at: https://www.omdbapi.com/apikey.aspx
- Used for: Movie metadata, ratings, cast/crew

### TMDb API (for TV shows, optional for movies)
- Get a free key at: https://www.themoviedb.org/settings/api
- Used for: TV show data, high-res posters, additional crew info

## Data Sources

| Source | Data Provided | Method |
|--------|---------------|--------|
| OMDb API | Movie metadata, IMDb rating, Metascore | API |
| TMDb API | Movies & TV, posters, crew, TMDb rating | API |
| IMDb | Ratings | Web scraping |
| Metacritic | Metascore | Web scraping |
| Rotten Tomatoes | Tomatometer | Web scraping |
| Letterboxd | Ratings, profile links | Web scraping |

## Technical Notes

### CORS Proxy
Web scraping uses `api.allorigins.win` as a CORS proxy. This is necessary because browsers block cross-origin requests to sites like IMDb and Letterboxd.

### No Build Step Required
This app uses vanilla JavaScript with traditional `<script>` tags (not ES modules). This allows it to work when opened directly from the filesystem (`file://` protocol) without needing a local server.

### File Loading Order
Scripts must be loaded in this order (dependencies):
1. `config.js` - Global state and constants
2. `urls.js` - URL helpers (no dependencies)
3. `scraper.js` - Scraping functions (uses CORS_PROXY from config)
4. `api.js` - API functions (uses scraper functions)
5. `output.js` - Generation (uses url functions)
6. `ui.js` - UI functions (uses output functions)
7. `main.js` - Entry point (uses all above)

## Development

### Adding New Features
- **New data source**: Add scraping function to `scraper.js`
- **New output field**: Update `output.js` (both markdown and HTML generators)
- **New UI element**: Update `index.html` and `ui.js`
- **New API**: Add functions to `api.js`

### Mock Data
For testing without API keys, mock data for "Interstellar" (movie) and "Breaking Bad" (TV) is available in `config.js`.

## Known Limitations

1. **Scraping reliability**: Web scraping may break if target sites change their HTML structure
2. **CORS proxy**: Dependent on third-party proxy service availability
3. **Letterboxd**: Only works for movies (Letterboxd doesn't have TV shows)
4. **Rate limits**: Heavy usage may hit API rate limits

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge). Requires JavaScript enabled.
