// src/components/screens/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Здесь будет логика авторизации
    console.log('Логин с:', email, password);
    // После успешной авторизации перенаправляем на главную
    navigate('/dashboard');
  };
  const handleBack = () => {
    navigate(-1); // Возврат на предыдущую страницу
  };

  return (
    <div className="login-screen">
      <button className="back-button" onClick={handleBack}>
        &lt;
      </button>
      <div className="login-container">
        <h1 className="login-title">Войдите в свой</h1>
        
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="careerplace@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
            />
          </div>
          
          <button type="submit" className="login-button">Вход</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
