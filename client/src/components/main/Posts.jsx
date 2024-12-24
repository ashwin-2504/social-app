import './Posts.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Posts() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/posts') // API call to the server
      .then(response => {
        console.log("Response received:", response); // Log the response data
        setPosts(response.data.posts); // Set the posts data in state
      })
      .catch(error => {
        console.error("Error fetching data:", error); // Log any errors
        setError(error); // Set error state
      });
  }, []);

  return (
    <div>
      {error && <div>Error loading posts: {error.message}</div>} {/* Display error if there's an error */}
      {posts.length > 0 ? (
        <>
          {posts.map(post => (

            <div className='post' key={post.id}> {/* Each post should have a unique 'key' */}
              <div className='header'>{post.username}</div> {/* Display the username */}
              <div className='content'>{post.content}</div>
              <div className='timeStamp'>{post.created_at}</div>
            </div>

          ))}
        </>
      ) : (
        <div>No posts available.</div> // If no posts, display a message
      )}
    </div>
  );
}

export default Posts;
