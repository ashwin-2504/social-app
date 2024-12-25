import './Posts.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Posts() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/posts') // API call to the server
      .then(response => {
        console.log("Response received:", response);
        setPosts(response.data.posts);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setError(error);
      });
  }, []);

  return (
    <div>
      {error && <div className="error-message">Error loading posts: {error.message}</div>}
      {posts.length > 0 ? (
        posts.map(post => (
          <div className='post' key={post.id}>
            <div className='header'>
              <div className='username'>{post.username}</div>
            </div>
            <div className='content-text'>{post.data}</div>
            {post.image && (
              <div className='image'>
                <img src={post.image} alt="Post content" />
              </div>
            )}
          </div>
        ))
      ) : (
        <div>No posts available.</div>
      )}
    </div>
  );
}

export default Posts;
