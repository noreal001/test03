import React, { useState, useContext, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper, IconButton } from '@mui/material';
import { MuiTelInput } from 'mui-tel-input';
import { styled, useTheme } from '@mui/material/styles';
// import { Fade } from '@mui/material'; // Removed Fade import
import { useNavigate } from 'react-router-dom';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { ThemeContext } from './index'; // Import ThemeContext
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Brightness4Icon from '@mui/icons-material/Brightness4';

const AnimatedPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(18, 18, 18, 0.9)' : 'rgba(245, 245, 245, 0.9)', // Dynamic background based on theme mode
  color: theme.palette.text.primary,
  width: '90%',
  maxWidth: 500, // Fixed width 500px, responsive to 90%
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  position: 'relative',
  border: '1px solid rgba(255, 255, 255, 0.2)', // Thin white border (1px, opacity 20%)
  boxShadow: 'none', // Remove default paper shadow
  opacity: 0, // Start with opacity 0 for fade-in (handled by parent Box now)
  animation: 'fadeIn 0.5s forwards', // This will be handled by the parent Box with opacity and transition
  // Define keyframes for fade-in animation (moved to global or parent Box for consistency if needed, but not strictly required here)
  '@keyframes fadeIn': {
    'from': { opacity: 0 },
    'to': { opacity: 1 },
  },
  [theme.breakpoints.up('sm')]: {
    width: 500,
  },
}));

