// src/components/screens/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import apiService from '../../services/apiService';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

const handleLogin = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  
  try {
    const response = await apiService.auth.login(username, password);
    console.log('Login successful:', response);
    
    // Redirect based on user role
    const userRole = response.role || localStorage.getItem('userRole');
    
    if (userRole === 'admin') {
      navigate('/dashboard');
    } else if (userRole === 'teacher') {
      navigate('/dashboard');
    } else {
      navigate('/dashboard');
    }
  } catch (error) {
    console.error('Login error:', error);
    setError(
      error.response?.data?.detail || 
      'Не удалось войти. Проверьте учетные данные и повторите попытку.'
    );
  } finally {
    setLoading(false);
  }
};
  
  const handleBack = () => {
    navigate(-1); // Return to previous page
  };

  return (
    <div className="login-screen">
      <button className="back-button" onClick={handleBack}>
        &lt;
      </button>
      <div className="login-container">
        <h1 className="login-title">Войдите в свой аккаунт</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="text"
              id="email"
              placeholder="careerplace@gmail.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Вход'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;