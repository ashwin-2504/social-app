import './Sign.css';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext'; // Import AuthContext

function Sign() {
  const { isLoggedIn, login } = useContext(AuthContext); // Access auth state and login function from context
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/'); // Redirect to home if already logged in
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = isSignIn ? { email, password } : { email, password, username };
    const url = isSignIn ? '/api/signin' : '/api/signup';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (isSignIn) {
          login(data.token, data.user_id);  // Set the token in context
          setSuccessMessage('Sign In successful!');
          setTimeout(() => navigate('/'), 1000); // Redirect after success
        } else {
          setSuccessMessage('Sign Up successful! Please sign in.');
        }
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (error) {
      setError('Failed to connect to the server');
    }
  };

  return (
    <div className='sign_container'>
      <p className="signin">{isSignIn ? 'Sign In' : 'Sign Up'}</p>
      <form className="sign_form" onSubmit={handleSubmit}>
        {!isSignIn && (
          <div>
            <input
              className="sign_username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        )}
        <div>
          <input
            className="sign_email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            className="sign_pass"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <button className="sign_submit" type="submit">{isSignIn ? 'Sign In' : 'Sign Up'}</button>
        </div>
        {error && <p className="sign_error">{error}</p>}
        {successMessage && <p className="sign_msg">{successMessage}</p>}
      </form>

      <div className="toggle-message">
        <p>
          {isSignIn ? "Don't have an account?" : 'Already have an account?'}
          <button className="sign_opt" onClick={() => setIsSignIn(!isSignIn)}>
            {isSignIn ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Sign;
