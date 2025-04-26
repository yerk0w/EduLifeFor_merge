import React from 'react';

const LoadingIndicator = ({ size = 'medium', text = 'Загрузка...' }) => {
  // Стили для разных размеров
  const sizes = {
    small: {
      container: { width: '100%', padding: '10px 0' },
      spinner: { width: '20px', height: '20px' },
      text: { fontSize: '12px', marginLeft: '8px' }
    },
    medium: {
      container: { width: '100%', padding: '20px 0' },
      spinner: { width: '30px', height: '30px' },
      text: { fontSize: '14px', marginLeft: '10px' }
    },
    large: {
      container: { width: '100%', padding: '30px 0' },
      spinner: { width: '40px', height: '40px' },
      text: { fontSize: '16px', marginLeft: '12px' }
    }
  };
  
  const sizeProps = sizes[size] || sizes.medium;
  
  return (
    <div style={{ 
      ...sizeProps.container,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1f1f1f1',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
    }}>
      <div className="spinner" style={{ 
        ...sizeProps.spinner,
        border: '3px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '50%',
        borderTop: '3px solid #2c7be5',
        animation: 'spin 1s linear infinite'
      }}></div>
      {text && (
        <div className="loading-text" style={{ 
          ...sizeProps.text,
          color: '#666'
        }}>
          {text}
        </div>
      )}
      
      <style jsx="true">{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingIndicator;