const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const app = express();
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const PORT = 5000;

app.use(express.json());

// Set up multer to handle image uploads (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

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

// Example route to get all posts with associated users and images
app.get('/api/posts', (req, res) => {
    const query = `
        SELECT posts.id, posts.data, posts.created_at, posts.likes_count, users.username, post_images.id AS image_id
        FROM posts
        JOIN users ON posts.user_id = users.id
        LEFT JOIN post_images ON post_images.post_id = posts.id
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const posts = rows.map(post => {
            return {
                ...post,
                image: post.image_id ? `http://localhost:5000/api/images/${post.image_id}` : null
            };
        });

        res.json({ posts });
    });
});


app.post('/api/posts', authenticateToken, upload.array('images', 10), (req, res) => {
    const { user_id, data, likes_count = 0, created_at = new Date().toISOString() } = req.body;

    // Check if the required fields are present
    if (!user_id || !data) {
        return res.status(400).json({ error: 'Missing required fields: user_id or data' });
    }

    // Insert the post content into the posts table
    const query = `INSERT INTO posts (user_id, data, likes_count, created_at) VALUES (?, ?, ?, ?)`;

    db.run(query, [user_id, data, likes_count, created_at], function (err) {
        if (err) {
            console.error('Error inserting post:', err);
            return res.status(500).json({ error: err.message });
        }

        const postId = this.lastID; // ID of the newly inserted post

        // If images are uploaded, insert them into the post_images table
        if (req.files.length > 0) {
            const imageQuery = `INSERT INTO post_images (post_id, image) VALUES (?, ?)`;

            // For each uploaded file, insert its buffer into the database
            const promises = req.files.map(file => {
                return new Promise((resolve, reject) => {
                    db.run(imageQuery, [postId, file.buffer], function (err) {
                        if (err) {
                            console.error('Error inserting image:', err);
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            });

            // Wait for all images to be inserted
            Promise.all(promises)
                .then(() => {
                    res.status(201).json({
                        message: 'Post created successfully with images.',
                        post_id: postId,
                        user_id,
                        data,
                        likes_count,
                        created_at,
                    });
                })
                .catch(err => {
                    res.status(500).json({ error: err.message });
                });
        } else {
            // If no images, return a success message without images
            res.status(201).json({
                message: 'Post created successfully without images.',
                post_id: postId,
                user_id,
                data,
                likes_count,
                created_at,
            });
        }
    });
});


// Example route to retrieve an image (in BLOB format) by its ID
app.get('/api/images/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT image FROM post_images WHERE id = ?';

    db.get(query, [id], (err, row) => {
        if (err || !row) {
            return res.status(404).json({ error: 'Image not found' });
        }

        res.setHeader('Content-Type', 'image/jpeg');
        res.send(row.image);  // Send the image as binary data (BLOB)
    });
});


// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.user = decoded; // Attach the user data to the request
        next();
    });
}


// Signup route
// Route to handle user sign-up
app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;

    // Check if email or username already exists
    db.get('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], async (err, row) => {
        if (row) {
            return res.status(400).json({ error: 'Email or Username already exists' });
        }

        try {
            // Hash the password before saving it in the database
            const hashedPassword = await argon2.hash(password);

            // Insert new user into the database
            const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
            db.run(query, [username, email, hashedPassword], function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.status(201).json({ message: 'User registered successfully' });
            });
        } catch (err) {
            return res.status(500).json({ error: 'Error hashing password' });
        }
    });
});


// Signin route
// Route to handle user sign-in
app.post('/api/signin', async (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
        if (err || !row) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        try {
            const isValid = await argon2.verify(row.password, password);
            if (!isValid) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }
            const token = jwt.sign({ id: row.id, email: row.email }, 'secretkey', { expiresIn: '1h' });
            res.json({ message: 'Sign-in successful', token });
        } catch (err) {
            return res.status(500).json({ error: 'Error verifying password' });
        }
    });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
