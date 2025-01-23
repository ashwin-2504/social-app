import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext'; // Import AuthProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>  {/* Wrap your App with AuthProvider */}
    <App />
  </AuthProvider>
);
