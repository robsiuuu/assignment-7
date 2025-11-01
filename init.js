const db = require('./db');

// Initialize and seed the database
async function initializeDatabase() {
    try {
        console.log('Initializing database...');

        // Test connection first
        const connected = await db.testConnection();
        if (!connected) {
            throw new Error('Could not connect to database');
        }

        // Create tables
        await db.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS jokes (
                id SERIAL PRIMARY KEY,
                category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
                setup TEXT NOT NULL,
                delivery TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Tables created successfully');

        // Insert categories
        await db.query(`
            INSERT INTO categories (name) VALUES 
            ('funnyJoke'), 
            ('lameJoke')
            ON CONFLICT (name) DO NOTHING
        `);

        console.log('Categories inserted');

        // Get category IDs
        const funnyResult = await db.query("SELECT id FROM categories WHERE name = 'funnyJoke'");
        const lameResult = await db.query("SELECT id FROM categories WHERE name = 'lameJoke'");
        
        const funnyId = funnyResult.rows[0]?.id;
        const lameId = lameResult.rows[0]?.id;

        if (!funnyId || !lameId) {
            throw new Error('Could not find category IDs');
        }

        // Clear any existing jokes
        await db.query('DELETE FROM jokes');

        // Insert funny jokes
        const funnyJokes = [
            ['Why did the student eat his homework?', 'Because the teacher told him it was a piece of cake!'],
            ['What kind of tree fits in your hand?', 'A palm tree'],
            ['What is worse than raining cats and dogs?', 'Hailing taxis']
        ];

        for (const [setup, delivery] of funnyJokes) {
            await db.query(
                'INSERT INTO jokes (category_id, setup, delivery) VALUES ($1, $2, $3)',
                [funnyId, setup, delivery]
            );
        }

        // Insert lame jokes
        const lameJokes = [
            ['Which bear is the most condescending?', 'Pan-DUH'],
            ['What would the Terminator be called in his retirement?', 'The Exterminator']
        ];

        for (const [setup, delivery] of lameJokes) {
            await db.query(
                'INSERT INTO jokes (category_id, setup, delivery) VALUES ($1, $2, $3)',
                [lameId, setup, delivery]
            );
        }

        console.log('Jokes inserted successfully');
        
        // Verify
        const jokeCount = await db.query('SELECT COUNT(*) FROM jokes');
        const categoryCount = await db.query('SELECT COUNT(*) FROM categories');
        
        console.log(`Total categories: ${categoryCount.rows[0].count}`);
        console.log(`Total jokes: ${jokeCount.rows[0].count}`);
        
        console.log('Database initialization completed successfully!');
        
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log('Database setup complete!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Database setup failed:', error);
            process.exit(1);
        });
}

module.exports = { initializeDatabase };