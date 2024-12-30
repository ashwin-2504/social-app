const express = require('express');
const bodyParser = require('body-parser');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv');
const { v5: uuidv5 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

// Middleware
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Initialize SQLite database
const db = new sqlite3.Database('db/social_media.db');

// Secret key for JWT
const SECRET_KEY = process.env.SECRET_KEY || "mysecretkey";

// Helper Functions
const generateToken = (userId) => jwt.sign({ user_id: userId }, SECRET_KEY, { expiresIn: '24h' });

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access token missing or malformed' });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Routes
// Signup Route
app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const hashedPassword = await argon2.hash(password);
        const userId = uuidv5(`${username}:${email}`, NAMESPACE);

        db.run(
            `INSERT INTO users (user_id, username, email, password) VALUES (?, ?, ?, ?)`,
            [userId, username, email, hashedPassword],
            (err) => {
                if (err) {
                    if (err.message.includes('UNIQUE')) {
                        return res.status(400).json({ error: 'Username or email already exists' });
                    }
                    return res.status(500).json({ error: 'Database error' });
                }
                res.status(201).json({ message: 'User registered successfully' });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Error processing request' });
    }
});

// Signin Route
app.post('/api/signin', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    db.get(
        `SELECT * FROM users WHERE email = ?`,
        [email],
        async (err, user) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (!user) return res.status(400).json({ error: 'Invalid email or password' });

            const isMatch = await argon2.verify(user.password, password);
            if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

            const token = generateToken(user.user_id);
            res.json({ token, user_id: user.user_id, message: 'Signin successful' });
        }
    );
});

// Create Post Route
app.post('/api/posts', authenticateToken, upload.array('images', 10), (req, res) => {
    const { data } = req.body;
    const userId = req.user.user_id;

    if (!data && req.files.length === 0) {
        return res.status(400).json({ error: 'Text content or images are required' });
    }

    const timestamp = Date.now();
    const postId = uuidv5(`${userId}:${timestamp}`, NAMESPACE);

    db.run(
        `INSERT INTO posts (post_id, user_id, data, created_at) VALUES (?, ?, ?, ?)`,
        [postId, userId, data || null, new Date(timestamp).toISOString()],
        function (err) {
            if (err) return res.status(500).json({ error: 'Failed to create post' });

            if (req.files.length > 0) {
                const insertImagePromises = req.files.map((file) => {
                    return new Promise((resolve, reject) => {
                        db.run(
                            `INSERT INTO post_images (post_id, image) VALUES (?, ?)`,
                            [postId, file.filename],
                            (err) => (err ? reject(err) : resolve())
                        );
                    });
                });

                Promise.all(insertImagePromises)
                    .then(() => res.status(201).json({ message: 'Post created successfully', postId }))
                    .catch(() => res.status(500).json({ error: 'Failed to upload images' }));
            } else {
                res.status(201).json({ message: 'Post created successfully', postId });
            }
        }
    );
});

// Fetch Posts Route
app.get('/api/posts', (req, res) => {
    const query = `
        SELECT 
            posts.post_id AS id,
            users.username,
            posts.data,
            posts.created_at,
            GROUP_CONCAT(post_images.image) AS images
        FROM posts
        INNER JOIN users ON posts.user_id = users.user_id
        LEFT JOIN post_images ON posts.post_id = post_images.post_id
        GROUP BY posts.post_id
        ORDER BY posts.created_at DESC
    `;

    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch posts' });

        const posts = rows.map((row) => ({
            id: row.id,
            username: row.username,
            data: row.data,
            created_at: row.created_at,
            images: row.images ? row.images.split(',').map((image) => `/uploads/${image}`) : []
        }));

        res.json({ posts });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
