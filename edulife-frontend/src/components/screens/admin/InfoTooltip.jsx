import React, { useState } from 'react';

const InfoTooltip = ({ text, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Стили для разных позиций
  const positions = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)' },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)' },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%)' },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%)' }
  };
  
  const positionStyle = positions[position] || positions.top;
  
  return (
    <div className="tooltip-container" style={{ 
      position: 'relative',
      display: 'inline-block',
      marginLeft: '5px',
      cursor: 'pointer'
    }}>
      <div 
        className="info-icon"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: '#2C7BE5',
          color: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        i
      </div>
      
      {isVisible && (
        <div 
          className="tooltip-content"
          style={{
            position: 'absolute',
            ...positionStyle,
            width: '200px',
            padding: '8px 10px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 1000,
            marginBottom: position === 'top' ? '10px' : '0',
            marginTop: position === 'bottom' ? '10px' : '0',
            marginLeft: position === 'right' ? '10px' : '0',
            marginRight: position === 'left' ? '10px' : '0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;