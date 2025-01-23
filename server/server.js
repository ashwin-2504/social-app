const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cors = require('cors');
const { v4: uuidv4, v5: uuidv5 } = require('uuid');
const argon2 = require('argon2'); // Install with npm install argon2
const jwt = require('jsonwebtoken'); // Import jsonwebtoken



const TOKEN_EXPIRY = '1h'; // Token expiration time, e.g., 1 hour
// Initialize Express app

// Database connection
const usersDb = new sqlite3.Database('./db/users.db');
const postsDb = new sqlite3.Database('./db/posts.db');


const app = express();

const PORT = process.env.PORT || 5000;
const SECRET_KEY = 'your-secret-key'; // Replace with a secure secret key
const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // Replace with your chosen namespace UUID

app.use(cors({
    origin: 'http://localhost:3000', // Frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
}));


app.options('*', cors());


const generateToken = (userId) => jwt.sign({ user_id: userId }, SECRET_KEY, { expiresIn: TOKEN_EXPIRY });


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access token missing or malformed' });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};


function generatePostId() {
    return crypto.randomBytes(16).toString('hex');
}


// Middleware for JSON parsing
app.use(express.json({ limit: '20mb' }));

// Static route for images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${crypto.randomUUID()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});
const upload = multer({ storage }).single('file');


// Endpoint for image upload
app.post('/api/upload', (req, res) => {
    const imageBase64 = req.body.image; // Assuming you're sending base64 data
    const buffer = Buffer.from(imageBase64, 'base64');
    const imagePath = path.join(__dirname, 'uploads', 'image.png');

    fs.writeFile(imagePath, buffer, (err) => {
        if (err) {
            return res.status(500).send('Error saving image');
        }

        res.send({ imageUrl: `http://localhost:5000/uploads/image.png` });
    });
});

// Routes
// Signup Route
app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Hash the password
        const hashedPassword = await argon2.hash(password);

        // Generate unique user ID
        const userId = uuidv5(`${username}:${email}`, NAMESPACE);

        // Wrap usersdb.run in a Promise
        const runQuery = (query, params) =>
            new Promise((resolve, reject) => {
                usersDb.run(query, params, (err) => (err ? reject(err) : resolve()));
            });

        // Insert user into the database
        await runQuery(
            `INSERT INTO users (user_id, username, email, password) VALUES (?, ?, ?, ?)`,
            [userId, username, email, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        // Handle database errors
        if (error.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        console.error('Error during signup:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Signin Route
app.post('/api/signin', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    usersDb.get(
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


// Route to get all posts
app.get('/api/posts', (req, res) => {
    postsDb.all(
        `SELECT p.post_id, p.user_id, p.data, pi.image FROM posts p LEFT JOIN post_images pi ON p.post_id = pi.post_id ORDER BY p.created_at DESC`,
        [],
        (err, rows) => {
            if (err) {
                console.error('Error fetching posts:', err);
                return res.status(500).json({ error: 'Failed to fetch posts' });
            }

            const posts = rows.map(row => ({
                id: row.post_id,
                user_id: row.user_id,
                data: row.data,
                image: row.image ? `/uploads/${row.image}` : null, // Correctly format image URL
            }));

            res.json({ posts });
        }
    );
});




// POST route to handle new post submission
app.post('/api/posts', upload, (req, res) => {
    const { user_id, content } = req.body;

    if (!user_id ) {
        return res.status(400).send('User ID is required');
    }

    if (!content && !req.file) {
        return res.status(400).send('Post must include either text or an image.');
    }


    const postId = generatePostId();


    // Insert post into the database
    postsDb.run(
        'INSERT INTO posts (user_id, post_id, data) VALUES (?, ?, ?)',
        [user_id, postId, content],
        function (err) {
            if (err) {
                console.error('Error saving post content:', err);
                return res.status(500).send('Error saving post content');
            }

            if (req.file) {
                const imagePath = req.file.filename;
                // Insert image path into the database
                postsDb.run(
                    'INSERT INTO post_images (post_id, image) VALUES (?, ?)',
                    [postId, imagePath],
                    function (err) {
                        if (err) {
                            console.error('Error saving image:', err);
                            return res.status(500).send('Error saving image');
                        }
                        res.status(200).send('Post submitted successfully!');
                    }
                );
            } else {
                res.status(200).send('Post submitted successfully!');
            }
        }
    );
});



// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
