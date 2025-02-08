import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
    const [isAdmin, setIsAdmin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        // Add your login logic here
        console.log('Login attempted with:', { username, password, isAdmin });
        // On successful login:
        // navigate('/dashboard');
    };

    const handleCreateUser = () => {
        // Add your create user logic here
        console.log('Create user clicked');
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <h1 className="portal-title">SHC Portal</h1>
                    <h2>{isAdmin ? 'Admin Login' : 'User Login'}</h2>
                    <div className="login-toggle">
                        <button 
                            className={`toggle-btn ${isAdmin ? 'active' : ''}`}
                            onClick={() => setIsAdmin(true)}
                        >
                            Admin
                        </button>
                        <button 
                            className={`toggle-btn ${!isAdmin ? 'active' : ''}`}
                            onClick={() => setIsAdmin(false)}
                        >
                            User
                        </button>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="login-form">
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

                    <button type="submit" className="login-btn">
                        Login
                    </button>

                    {isAdmin && (
                        <button 
                            type="button" 
                            className="create-user-btn"
                            onClick={handleCreateUser}
                        >
                            Create New User
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
}

export default Login;
