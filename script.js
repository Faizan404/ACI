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

// API URL (Unofficial IMDb Wrapper)
const API_BASE_URL = 'https://imdb.iamidiotareyoutoo.com/search?q=';

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

        // Set the inner HTML of the card
        movieCard.innerHTML = `
            <img src="${posterUrl}" alt="${title}" class="movie-poster" onerror="this.src='https://via.placeholder.com/350x500?text=No+Poster'">
            <div class="movie-info">
                <div>
                    <h3 class="movie-title">${title}</h3>
                    <span class="movie-year">${year}</span>
                </div>
                <p class="movie-actors"><strong>Cast:</strong> ${actors}</p>
            </div>
        `;

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

// --- Event Listeners ---

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
