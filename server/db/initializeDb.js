const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('social_media.db'); // Create or open the DB

// Create the tables if they do not exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY ,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS posts (
    user_id INTEGER NOT NULL,
	  post_id INTEGER NOT NULL,
    data TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS post_images (
    post_id INTEGER NOT NULL,
    image BLOB NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(post_id)
  )`);

  // Additional tables like likes, comments, followers, etc. can be created here

  console.log("Database initialized successfully.");
});

db.close();
