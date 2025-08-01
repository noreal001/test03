import React, { useState, createContext } from 'react';
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
    background: { default: '#FFFFFF', paper: '#F5F5F5' }, // White theme background and paper colors
    text: { primary: '#000000', secondary: '#5f6368' },
  },
  typography: {
    fontFamily: '"Kollektif", "Helvetica", "Arial", sans-serif',
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#f48fb1' },
    background: { default: '#000000', paper: '#121212' }, // Dark theme background and paper colors
    text: { primary: '#ffffff', secondary: '#b0b0b0' },
  },
  typography: {
    fontFamily: '"Kollektif", "Helvetica", "Arial", sans-serif',
  },
});

const RootComponent: React.FC = () => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    // Initialize theme mode from localStorage, default to 'dark'
    const savedTheme = localStorage.getItem('themeMode');
    return savedTheme === 'light' ? 'light' : 'dark';
  });
  const currentTheme = themeMode === 'light' ? lightTheme : darkTheme;
  const toggleTheme = () => {
    setThemeMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode); // Save theme to localStorage
      return newMode;
    });
  };



  return (
    <ThemeProvider theme={currentTheme}>
      <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
        <BrowserRouter>
          <Routes>
            <Route path="/start" element={<WelcomePage />} />
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
