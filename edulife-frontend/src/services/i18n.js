import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Импортируем переводы для казахского и русского языков
import commonKz from '../components/common/locales/kz.json';
import screensKz from '../components/screens/locales/kz.json';
import adminKz from '../components/screens/admin/locales/kz.json';
import commonRu from '../components/common/locales/ru.json';
import screensRu from '../components/screens/locales/ru.json';
import adminRu from '../components/screens/admin/locales/ru.json';

// Получаем язык из localStorage, если он сохранен, иначе по умолчанию 'kz'
const savedLanguage = localStorage.getItem('language') || 'kz';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      kz: {
        common: commonKz, // Переводы для казахского языка
        screens: screensKz,
        admin: adminKz,
      },
      ru: {
        common: commonRu, // Переводы для русского языка
        screens: screensRu,
        admin: adminRu,
      },
    },
    lng: savedLanguage, // Устанавливаем язык из localStorage
    fallbackLng: 'kz', // Язык по умолчанию, если перевод отсутствует
    ns: ['common', 'screens', 'admin'], // Пространства имен
    defaultNS: 'common', // Пространство имен по умолчанию
    interpolation: {
      escapeValue: false, // React сам экранирует значения
    },
  });

export default i18n;