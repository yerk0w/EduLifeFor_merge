// utils/printUtils.js

/**
 * Печать отчета о посещаемости
 * @param {Array} stats - Данные статистики посещаемости
 * @param {Object} options - Параметры для печати (период, название и т.д.)
 */
export const printAttendanceReport = (stats, options = {}) => {
    const { period, startDate, endDate } = options;
    
    // Проверяем, есть ли данные для печати
    if (!stats || !stats.length) {
      alert('Нет данных для печати отчета');
      return;
    }
    
    // Создаем новое окно для печати
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Пожалуйста, разрешите всплывающие окна для этого сайта');
      return;
    }
    
    // Генерируем заголовок отчета на основе выбранного периода
    let reportTitle = 'Отчет о посещаемости';
    let periodText = '';
    
    if (period === 'custom' && startDate && endDate) {
      periodText = `за период с ${startDate} по ${endDate}`;
    } else {
      const periodLabels = {
        'week': 'за последнюю неделю',
        'month': 'за последний месяц',
        'quarter': 'за последний квартал',
        'year': 'за последний год'
      };
      periodText = periodLabels[period] || '';
    }
    
    // Начинаем формировать HTML-документ для печати
    let printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportTitle}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          h1 {
            text-align: center;
            color: #2c7be5;
            margin-bottom: 10px;
          }
          h2 {
            text-align: center;
            color: #666;
            font-weight: normal;
            margin-top: 0;
            margin-bottom: 30px;
          }
          .summary {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            flex-wrap: wrap;
          }
          .summary-card {
            background-color: #f5f7fa;
            border-radius: 5px;
            padding: 15px;
            text-align: center;
            width: 22%;
            min-width: 150px;
            margin-bottom: 10px;
          }
          .summary-title {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
          }
          .summary-value {
            font-size: 24px;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f5f7fa;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .footer {
            text-align: center;
            margin-top: 50px;
            font-size: 12px;
            color: #666;
          }
          @media print {
            body {
              margin: 0;
              padding: 15px;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <h1>${reportTitle}</h1>
        <h2>${periodText}</h2>
        
        <div class="summary">
    `;
    
    // Расчет общих показателей
    const totalAttendance = stats.reduce((sum, item) => sum + item.attendance_count, 0);
    const subjects = new Set(stats.map(item => item.subject_id));
    const teachers = new Set(stats.map(item => item.teacher_id));
    const days = new Set(stats.map(item => item.day_of_week));
    const averagePerDay = days.size > 0 ? Math.round(totalAttendance / days.size) : 0;
    
    // Добавляем summary cards
    printContent += `
          <div class="summary-card">
            <div class="summary-title">ВСЕГО ПОСЕЩЕНИЙ</div>
            <div class="summary-value" style="color: #2c7be5;">${totalAttendance}</div>
          </div>
          
          <div class="summary-card">
            <div class="summary-title">ПРЕДМЕТОВ</div>
            <div class="summary-value" style="color: #00c49f;">${subjects.size}</div>
          </div>
          
          <div class="summary-card">
            <div class="summary-title">ПРЕПОДАВАТЕЛЕЙ</div>
            <div class="summary-value" style="color: #ffbb28;">${teachers.size}</div>
          </div>
          
          <div class="summary-card">
            <div class="summary-title">СРЕДНЕЕ В ДЕНЬ</div>
            <div class="summary-value" style="color: #ff8042;">${averagePerDay}</div>
          </div>
        </div>
        
        <h3>Детальная статистика посещений</h3>
        <table>
          <thead>
            <tr>
              <th>Предмет</th>
              <th>Смена</th>
              <th>Преподаватель</th>
              <th>День недели</th>
              <th>Количество</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    // Добавляем строки таблицы
    stats.forEach(item => {
      const dayNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
      const dayName = item.day_of_week >= 0 && item.day_of_week < 7 ? dayNames[item.day_of_week] : 'Неизвестно';
      
      const shifts = {
        1: 'Первая смена',
        2: 'Вторая смена',
        3: 'Вечерняя смена'
      };
      const shiftName = shifts[item.shift_id] || `Смена ${item.shift_id}`;
      
      printContent += `
            <tr>
              <td>${item.subject_name || `Предмет ${item.subject_id}`}</td>
              <td>${shiftName}</td>
              <td>${item.teacher_name || `Преподаватель ${item.teacher_id}`}</td>
              <td>${dayName}</td>
              <td>${item.attendance_count}</td>
            </tr>
      `;
    });
    
    // Завершаем HTML-документ
    const currentDate = new Date().toLocaleDateString();
    printContent += `
          </tbody>
        </table>
        
        <div class="footer">
          Отчет сгенерирован ${currentDate}
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 30px;">
          <button onclick="window.print()" style="padding: 10px 20px; cursor: pointer;">Печать</button>
          <button onclick="window.close()" style="padding: 10px 20px; margin-left: 10px; cursor: pointer;">Закрыть</button>
        </div>
      </body>
      </html>
    `;
    
    // Записываем HTML в новое окно и запускаем печать
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Даем время на загрузку стилей перед печатью
    setTimeout(() => {
      printWindow.focus();
    }, 500);
  };