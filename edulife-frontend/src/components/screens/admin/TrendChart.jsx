import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TrendChart = ({ stats }) => {
  const [trendData, setTrendData] = useState([]);
  
  useEffect(() => {
    if (!stats || !stats.length) return;
    
    // Имитация данных по времени - в реальном приложении здесь 
    // будут данные, группированные по дате
    const simulateTrendData = () => {
      // Создаем фиктивные даты для последних 30 дней
      const endDate = new Date();
      const data = [];
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(endDate.getDate() - i);
        
        // Расчет случайного количества посещений для демонстрации
        // В реальном приложении здесь будут реальные данные из API
        const randomVisits = Math.floor(Math.random() * 30) + 10;
        
        data.push({
          date: formatDate(date),
          visits: randomVisits
        });
      }
      
      return data;
    };
    
    setTrendData(simulateTrendData());
  }, [stats]);
  
  // Функция форматирования даты
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}.${month}`;
  };
  
  // Если данных нет, не показываем график
  if (!trendData.length) {
    return null;
  }

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      padding: '20px', 
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      marginBottom: '30px'
    }}>
      <h4 style={{ color: "#8884d8", marginBottom: '20px' }}>Тенденция посещаемости</h4>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trendData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickCount={10}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              domain={[0, 'dataMax + 5']}
            />
            <Tooltip 
              formatter={(value) => [`${value} посещений`, 'Количество']}
              labelFormatter={(label) => `Дата: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="visits"
              name="Посещения"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};



export default TrendChart;