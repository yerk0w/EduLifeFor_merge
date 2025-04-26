// src/components/icons/index.jsx
import React from 'react';

export const HomeIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
  <path d="M10 1C10.7017 1 11.3872 1.21011 12.3135 1.74121C13.0276 2.15066 13.835 2.72064 14.8623 3.47754L15.9678 4.29785C16.8257 4.93682 17.4217 5.38187 17.8633 5.76953C18.2938 6.14748 18.5215 6.42391 18.668 6.69922C18.9735 7.27335 19 7.93275 19 9.95117V11.4424L18.9971 12.8662C18.9884 14.1806 18.9551 15.1801 18.8291 15.9824C18.6684 17.0052 18.3763 17.5675 17.8857 17.9873C17.3726 18.4264 16.6482 18.7028 15.3721 18.8496C14.081 18.9981 12.3813 19 10 19C7.6187 19 5.91895 18.9981 4.62793 18.8496C3.35177 18.7028 2.62736 18.4264 2.11426 17.9873C1.6237 17.5675 1.33161 17.0052 1.1709 15.9824C1.00284 14.9127 1 13.4923 1 11.4424V9.95117L1.00879 8.67188C1.03067 7.60833 1.10293 7.12976 1.33203 6.69922C1.47853 6.42391 1.70623 6.14748 2.13672 5.76953C2.35744 5.57575 2.61645 5.36736 2.92773 5.12793L4.03223 4.29785C5.61608 3.11817 6.73437 2.28717 7.68652 1.74121C8.61278 1.21011 9.29827 1 10 1Z" stroke="white" stroke-width="2"/>
</svg>
);

export const ScheduleIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    {/* Вставьте ваш SVG-код для иконки расписания */}
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
  </svg>
);

export const QrCodeIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    {/* Вставьте ваш SVG-код для иконки QR-кода */}
    <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm13-2h-2v2h2v-2zm0 4h-2v2h2v-2zm-4-2h-2v2h2v-2zm0 4h-2v2h2v-2zm4 0h2v-4h-4v2h2v2z" />
  </svg>
);

export const JobsIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    {/* Вставьте ваш SVG-код для иконки работы */}
    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
  </svg>
);

export const MapIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    {/* Вставьте ваш SVG-код для иконки карты */}
    <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" />
  </svg>
);

export const ProfileIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    {/* Вставьте ваш SVG-код для иконки профиля */}
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);
