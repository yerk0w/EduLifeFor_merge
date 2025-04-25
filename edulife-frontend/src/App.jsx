import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import SplashScreen from './components/screens/SplashScreen';

import Start from './components/screens/Start';
import Logreg from './components/screens/LogReg';
import Login from './components/screens/Login';
import Register from './components/screens/Register';
import Dashboard from './components/screens/Dashboard';
import Schedule from './components/screens/Schedule';
import QRCode from './components/screens/QRCode';
import Profile from './components/screens/Profile';
import Notifications from './components/screens/Notifications';
import Settings from './components/screens/Settings';
import AdminPanel from './components/screens/admin/AdminPanel';
import Documents from './components/screens/Documents/Documents';
import Jobs from './components/screens/Jobs/Jobs'
import TeacherPanel from './components/screens/TeacherPanel';
import './App.css';

const App = () => {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/start" element={<Start />} />
          <Route path="/logreg" element={<Logreg />} />
          <Route path="/log" element={<Login />} />
          <Route path="/reg" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/qr-code" element={<QRCode />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/documents" element={<Documents/>} />
          <Route path="/jobs" element={<Jobs/>} />
          <Route path='/teacher' element={<TeacherPanel/>} />
          {/* Добавьте другие маршруты здесь */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
