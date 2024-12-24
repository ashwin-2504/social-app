const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 5000;

app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database('db/social_media.db');

// Example route to get all users
app.get('/api/users', (req, res) => {
    db.all("SELECT * FROM users", (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ users: rows });
    });
});

// Example route to get all posts with associated users
app.get('/api/posts', (req, res) => {
    const query = `
        SELECT posts.id, posts.content, posts.created_at, posts.likes_count, users.username 
        FROM posts
        JOIN users ON posts.user_id = users.id
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ posts: rows }); // Send posts with username and likes_count
    });
});

// Example route to create a new user
app.post('/api/users', (req, res) => {
    const { username, email, password } = req.body;
    const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;

    db.run(query, [username, email, password], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, username, email });
    });
});

// Example route to create a new post (now with user_id and likes_count)
app.post('/api/posts', (req, res) => {
    const { user_id, content, likes_count = 0, created_at = new Date().toISOString() } = req.body;
    const query = `INSERT INTO posts (user_id, content, likes_count, created_at) VALUES (?, ?, ?, ?)`;

    db.run(query, [user_id, content, likes_count, created_at], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, user_id, content, likes_count, created_at });
    });
});

// More routes for CRUD operations (posts, likes, etc.)

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
