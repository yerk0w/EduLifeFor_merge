/**
 * Функции для работы с датами и форматирования
 */

/**
 * Генерирует массив недель, начиная с указанной даты
 * @param {Date} startDate - Начальная дата
 * @param {Number} numberOfWeeks - Количество недель для генерации
 * @returns {Array} - Массив недель с информацией о днях
 */
export function generateWeeks(startDate, numberOfWeeks) {
    const weeks = [];
    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  
    for (let weekIndex = 0; weekIndex < numberOfWeeks; weekIndex++) {
      const week = [];
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + weekIndex * 7);
  
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const date = new Date(currentDate);
        week.push({
          day: daysOfWeek[dayIndex],
          date: date.getDate(),
          month: date.getMonth() + 1, // Months start from 0
          year: date.getFullYear(),
          fullDate: date
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
  
      weeks.push(week);
    }
  
    return weeks;
  }
  
  /**
   * Форматирует дату в строку вида dd.mm.yyyy
   * @param {Date|string} date - Дата для форматирования
   * @returns {string} - Отформатированная строка даты
   */
  export function formatDate(date) {
    try {
      let dateObj;
      
      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string') {
        // Проверяем, если дата уже в формате dd.mm.yyyy
        if (date.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
          return date;
        }
        
        // Проверяем, если дата в формате yyyy-mm-dd
        if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const parts = date.split('-');
          return `${parts[2]}.${parts[1]}.${parts[0]}`;
        }
        
        dateObj = new Date(date);
      } else {
        return '';
      }
      
      if (isNaN(dateObj.getTime())) {
        return '';
      }
      
      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const year = dateObj.getFullYear();
      
      return `${day}.${month}.${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }
  
  /**
   * Нормализует строку даты в формат dd.mm.yyyy
   * @param {string} dateStr - Строка даты
   * @returns {string} - Нормализованная строка даты
   */
  export function normalizeDate(dateStr) {
    if (typeof dateStr !== 'string') return '';
    
    // Если дата уже в формате dd.mm.yyyy
    if (dateStr.match(/^\d{1,2}\.\d{1,2}\.\d{4}$/)) {
      const parts = dateStr.split('.');
      return `${parts[0].padStart(2, '0')}.${parts[1].padStart(2, '0')}.${parts[2]}`;
    }
    
    // Если дата в формате yyyy-mm-dd
    if (dateStr.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
      const parts = dateStr.split('-');
      return `${parts[2].padStart(2, '0')}.${parts[1].padStart(2, '0')}.${parts[0]}`;
    }
    
    // Пробуем преобразовать через объект Date
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return formatDate(date);
      }
    } catch (e) {
      console.error('Error normalizing date:', e);
    }
    
    return dateStr;
  }
  
  /**
   * Сравнивает две даты в формате dd.mm.yyyy
   * @param {string} date1 - Первая дата
   * @param {string} date2 - Вторая дата 
   * @returns {boolean} - true, если даты равны
   */
  export function compareDates(date1, date2) {
    const normalizedDate1 = normalizeDate(date1);
    const normalizedDate2 = normalizeDate(date2);
    
    return normalizedDate1 === normalizedDate2;
  }
  
  /**
   * Получает текущий день недели (0-6, где 0 - понедельник)
   * @returns {number} - Индекс текущего дня недели
   */
  export function getCurrentDayOfWeek() {
    const today = new Date();
    const day = today.getDay(); // 0 - воскресенье, 6 - суббота
    
    // Преобразуем к формату, где 0 - понедельник, 6 - воскресенье
    return day === 0 ? 6 : day - 1;
  }
  
  /**
   * Получает день недели для заданной даты (0-6, где 0 - понедельник)
   * @param {Date|string} date - Дата
   * @returns {number} - Индекс дня недели
   */
  export function getDayOfWeek(date) {
    let dateObj;
    
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      // Если дата в формате dd.mm.yyyy
      if (date.match(/^\d{1,2}\.\d{1,2}\.\d{4}$/)) {
        const parts = date.split('.');
        dateObj = new Date(parts[2], parts[1] - 1, parts[0]);
      } else {
        dateObj = new Date(date);
      }
    } else {
      return -1;
    }
    
    if (isNaN(dateObj.getTime())) {
      return -1;
    }
    
    const day = dateObj.getDay(); // 0 - воскресенье, 6 - суббота
    
    // Преобразуем к формату, где 0 - понедельник, 6 - воскресенье
    return day === 0 ? 6 : day - 1;
  }