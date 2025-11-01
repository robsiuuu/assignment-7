const express = require('express');
const JokeModel = require('./jokeModel');
const router = express.Router();

// GET /jokebook/categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await JokeModel.getAllCategories();
        res.json(categories);
    } catch (error) {
        console.error('Error in /categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// GET /jokebook/categories/:category
router.get('/categories/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const { limit } = req.query;
        
        const jokes = await JokeModel.getJokesByCategory(category, limit);
        
        if (jokes.length === 0) {
            // Check if category exists
            const categoryExists = await JokeModel.categoryExists(category);
            if (!categoryExists) {
                return res.status(404).json({ error: `Category '${category}' not found` });
            }
        }
        
        res.json(jokes);
    } catch (error) {
        console.error('Error in /category/:category:', error);
        res.status(500).json({ error: 'Failed to fetch jokes' });
    }
});

// GET /jokebook/random
router.get('/random', async (req, res) => {
    try {
        const randomJoke = await JokeModel.getRandomJoke();
        
        if (!randomJoke) {
            return res.status(404).json({ error: 'No jokes available in the database' });
        }
        
        res.json(randomJoke);
    } catch (error) {
        console.error('Error in /random:', error);
        res.status(500).json({ error: 'Failed to fetch random joke' });
    }
});

// POST /jokebook/joke/add
router.post('/add', async (req, res) => {
    try {
        const { category, setup, delivery } = req.body;
        
        // Validation
        if (!category || !setup || !delivery) {
            return res.status(400).json({ 
                error: 'Missing required parameters: category, setup, delivery' 
            });
        }
        
        if (typeof category !== 'string' || typeof setup !== 'string' || typeof delivery !== 'string') {
            return res.status(400).json({ 
                error: 'All parameters must be strings' 
            });
        }
        
        const updatedJokes = await JokeModel.addJoke(category, setup, delivery);
        
        res.json({
            message: 'Joke added successfully',
            jokes: updatedJokes
        });
        
    } catch (error) {
        console.error('Error in /joke/add:', error);
        res.status(500).json({ error: 'Failed to add joke' });
    }
});

module.exports = router;