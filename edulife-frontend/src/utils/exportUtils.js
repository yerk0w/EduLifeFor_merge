// utils/exportUtils.js
import * as XLSX from 'xlsx';

/**
 * Экспортирует данные статистики в Excel-файл
 * @param {Array} stats - Массив статистики посещений
 * @param {string} filename - Имя файла для экспорта
 */
export const exportStatsToExcel = (stats, filename = 'attendance_stats') => {
  // Проверяем, есть ли данные для экспорта
  if (!stats || !stats.length) {
    console.error('Нет данных для экспорта');
    return;
  }
  
  try {
    // Подготавливаем данные для Excel
    const data = stats.map(item => ({
      'ID предмета': item.subject_id,
      'Название предмета': item.subject_name || `Предмет ${item.subject_id}`,
      'ID преподавателя': item.teacher_id,
      'Преподаватель': item.teacher_name || `Преподаватель ${item.teacher_id}`,
      'Смена': getShiftName(item.shift_id),
      'День недели': getDayOfWeekName(item.day_of_week),
      'Количество посещений': item.attendance_count
    }));
    
    // Создаем рабочую книгу и лист
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Статистика посещений');
    
    // Автоматическая настройка ширины колонок
    const colWidths = [
      { wch: 15 }, // ID предмета
      { wch: 25 }, // Название предмета
      { wch: 15 }, // ID преподавателя
      { wch: 25 }, // Преподаватель
      { wch: 15 }, // Смена
      { wch: 15 }, // День недели
      { wch: 20 }  // Количество посещений
    ];
    worksheet['!cols'] = colWidths;
    
    // Форматируем ячейки с заголовками
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1";
      if (!worksheet[address]) continue;
      worksheet[address].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "EEEEEE" } }
      };
    }
    
    // Генерация имени файла с датой
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    const fullFilename = `${filename}_${dateStr}.xlsx`;
    
    // Сохраняем файл
    XLSX.writeFile(workbook, fullFilename);
  } catch (error) {
    console.error('Ошибка при экспорте в Excel:', error);
  }
};

// Вспомогательная функция для получения названия дня недели
const getDayOfWeekName = (dayIndex) => {
  const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  return dayIndex >= 0 && dayIndex < 7 ? days[dayIndex] : 'Неизвестно';
};

// Вспомогательная функция для получения названия смены
const getShiftName = (shiftId) => {
  const shifts = {
    1: 'Первая смена',
    2: 'Вторая смена',
    3: 'Вечерняя смена'
  };
  return shifts[shiftId] || `Смена ${shiftId}`;
};