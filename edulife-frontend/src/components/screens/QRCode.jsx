// src/components/screens/QRCode.jsx
import React, { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import Navbar from '../common/Navbar';
import './QRCode.css';
import apiService from '../../services/apiService';

const QRCode = () => {
  const [result, setResult] = useState('');
  const [hasPermission, setHasPermission] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [scanHistory, setScanHistory] = useState([]);
  const [activeTab, setActiveTab] = useState(2); // QR tab is index 2 in navbar
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState('');
  
  // Get user ID from local storage
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    // Check camera permission when component loads
    const checkCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        setHasPermission(true);
      } catch (error) {
        console.error('Camera access error:', error);
        setHasPermission(false);
      }
    };

    checkCameraPermission();
    
    // Load scan history from localStorage
    const savedHistory = localStorage.getItem('scanHistory');
    if (savedHistory) {
      setScanHistory(JSON.parse(savedHistory));
    }
  }, []);
  
  // Save scan history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('scanHistory', JSON.stringify(scanHistory));
  }, [scanHistory]);

  const handleScan = async (data) => {
    if (data && isScanning) {
      setResult(data);
      setIsScanning(false);
      setIsValidating(true);
      setError('');
      
      try {
        // Validate QR code with the backend
        const validationResponse = await apiService.qr.validateQR(userId, data);
        
        // Save validation result
        setValidationResult(validationResponse);
        
        // Add result to history
        const newScan = {
          id: Date.now(),
          data: data,
          timestamp: new Date().toLocaleString(),
          status: 'success',
          details: validationResponse.session_data || {}
        };
        
        setScanHistory(prevHistory => [newScan, ...prevHistory].slice(0, 10));
      } catch (error) {
        console.error('QR validation error:', error);
        
        // Add failed scan to history
        const newScan = {
          id: Date.now(),
          data: data,
          timestamp: new Date().toLocaleString(),
          status: 'error',
          error: error.response?.data?.detail || 'Ошибка валидации QR-кода'
        };
        
        setScanHistory(prevHistory => [newScan, ...prevHistory].slice(0, 10));
        
        setError(error.response?.data?.detail || 'Ошибка валидации QR-кода');
      } finally {
        setIsValidating(false);
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
    setError('Ошибка сканирования QR-кода');
  };

  const handleReset = () => {
    setResult('');
    setIsScanning(true);
    setValidationResult(null);
    setError('');
  };

  const requestCameraPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setHasPermission(true);
    } catch (error) {
      console.error('Camera permission request error:', error);
      setHasPermission(false);
    }
  };

  return (
    <div className="qrcode-screen">
      <div className="qrcode-header">
        <h1>QR-код</h1>
      </div>

      <div className="qrcode-content">
        {hasPermission === null ? (
          <div className="permission-request">
            <p>Для сканирования QR-кодов необходим доступ к камере</p>
            <button className="permission-button" onClick={requestCameraPermission}>
              Разрешить доступ
            </button>
          </div>
        ) : hasPermission === false ? (
          <div className="permission-denied">
            <p>Доступ к камере запрещен. Пожалуйста, разрешите доступ в настройках браузера.</p>
            <button className="permission-button" onClick={requestCameraPermission}>
              Повторить запрос
            </button>
          </div>
        ) : (
          <div className="scanner-container">
            {isScanning ? (
              <>
                <div className="scanner-overlay">
                  <div className="scanner-frame"></div>
                </div>
                <QrReader
                  delay={300}
                  onResult={handleScan}
                  onError={handleError}
                  constraints={{ facingMode: 'environment' }}
                  className="qr-reader"
                />
                <p className="scanner-instruction">Наведите камеру на QR-код</p>
              </>
            ) : (
              <div className="scan-result">
                <h2>Результат сканирования:</h2>
                
                {isValidating ? (
                  <div className="validating-indicator">
                    <p>Проверка QR-кода...</p>
                  </div>
                ) : error ? (
                  <div className="error-message">
                    <p>{error}</p>
                  </div>
                ) : validationResult ? (
                  <div className="success-message">
                    <p>{validationResult.message}</p>
                    {validationResult.session_data && (
                      <div className="session-details">
                        <p><strong>Предмет:</strong> {validationResult.session_data.subject_name}</p>
                        <p><strong>Преподаватель:</strong> {validationResult.session_data.teacher_name}</p>
                        <p><strong>Время:</strong> {validationResult.session_data.timestamp}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="result-box">
                    <p>{result}</p>
                  </div>
                )}
                
                <button className="scan-again-button" onClick={handleReset}>
                  Сканировать снова
                </button>
              </div>
            )}
          </div>
        )}

        {scanHistory.length > 0 && (
          <div className="scan-history">
            <h3>История сканирований</h3>
            <ul className="history-list">
              {scanHistory.map(scan => (
                <li key={scan.id} className={`history-item ${scan.status}`}>
                  <div className="history-status-indicator">{scan.status === 'success' ? '✓' : '✗'}</div>
                  <div className="history-content">
                    <div className="history-data">
                      {scan.status === 'success' && scan.details ? (
                        <>
                          <p><strong>{scan.details.subject_name}</strong></p>
                          <p className="history-subject-details">
                            {scan.details.teacher_name} | {new Date(scan.details.timestamp).toLocaleTimeString()}
                          </p>
                        </>
                      ) : (
                        scan.data.substring(0, 30) + (scan.data.length > 30 ? '...' : '')
                      )}
                    </div>
                    <div className="history-time">{scan.timestamp}</div>
                    {scan.status === 'error' && <div className="history-error">{scan.error}</div>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default QRCode;