const WelcomePage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const navigate = useNavigate();
  const { themeMode, toggleTheme } = useContext(ThemeContext)!;
  const theme = useTheme();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setNameError(newName.trim().length < 2 && newName.trim().length > 0); // Name must be at least 2 characters
  };

  const validatePhoneInput = (phoneNumber: string): boolean => {
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    // Accepts 10 or 11 digits (e.g., 9207005595 or 89207005595 / +79207005595)
    return digitsOnly.length === 11 || (digitsOnly.length === 10 && (digitsOnly.startsWith('9') || digitsOnly.startsWith('8')));
  };

  const handlePhoneChange = (newValue: string) => {
    setPhone(newValue);
    // Set error to false immediately if valid, true if invalid and not empty
    setPhoneError(!validatePhoneInput(newValue) && newValue.length > 0);
  };

  // Simulate API call for phone validation
  const validatePhoneNumberApi = async (phoneNumber: string): Promise<boolean> => {
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length < 10) { // Changed to 10 to allow 9xxxxxxxxxx format locally for validation
      return false; // Not enough digits for a valid phone number
    }
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    // Simulate API response: true if phone is 'valid' (e.g., starts with +7999), false otherwise
    return digitsOnly.startsWith('7999') || digitsOnly.startsWith('8999') || digitsOnly.startsWith('999');
  };

  const handleContinue = async () => {
    const isNameValid = name.trim().length >= 2;
    const isPhoneLengthValid = validatePhoneInput(phone);

    if (!isNameValid || !isPhoneLengthValid) {
      setNameError(!isNameValid);
      setPhoneError(!isPhoneLengthValid);
      return;
    }

    const isPhoneValidApi = await validatePhoneNumberApi(phone);

    if (!isPhoneValidApi) {
      setPhoneError(true);
      return;
    }

    setIsFadingOut(true);
    localStorage.setItem('userRegistered', 'true');
    localStorage.setItem('userName', name);
    localStorage.setItem('userPhone', phone);
    localStorage.setItem('lastRegistrationTime', new Date().getTime().toString()); // Store timestamp
    setTimeout(() => {
      navigate('/');
    }, 500); // Animation duration
  };

  const handleSkip = () => {
    setIsFadingOut(true);
    localStorage.removeItem('userRegistered'); // Ensure no registration flag is set
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhone');
    localStorage.setItem('lastSkipTime', new Date().getTime().toString()); // Store timestamp for skip
    setTimeout(() => {
      navigate('/');
    }, 500); // Animation duration
  };

  const isFormValid = name.trim().length >= 2 && validatePhoneInput(phone);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        bgcolor: '#000000', // Pure black background
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        overflow: 'hidden', // Hide overflow for animation
      }}
    >
      {/* Background Animation Layer */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          overflow: 'hidden',
          // Placeholder for animated elements
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '150%',
            height: '150%',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,191,255,0.1)' : 'rgba(25,118,210,0.1)', // Accent color based on theme
            borderRadius: '40%',
            animation: 'flow 30s linear infinite alternate',
            filter: 'blur(50px)',
            transformOrigin: '70% 30%',
          },
          '@keyframes flow': {
            '0%': { transform: 'translate(-50%, -50%) rotate(0deg) scale(1)', borderRadius: '40%' },
            '25%': { transform: 'translate(-20%, -30%) rotate(45deg) scale(1.1)', borderRadius: '45%' },
            '50%': { transform: 'translate(-80%, -60%) rotate(90deg) scale(0.9)', borderRadius: '50%' },
            '75%': { transform: 'translate(-30%, -70%) rotate(135deg) scale(1.2)', borderRadius: '55%' },
            '100%': { transform: 'translate(-50%, -50%) rotate(180deg) scale(1)', borderRadius: '40%' },
          },
          [theme.breakpoints.down('sm')]: {
            '&::before': {
              animation: 'flow 20s linear infinite alternate', // Faster and simpler for mobile
              filter: 'blur(20px)',
              transformOrigin: '50% 50%',
              width: '200%',
              height: '200%',
            },
          },
        }}
      />

      <Box // This Box handles the fade animation
        sx={{
          opacity: isFadingOut ? 0 : 1,
          transition: 'opacity 0.5s ease-in-out',
          width: '100%', // Ensure it takes full width of the parent Box
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1, // Ensure it's above the animation layer
        }}
      >
        <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}> {/* New Box to wrap IconButton and AnimatedPaper */}
          <IconButton
            sx={{
              position: 'absolute',
              top: theme.spacing(1),
              right: theme.spacing(1),
              color: theme.palette.text.primary, // Adjust color based on theme
              zIndex: 10000, // Ensure it's above the paper
            }}
            onClick={toggleTheme}
          >
            {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <AnimatedPaper elevation={0}> {/* Elevation 0 as per new design */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              {/* Replace with your logo */}
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#fff', mb: 1 }}>LOGO</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center', fontSize: '24px' }}>
              Добро пожаловать
            </Typography>

            <TextField
              label="Имя"
              placeholder="Ваше имя"
              variant="outlined"
              fullWidth
              required
              value={name}
              onChange={handleNameChange}
              error={nameError}
              helperText={nameError ? 'Имя должно содержать минимум 2 символа' : ''}
              sx={{
                // Styles for the input element itself
                '& .MuiInputBase-input': {
                  color: theme.palette.text.primary, // White text
                  opacity: 1,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', // Dynamic semi-transparent background
                  borderRadius: theme.shape.borderRadius, // Apply border radius from theme
                },
                // Styles for the InputLabel
                '& .MuiInputLabel-root': {
                  color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)', // Dynamic lighter gray for label
                },
                // Styles for the OutlinedInput fieldset (border)
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent !important', // Remove default border
                },
              }}
            />

            <MuiTelInput
              label="Телефон"
              defaultCountry="RU"
              value={phone}
              onChange={handlePhoneChange}
              fullWidth
              required
              error={phoneError}
              helperText={phoneError ? 'Введите корректный номер телефона (минимум 11 цифр)' : ''}
              sx={{
                // Styles for the input element itself
                '& .MuiInputBase-input': {
                  color: theme.palette.text.primary, // White text
                  opacity: 1,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', // Dynamic semi-transparent background
                  borderRadius: theme.shape.borderRadius, // Apply border radius from theme
                },
                // Styles for the InputLabel
                '& .MuiInputLabel-root': {
                  color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)', // Dynamic lighter gray for label
                },
                // Styles for the OutlinedInput fieldset (border)
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent !important', // Remove default border
                },
              }}
            />
            <Button
              variant="contained"
              sx={{
                bgcolor: theme.palette.primary.main, // Use primary color for accent
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                  boxShadow: '0 0 8px 4px rgba(0, 191, 255, 0.4)', // Glow effect, consider using theme.palette.primary
                },
                mt: 2, // Spacing from inputs
              }}
              fullWidth
              onClick={handleContinue}
              disabled={!isFormValid}
            >
              Продолжить
            </Button>

            <Button
              variant="text"
              color="inherit"
              onClick={handleSkip}
              sx={{
                position: 'absolute', // Position at bottom right
                bottom: theme.spacing(2), // 2 units from bottom
                right: theme.spacing(2), // 2 units from right
                fontSize: '14px', // 14px font size
                color: 'grey.500', // Grey text
                '&:hover': {
                  bgcolor: 'transparent',
                  textDecoration: 'underline',
                },
                alignSelf: 'flex-end', // Align to the right within the flex container
              }}
            >
              Пропустить →
            </Button>
          </AnimatedPaper>
        </Box> {/* End of New Box */}
      </Box>
    </Box>
  );
};

export default WelcomePage; 