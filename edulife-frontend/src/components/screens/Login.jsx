import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Импортируем хук для работы с переводами
import './Login.css';
import apiService from '../../services/apiService';

const Login = () => {
  const { t } = useTranslation(['screens']); // Используем пространство имен 'screens' из kz.json
  const navigate = useNavigate();
  const [username, setUsername] = useState(''); // Состояние для имени пользователя (email)
  const [password, setPassword] = useState(''); // Состояние для пароля
  const [error, setError] = useState(''); // Состояние для ошибки
  const [loading, setLoading] = useState(false); // Состояние для загрузки

  // Обработчик отправки формы логина
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await apiService.auth.login(username, password);
      console.log('Успешный вход:', response);
      
      // Перенаправление в зависимости от роли пользователя
      const userRole = response.role || localStorage.getItem('userRole');
      
      if (userRole === 'admin') {
        navigate('/dashboard');
      } else if (userRole === 'teacher') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Ошибка входа:', error);
      setError(
        error.response?.data?.detail || 
        t('screens:login.loginFailed') // Используем перевод для сообщения об ошибке
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Обработчик возврата на предыдущую страницу
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="login-screen">
      <button className="back-button" onClick={handleBack}>
        &lt;
      </button>
      <div className="login-container">
        <h1 className="login-title">{t('screens:login.loginToAccount')}</h1> {/* Используем перевод */}
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">{t('screens:login.email')}</label> {/* Используем перевод */}
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
            <label htmlFor="password">{t('screens:login.password')}</label> {/* Используем перевод */}
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
            {loading ? t('screens:login.loggingIn') : t('screens:login.login')} {/* Используем перевод */}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;