import React, { useState, createContext, useContext } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WelcomePage from './WelcomePage';
import { ThemeProvider, createTheme } from '@mui/material/styles';

interface ThemeContextType {
  themeMode: 'light' | 'dark';
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    background: { default: '#f4f6f8', paper: '#ffffff' },
    text: { primary: '#000000', secondary: '#5f6368' },
  },
  typography: {
    fontFamily: 'Helvetica, Arial, sans-serif',
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#f48fb1' },
    background: { default: '#121212', paper: '#1e1e1e' },
    text: { primary: '#ffffff', secondary: '#b0b0b0' },
  },
  typography: {
    fontFamily: 'Helvetica, Arial, sans-serif',
  },
});

const RootComponent: React.FC = () => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  const currentTheme = themeMode === 'light' ? lightTheme : darkTheme;
  const toggleTheme = () => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const handleRegisterSuccess = (name: string, phone: string) => {
    localStorage.setItem('user_name', name);
    localStorage.setItem('user_phone', phone);
    // Additional logic if needed after registration
  };

  const handleContinueWithoutRegistration = () => {
    // Additional logic if needed after skipping
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
        <BrowserRouter>
          <Routes>
            <Route path="/welcome" element={<WelcomePage onRegisterSuccess={handleRegisterSuccess} onContinueWithoutRegistration={handleContinueWithoutRegistration} />} />
            <Route path="/" element={<App />} />
          </Routes>
        </BrowserRouter>
      </ThemeContext.Provider>
    </ThemeProvider>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
