// src/components/screens/QRCode.jsx
import React, { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import Navbar from '../common/Navbar';
import './QRCode.css';

const QRCode = () => {
  const [result, setResult] = useState('');
  const [hasPermission, setHasPermission] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [scanHistory, setScanHistory] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Проверяем разрешение на доступ к камере при загрузке компонента
    const checkCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        setHasPermission(true);
      } catch (error) {
        console.error('Ошибка доступа к камере:', error);
        setHasPermission(false);
      }
    };

    checkCameraPermission();
  }, []);

  const handleScan = (data) => {
    if (data && isScanning) {
      setResult(data);
      setIsScanning(false);
      
      // Добавляем результат в историю сканирований
      const newScan = {
        id: Date.now(),
        data: data,
        timestamp: new Date().toLocaleString()
      };
      
      setScanHistory(prevHistory => [newScan, ...prevHistory].slice(0, 5));
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  const handleReset = () => {
    setResult('');
    setIsScanning(true);
  };

  const requestCameraPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setHasPermission(true);
    } catch (error) {
      console.error('Ошибка при запросе разрешения камеры:', error);
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
                <div className="result-box">
                  <p>{result}</p>
                </div>
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
                <li key={scan.id} className="history-item">
                  <div className="history-data">{scan.data}</div>
                  <div className="history-time">{scan.timestamp}</div>
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
