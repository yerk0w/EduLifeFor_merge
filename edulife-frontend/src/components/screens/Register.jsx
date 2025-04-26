// src/components/screens/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Register.css';
import apiService from '../../services/apiService';

const Register = () => {
  const { t } = useTranslation(['screens']);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Create user data object
      const userData = {
        username: email,
        email: email,
        full_name: name,
        password: password
      };
      
      // Call registration API
      const response = await apiService.auth.register(userData);
      console.log('Registration successful:', response);
      
      // After successful registration, automatically log in
      await apiService.auth.login(email, password);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      setError(
        error.response?.data?.detail || 
        t('register.createAccountFailed')
      );
    } finally {
      setLoading(false);
    }
  };
  
  const handleBack = () => {
    navigate(-1); // Return to previous page
  };

  return (
    <div className="reg-screen">
      <button className="back-button" onClick={handleBack}>
        &lt;
      </button>
      <div className="reg-container">
        <h1 className="reg-title">{t('register.createAccount')}</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="reg-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="email">{t('register.email')}</label>
            <input
              type="email"
              id="email"
              placeholder="careerplace@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="name">{t('register.name')}</label>
            <input
              type="text"
              id="name"
              placeholder="Иван Иванов"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">{t('register.password')}</label>
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
            className="reg-button"
            disabled={loading}
          >
            {loading ? t('register.creating') : t('register.createAccountButton')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;