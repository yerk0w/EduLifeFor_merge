// src/components/screens/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState(''); // Добавляем состояние для имени
  const [password, setPassword] = useState('');

  const handleReg = (e) => {
    e.preventDefault();
    // Здесь будет логика авторизации
    console.log('Логин с:', email, name, password); // Добавляем имя в лог
    // После успешной авторизации перенаправляем на главную
    navigate('/dashboard');
  };
  
  const handleBack = () => {
    navigate(-1); // Возврат на предыдущую страницу
  };

  return (
    <div className="reg-screen">
      <button className="back-button" onClick={handleBack}>
        &lt;
      </button>
      <div className="reg-container">
        <h1 className="reg-title">Создать аккаунт</h1>
        
        <form className="reg-form" onSubmit={handleReg}>
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
            <label htmlFor="name">Имя</label>
            <input
              type="text"
              id="name"
              placeholder="Иван Иванов"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
          
          <button type="submit" className="reg-button">Создать аккаунт</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
