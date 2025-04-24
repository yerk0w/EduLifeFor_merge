import React from 'react';
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
import CourseDetail from './components/screens/CourseDetail';
import AdminPanel from './components/screens/admin/AdminPanel';
import Documents from './components/screens/Documents/Documents';
import Jobs from './components/screens/Jobs/Jobs'
import './App.css';
const courses = [
  {
    id: '1',
    title: 'UX/UI Designer',
    description: "Learn the principles of user experience and interface design. Create beautiful, functional designs that users love. This course covers everything from wireframing to prototyping and user testing.",
    backgroundColor: '#9C7AE2',
    image: '/images/uxui.jpg',
    hours: '36:15',
    people: '324',
    videoUrl: 'https://www.youtube.com/embed/c9Wg6Cb_YlU',
    videoType: 'youtube',
    homework: [
      {
        question: "What is the main purpose of UX design?",
        options: [
          "To make websites look pretty",
          "To create user-friendly and intuitive experiences",
          "To use as many colors as possible",
          "To show off technical skills"
        ],
        correctAnswer: 1
      },
      {
        question: "Which of these is NOT a common UX deliverable?",
        options: [
          "Wireframes",
          "User flows",
          "Server configurations",
          "Prototypes"
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    id: '2',
    title: 'SMM & Marketing',
    description: "Explore strategies, tools, and platforms to excel in today's digital landscape. From SEO and social media to email campaigns and analytics, gain practical skills for success.",
    backgroundColor: '#5AC8FA',
    image: '/images/interface.jpg',
    hours: '48:03',
    people: '245',
    videoUrl: 'https://www.youtube.com/embed/kXtZ_vyGtQI?si=1VVjuPcC_WnsNKKQ',
    videoType: 'youtube',
    homework: [
      {
        question: "What principle is most important in interface design?",
        options: [
          "Consistency",
          "Complexity",
          "Originality at all costs",
          "Using the latest trends"
        ],
        correctAnswer: 0
      }
    ]
  },
  {
    id: '3',
    title: 'Figma components',
    description: "The more you use Figma, the more you'll find yourself duplicating stuff. I find this extremely annoying and time-wasting. The good news is that we have something called Components in Figma. And in this video I’ll teach you what they are and how to use them so you can stop wasting your time when designing. ",
    backgroundColor: '#FF9500',
    image: '/images/webdev.jpg',
    hours: '52:30',
    people: '412',
    videoUrl: 'https://www.youtube.com/embed/aGvWDDPsjUM?si=QRk4gFvosxUXMjHj',
    videoType: 'youtube',
    homework: [
      {
        question: "Which language is used for styling web pages?",
        options: [
          "HTML",
          "JavaScript",
          "CSS",
          "Python"
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    id: '4',
    title: 'Design portfolio + 2 case',
    description: "Master digital marketing strategies to grow your business online. Learn about SEO, social media marketing, content creation, and analytics.",
    backgroundColor: '#34C759',
    image: '/images/marketing.jpg',
    hours: '42:15',
    people: '356',
    videoUrl: 'https://www.youtube.com/embed/DZ2bB8tL4O0?si=3jRgqHkjjH6F8eKw',
    videoType: 'youtube',
    homework: [
      {
        question: "What does SEO stand for?",
        options: [
          "Search Engine Optimization",
          "Social Engagement Online",
          "System Engineering Operations",
          "Search Experience Overhaul"
        ],
        correctAnswer: 0
      }
    ]
  },
  {
    id: '5',
    title: 'Adobe Full',
    description: "Having trouble navigating Adobe Illustrator? Don't worry. Because in this video I’m going to guide you through a crash course in Illustator. Here I'll cover all the essential tools and basics you need to know.",
    backgroundColor: '#FF3B30',
    image: '/images/mobile.jpg',
    hours: '38:45',
    people: '289',
    videoUrl: 'https://www.youtube.com/embed/n_-ygXZUq3U?si=UfKdFGSX4vKLiw0X',
    videoType: 'youtube',
    homework: [
      {
        question: "Which of these is a key consideration in mobile app design?",
        options: [
          "Using as many features as possible",
          "Designing for desktop first",
          "Thumb-friendly navigation",
          "Ignoring platform guidelines"
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    id: '6',
    title: 'JAVA developer',
    description: "Master Java – a must-have language for software development, Android apps, and more! ☕️ This beginner-friendly course takes you from basics to real coding skills. ",
    backgroundColor: '#007AFF',
    image: '/images/graphic.jpg',
    hours: '45:20',
    people: '378',
    videoUrl: 'https://www.youtube.com/embed/eIrMbAQSU34?si=7hGRwQCL1Hk2BNFC',
    videoType: 'youtube',
    homework: [
      {
        question: "What is CMYK used for?",
        options: [
          "Web design",
          "Print design",
          "Mobile app design",
          "3D modeling"
        ],
        correctAnswer: 1
      }
    ]
  }
];
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
          <Route path="/course/:id" element={<CourseDetail courses={courses} />} />
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
