import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './newlogin.css';
import { supabase } from './supabase';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
  
    const handleLogin = async (e) => {
      e.preventDefault();
      setError('');
  
      try {
        const { data, error } = await supabase
          .from('users')
          .select('username, password, is_admin')
          .eq('username', username)
          .single();
  
        if (error) throw error;
  
        if (!data) {
          setError('User not found');
          return;
        }
  
        if (data.password === password) {
          localStorage.setItem('user', data.username);

          if (data.is_admin === true) {
            navigate('/admin/hrm')
          }
          else {
          navigate('/user');
          }
        } else {
          setError('Invalid password');
        }
      } catch (err) {
        setError('Login failed: ' + err.message);
        console.error('Login error:', err);
      }
    };
  
    return (
      <div className="flex">
        <div className="login-form-container">
          <h2 className="login-title">Login</h2>
          
          <form onSubmit={handleLogin} className="login-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
  
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>
  
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
  
            <button type="submit" className="submit-button">
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  };
  
  export default Login;
