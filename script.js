/**
 * CineSearch - Professional Movie Search App
 *
 * This application demonstrates:
 * 1. DOM Manipulation (Selecting elements, creating elements, modifying content)
 * 2. Promises & Fetch API (Asynchronous programming)
 * 3. Event Listeners
 * 4. Error Handling
 */

// --- DOM Elements Selection ---
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const movieResults = document.getElementById('movie-results');
const loadingIndicator = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');

// --- Watchlist DOM Elements ---
const tabSearch = document.getElementById('tab-search');
const tabWatchlist = document.getElementById('tab-watchlist');
const searchSection = document.getElementById('search-section');
const watchlistSection = document.getElementById('watchlist-section');
const watchlistResults = document.getElementById('watchlist-results');
const watchlistEmpty = document.getElementById('watchlist-empty');

// API URL (Unofficial IMDb Wrapper)
const API_BASE_URL = 'https://imdb.iamidiotareyoutoo.com/search?q=';

/**
 * Helper to escape HTML and prevent XSS
 */
function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Function to fetch movies from the API
 * Returns a Promise that resolves to the movie data
 */
function fetchMovies(query) {
    // Show loading spinner
    showLoading(true);
    clearResults();
    hideError();

    // Use the Fetch API (which returns a Promise)
    return fetch(`${API_BASE_URL}${encodeURIComponent(query)}`)
        .then(response => {
            // Check if the response is successful
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Log data for educational purposes
            console.log('API Data received:', data);

            if (data.ok && data.description && data.description.length > 0) {
                displayMovies(data.description);
            } else {
                showError('No movies found matching your search.');
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            showError('Oops! Something went wrong while fetching movies.');
        })
        .finally(() => {
            // Hide loading spinner regardless of success or failure
            showLoading(false);
        });
}

/**
 * Function to display movie cards in the DOM
 */
function displayMovies(movies) {
    // Clear previous results
    movieResults.innerHTML = '';

    movies.forEach(movie => {
        // Create the card element
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');

        // Extract movie details (handling potentially missing data)
        const title = movie['#TITLE'] || 'Unknown Title';
        const year = movie['#YEAR'] || 'N/A';
        const actors = movie['#ACTORS'] || 'Cast information unavailable';
        const posterUrl = movie['#IMG_POSTER'] || 'https://via.placeholder.com/350x500?text=No+Poster';

        // Set the inner HTML of the card (escaping variables for safety)
        movieCard.innerHTML = `
            <img src="${escapeHTML(posterUrl)}" alt="${escapeHTML(title)}" class="movie-poster" onerror="this.src='https://via.placeholder.com/350x500?text=No+Poster'">
            <div class="movie-info">
                <div>
                    <h3 class="movie-title">${escapeHTML(title)}</h3>
                    <span class="movie-year">${escapeHTML(year)}</span>
                </div>
                <p class="movie-actors"><strong>Cast:</strong> ${escapeHTML(actors)}</p>
                <button class="add-watchlist-btn">Add to Watchlist</button>
            </div>
        `;

        // Add event listener to the button
        const addBtn = movieCard.querySelector('.add-watchlist-btn');
        addBtn.addEventListener('click', () => {
            addToWatchlist(movie);
            addBtn.textContent = 'Added ✓';
            addBtn.style.borderColor = '#10b981';
            addBtn.style.color = '#10b981';
            addBtn.disabled = true;
        });

        // Append the card to the grid
        movieResults.appendChild(movieCard);
    });
}

/**
 * UI Helper Functions
 */

function showLoading(isLoading) {
    if (isLoading) {
        loadingIndicator.classList.remove('hidden');
        movieResults.classList.add('hidden');
    } else {
        loadingIndicator.classList.add('hidden');
        movieResults.classList.remove('hidden');
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    movieResults.innerHTML = ''; // Clear results if error occurs
}

function hideError() {
    errorMessage.classList.add('hidden');
}

function clearResults() {
    movieResults.innerHTML = '';
}

// --- Watchlist Persistence Logic (localStorage) ---

/**
 * Get watchlist from localStorage
 */
function getWatchlist() {
    const watchlist = localStorage.getItem('cineSearch_watchlist');
    return watchlist ? JSON.parse(watchlist) : [];
}

/**
 * Save watchlist to localStorage
 */
function saveWatchlist(watchlist) {
    localStorage.setItem('cineSearch_watchlist', JSON.stringify(watchlist));
}

/**
 * Add a movie to the watchlist
 */
function addToWatchlist(movie) {
    const watchlist = getWatchlist();

    // Check if movie already exists in watchlist
    const exists = watchlist.some(item => item.id === movie['#IMDB_ID']);

    if (exists) {
        alert('This movie is already in your watchlist!');
        return;
    }

    const watchlistItem = {
        id: movie['#IMDB_ID'],
        title: movie['#TITLE'],
        year: movie['#YEAR'],
        poster: movie['#IMG_POSTER'],
        actors: movie['#ACTORS'],
        rating: 0,
        comment: '',
        dateAdded: new Date().toISOString()
    };

    watchlist.push(watchlistItem);
    saveWatchlist(watchlist);

    // Switch to watchlist view to show the addition
    // switchTab('watchlist'); // Optional, maybe better to just show a "success" message
}

/**
 * Update a movie's details in the watchlist
 */
function updateWatchlistItem(id, rating, comment) {
    const watchlist = getWatchlist();
    const index = watchlist.findIndex(item => item.id === id);

    if (index !== -1) {
        watchlist[index].rating = rating;
        watchlist[index].comment = comment;
        saveWatchlist(watchlist);
    }
}

/**
 * Remove a movie from the watchlist
 */
function removeFromWatchlist(id) {
    let watchlist = getWatchlist();
    watchlist = watchlist.filter(item => item.id !== id);
    saveWatchlist(watchlist);
    renderWatchlist(); // Re-render to show changes
}

/**
 * Render the watchlist in the DOM
 */
function renderWatchlist() {
    const watchlist = getWatchlist();
    watchlistResults.innerHTML = '';

    if (watchlist.length === 0) {
        watchlistEmpty.classList.remove('hidden');
        return;
    }

    watchlistEmpty.classList.add('hidden');

    watchlist.forEach(item => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');

        movieCard.innerHTML = `
            <img src="${escapeHTML(item.poster)}" alt="${escapeHTML(item.title)}" class="movie-poster" onerror="this.src='https://via.placeholder.com/350x500?text=No+Poster'">
            <div class="movie-info">
                <div>
                    <h3 class="movie-title">${escapeHTML(item.title)}</h3>
                    <span class="movie-year">${escapeHTML(item.year)}</span>
                </div>

                <div class="watchlist-controls">
                    <label>Rating (1-10):</label>
                    <input type="number" class="rating-input" min="0" max="10" value="${escapeHTML(String(item.rating))}" data-id="${escapeHTML(item.id)}">

                    <label>Your Comment:</label>
                    <textarea class="comment-input" placeholder="Add a note..." data-id="${escapeHTML(item.id)}">${escapeHTML(item.comment)}</textarea>

                    <div class="watchlist-actions">
                        <span class="save-status hidden" id="status-${escapeHTML(item.id)}">Saved!</span>
                        <button class="remove-btn" data-id="${escapeHTML(item.id)}">Remove</button>
                    </div>
                </div>
            </div>
        `;

        // Event listeners for rating and comment updates
        const ratingInput = movieCard.querySelector('.rating-input');
        const commentInput = movieCard.querySelector('.comment-input');
        const removeBtn = movieCard.querySelector('.remove-btn');
        const statusMsg = movieCard.querySelector('.save-status');

        const handleUpdate = () => {
            updateWatchlistItem(item.id, ratingInput.value, commentInput.value);
            // Show temporary save feedback
            statusMsg.classList.remove('hidden');
            setTimeout(() => statusMsg.classList.add('hidden'), 2000);
        };

        ratingInput.addEventListener('change', handleUpdate);
        commentInput.addEventListener('input', debounce(handleUpdate, 1000));

        removeBtn.addEventListener('click', () => {
            if (confirm(`Are you sure you want to remove ${item.title} from your watchlist?`)) {
                removeFromWatchlist(item.id);
            }
        });

        watchlistResults.appendChild(movieCard);
    });
}

/**
 * Switch between Search and Watchlist tabs
 */
function switchTab(tab) {
    if (tab === 'search') {
        tabSearch.classList.add('active');
        tabWatchlist.classList.remove('active');
        searchSection.classList.remove('hidden');
        watchlistSection.classList.add('hidden');
    } else {
        tabSearch.classList.remove('active');
        tabWatchlist.classList.add('active');
        searchSection.classList.add('hidden');
        watchlistSection.classList.remove('hidden');
        renderWatchlist();
    }
}

/**
 * Debounce helper for textarea input
 */
function debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// --- Event Listeners ---

// Tab switching
tabSearch.addEventListener('click', () => switchTab('search'));
tabWatchlist.addEventListener('click', () => switchTab('watchlist'));

// Handle form submission
searchForm.addEventListener('submit', (event) => {
    // Prevent the default form submission (page reload)
    event.preventDefault();

    const query = searchInput.value.trim();

    if (query) {
        fetchMovies(query);
    } else {
        showError('Please enter a movie title to search.');
    }
});

// Optional: Auto-focus search input on load
window.addEventListener('load', () => {
    searchInput.focus();
});
