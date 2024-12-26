import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/pages/Layout';
import Sign from './components/pages/Sign';
import NotFound from './components/pages/NotFound';
import NewPost from './components/pages/NewPost';
import { AuthContext } from './contexts/AuthContext'; // Import AuthContext

function App() {
  const { isLoggedIn } = useContext(AuthContext);  // Use the AuthContext

  return (
    <Router>
      <Routes>
        {isLoggedIn ? (
          <>
            <Route path="/" element={<Layout />} />
            <Route path="/create-post" element={<NewPost />} />
          </>
        ) : (
          <Route path="/" element={<Sign />} />
        )}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
