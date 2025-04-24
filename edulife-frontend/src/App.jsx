import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';


import SplashScreen from './components/screens/SplashScreen';

const Start = lazy(() => import('./components/screens/Start'));
const Logreg = lazy(() => import('./components/screens/LogReg'));
const Login = lazy(() => import('./components/screens/Login'));
const Register = lazy(() => import('./components/screens/Register'));
const Dashboard = lazy(() => import('./components/screens/Dashboard'));
const Schedule = lazy(() => import('./components/screens/Schedule'));
const QRCode = lazy(() => import('./components/screens/QRCode'));
const Profile = lazy(() => import('./components/screens/Profile'));
const Notifications = lazy(() => import('./components/screens/Notifications'));
const Settings = lazy(() => import('./components/screens/Settings'));
const AdminPanel = lazy(() => import('./components/screens/admin/AdminPanel'));
const Documents = lazy(() => import('./components/screens/Documents/Documents'));
const Jobs = lazy(() => import('./components/screens/Jobs/Jobs'));
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
