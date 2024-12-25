import './App.css';
import Layout from './components/pages/Layout.jsx';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NotFound from './components/pages/NotFound.jsx' // 404 Page
import NewPost from './components/pages/NewPost.jsx';


function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Layout />} /> {/* Render Home */}
          <Route path="*" element={<NotFound />} /> {/* 404 Error for unknown routes */}
          <Route path='/create-post' element={<NewPost />} />
        </Routes>
      </Router>

    </div>
  );
}

export default App;