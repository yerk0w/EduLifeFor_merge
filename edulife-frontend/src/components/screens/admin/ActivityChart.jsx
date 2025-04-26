import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ActivityChart = ({ data }) => {
  // Цвета для графика
  const colors = {
    primary: '#2C7BE5',
    hover: '#1A68D1',
    grid: '#EEEEEE',
    text: '#555555'
  };

  // Кастомный тултип
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: 'rgb(44, 123, 229)',
          padding: '10px 15px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <p className="label" style={{ margin: 0, fontWeight: 500 }}>{`${label}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container" style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px',height: '400px', flexDirection:'column', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
      <h4 className="chart-title" style={{ color: '#333', marginBottom: '15px', fontSize: '18px', fontWeight: 500 }}>Активность по дням недели</h4>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis dataKey="day" tick={{ fill: colors.text }} />
            <YAxis tick={{ fill: colors.text }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="value" 
              name="Посещаемость" 
              fill={colors.primary} 
              radius={[4, 4, 0, 0]}
              barSize={40}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActivityChart;