const db = require('./db');

// JokeModel class to interact with the database
class JokeModel {
    // Get all categories
    static async getAllCategories() {
        try {
            const result = await db.query('SELECT name FROM categories ORDER BY name');
            return result.rows.map(row => row.name);
        } catch (error) {
            console.error('Error getting categories:', error);
            throw error;
        }
    }

    // Get jokes by category with optional limit
    static async getJokesByCategory(category, limit = null) {
        try {
            let query = `
                SELECT j.setup, j.delivery 
                FROM jokes j 
                JOIN categories c ON j.category_id = c.id 
                WHERE c.name = $1
                ORDER BY j.id
            `;
            
            const params = [category];
            
            if (limit && !isNaN(limit)) {
                query += ' LIMIT $2';
                params.push(parseInt(limit));
            }
            
            const result = await db.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('Error getting jokes by category:', error);
            throw error;
        }
    }

    // Get a random joke
    static async getRandomJoke() {
        try {
            const result = await db.query(`
                SELECT j.setup, j.delivery, c.name as category
                FROM jokes j 
                JOIN categories c ON j.category_id = c.id 
                ORDER BY RANDOM() 
                LIMIT 1
            `);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error getting random joke:', error);
            throw error;
        }
    }

    // Add a new joke
    static async addJoke(category, setup, delivery) {
        try {
            // Start a transaction
            const client = await db.pool.connect();
            
            try {
                await client.query('BEGIN');

                // Get or create category
                let categoryResult = await client.query(
                    'SELECT id FROM categories WHERE name = $1',
                    [category]
                );

                let categoryId;
                
                if (categoryResult.rows.length === 0) {
                    // Category doesn't exist, create it
                    const newCategory = await client.query(
                        'INSERT INTO categories (name) VALUES ($1) RETURNING id',
                        [category]
                    );
                    categoryId = newCategory.rows[0].id;
                } else {
                    categoryId = categoryResult.rows[0].id;
                }

                // Insert the joke
                await client.query(
                    'INSERT INTO jokes (category_id, setup, delivery) VALUES ($1, $2, $3)',
                    [categoryId, setup, delivery]
                );

                await client.query('COMMIT');

                // Return updated jokes for this category
                const updatedJokes = await this.getJokesByCategory(category);
                return updatedJokes;

            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Error adding joke:', error);
            throw error;
        }
    }

    // Check if a category exists
    static async categoryExists(category) {
        try {
            const result = await db.query(
                'SELECT id FROM categories WHERE name = $1',
                [category]
            );
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error checking category:', error);
            throw error;
        }
    }
}

module.exports = JokeModel;