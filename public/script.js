// API Base URL
const API_BASE = '/jokebook';

// DOM Elements
const randomSetupElement = document.getElementById('randomSetup');
const randomDeliveryElement = document.getElementById('randomDelivery');
const categoriesListElement = document.getElementById('categoriesList');
const jokesListElement = document.getElementById('jokesList');
const searchResultsElement = document.getElementById('searchResults');
const addJokeFormElement = document.getElementById('addJokeForm');
const addJokeResultElement = document.getElementById('addJokeResult');

// Load random joke on page load
document.addEventListener('DOMContentLoaded', function() {
    loadRandomJoke();
});

// Load random joke
async function loadRandomJoke() {
    try {
        const response = await fetch(`${API_BASE}/random`);
        const joke = await response.json();
        
        randomSetupElement.textContent = joke.setup;
        randomDeliveryElement.textContent = joke.delivery;
    } catch (error) {
        console.error('Error loading random joke:', error);
        randomSetupElement.textContent = 'Failed to load joke. Please try again.';
        randomDeliveryElement.textContent = '';
    }
}

// Load categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/categories`);
        const categories = await response.json();
        
        // Clear existing categories
        categoriesListElement.innerHTML = '';
        
        if (categories.length === 0) {
            const noCategories = document.createElement('div');
            noCategories.className = 'info-message';
            noCategories.textContent = 'No categories found';
            categoriesListElement.appendChild(noCategories);
            return;
        }
        
        // Create category chips
        categories.forEach(category => {
            const categoryChip = document.createElement('div');
            categoryChip.className = 'category-chip';
            categoryChip.textContent = category;
            categoryChip.addEventListener('click', () => loadJokesByCategory(category));
            categoriesListElement.appendChild(categoryChip);
        });
        
    } catch (error) {
        console.error('Error loading categories:', error);
        categoriesListElement.innerHTML = '';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Failed to load categories';
        categoriesListElement.appendChild(errorDiv);
    }
}

// Load jokes by category
async function loadJokesByCategory(category, limit = null) {
    try {
        let url = `${API_BASE}/categories/${category}`;
        if (limit) {
            url += `?limit=${limit}`;
        }
        
        const response = await fetch(url);
        const jokes = await response.json();
        
        // Clear existing jokes
        jokesListElement.innerHTML = '';
        
        if (!jokes || jokes.length === 0) {
            const noJokes = document.createElement('div');
            noJokes.className = 'info-message';
            noJokes.textContent = 'No jokes found in this category';
            jokesListElement.appendChild(noJokes);
            return;
        }
        
        // Create joke elements
        jokes.forEach(joke => {
            const jokeItem = document.createElement('div');
            jokeItem.className = 'joke-item';
            
            const jokeSetup = document.createElement('div');
            jokeSetup.className = 'joke-setup';
            jokeSetup.textContent = joke.setup;
            
            const jokeDelivery = document.createElement('div');
            jokeDelivery.className = 'joke-delivery';
            jokeDelivery.textContent = joke.delivery;
            
            jokeItem.appendChild(jokeSetup);
            jokeItem.appendChild(jokeDelivery);
            jokesListElement.appendChild(jokeItem);
        });
        
    } catch (error) {
        console.error('Error loading jokes:', error);
        // Clear existing jokes
        jokesListElement.innerHTML = '';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Failed to load jokes';
        jokesListElement.appendChild(errorDiv);
    }
}

// Search category
async function searchCategory() {
    const category = document.getElementById('categorySearch').value;
    const limit = document.getElementById('jokeLimit').value;
    
    if (!category) {
        // Clear previous results
        searchResultsElement.innerHTML = '';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Please enter a category';
        searchResultsElement.appendChild(errorDiv);
        return;
    }
    
    await loadJokesByCategory(category, limit);
}

// Create message element helper function
function createMessageElement(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    return messageDiv;
}

// Add new joke
addJokeFormElement.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const jokeData = {
        category: formData.get('category'),
        setup: formData.get('setup'),
        delivery: formData.get('delivery')
    };
    
    try {
        // Clear previous results   
        addJokeResultElement.innerHTML = '';
        
        const response = await fetch(`${API_BASE}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jokeData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            const successMsg = createMessageElement('Joke added successfully!', 'success');
            addJokeResultElement.appendChild(successMsg);
            this.reset();
            // Reload jokes for this category
            await loadJokesByCategory(jokeData.category);
        } else {
            const errorMsg = createMessageElement(`Error: ${result.error}`, 'error');
            addJokeResultElement.appendChild(errorMsg);
        }
    } catch (error) {
        console.error('Error adding joke:', error);
        addJokeResultElement.innerHTML = '';
        const errorMsg = createMessageElement('Failed to add joke', 'error');
        addJokeResultElement.appendChild(errorMsg);
    }
});

// Helper function to clear and set content safely
function clearAndSetContent(container, contentElements) {
    // Clear existing content
    container.innerHTML = '';
    if (Array.isArray(contentElements)) {
        contentElements.forEach(element => container.appendChild(element));
    } else {
        container.appendChild(contentElements);
    }
}