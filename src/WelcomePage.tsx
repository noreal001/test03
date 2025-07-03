import React, { useState, useContext } from 'react';
import { Box, TextField, Button, Typography, Paper, IconButton } from '@mui/material';
import { MuiTelInput } from 'mui-tel-input';
import { styled, useTheme } from '@mui/material/styles';
import { Fade } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { ThemeContext } from './index'; // Import ThemeContext

interface WelcomePageProps {
  onRegisterSuccess: (name: string, phone: string) => void;
  onContinueWithoutRegistration: () => void;
}

const AnimatedPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: 'rgba(18, 18, 18, 0.9)', // #121212 with 90% transparency
  color: theme.palette.text.primary,
  width: '90%',
  maxWidth: 500, // Fixed width 500px, responsive to 90%
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  position: 'relative',
  border: '1px solid rgba(255, 255, 255, 0.2)', // Thin white border (1px, opacity 20%)
  boxShadow: 'none', // Remove default paper shadow
  opacity: 0, // Start with opacity 0 for fade-in
  animation: 'fadeIn 0.3s forwards',
  // Define keyframes for fade-in animation
  '@keyframes fadeIn': {
    'from': { opacity: 0 },
    'to': { opacity: 1 },
  },
  [theme.breakpoints.up('sm')]: {
    width: 500,
  },
}));

const WelcomePage: React.FC<WelcomePageProps> = ({ onRegisterSuccess, onContinueWithoutRegistration }) => {
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

  const handlePhoneChange = (newValue: string) => {
    setPhone(newValue);
    const digitsOnly = newValue.replace(/\D/g, '');
    // Basic validation: at least 11 digits (for +7XXXXXXXXXX) and not just empty input
    setPhoneError(digitsOnly.length < 11 && digitsOnly.length > 0); 
  };

  // Simulate API call for phone validation
  const validatePhoneNumberApi = async (phoneNumber: string): Promise<boolean> => {
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length < 11) {
      return false; // Not enough digits for a valid phone number
    }
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300)); 
    // Simulate API response: true if phone is 'valid' (e.g., starts with +7999), false otherwise
    return digitsOnly.startsWith('7999'); 
  };

  const handleContinue = async () => {
    const isNameValid = name.trim().length >= 2;
    const digitsOnlyPhone = phone.replace(/\D/g, '');
    const isPhoneLengthValid = digitsOnlyPhone.length >= 11;

    if (!isNameValid || !isPhoneLengthValid) {
      setNameError(!isNameValid); 
      setPhoneError(!isPhoneLengthValid); 
      return;
    }

    const isPhoneValidApi = await validatePhoneNumberApi(phone);

    if (!isPhoneValidApi) {
      setPhoneError(true);
      // Removed alert, relying on helperText and visual error state
      return;
    }

    setIsFadingOut(true);
    localStorage.setItem('skip_reg', 'true');
    localStorage.setItem('skip_reg_timestamp', Date.now().toString());
    setTimeout(() => {
      onRegisterSuccess(name, phone);
      navigate('/');
    }, 300);
  };

  const handleSkip = () => {
    setIsFadingOut(true);
    localStorage.setItem('skip_reg', 'true');
    localStorage.setItem('skip_reg_timestamp', Date.now().toString());
    setTimeout(() => {
      onContinueWithoutRegistration();
      navigate('/');
    }, 300);
  };

  const isFormValid = name.trim().length >= 2 && phone.replace(/\D/g, '').length >= 11;

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
      }}
    >
      <Fade in={!isFadingOut} timeout={300}>
        <AnimatedPaper elevation={0}> {/* Elevation 0 as per new design */}
          <IconButton
            sx={{
              position: 'absolute',
              top: theme.spacing(1),
              right: theme.spacing(1),
              color: theme.palette.text.primary, // Adjust color based on theme
            }}
            onClick={toggleTheme}
          >
            {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

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
                backgroundColor: 'rgba(255,255,255,0.1)', // Semi-transparent background
                borderRadius: theme.shape.borderRadius, // Apply border radius from theme
              },
              // Styles for the InputLabel
              '& .MuiInputLabel-root': {
                color: 'rgba(255,255,255,0.7)', // Lighter gray for label
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
                backgroundColor: 'rgba(255,255,255,0.1)', // Semi-transparent background
                borderRadius: theme.shape.borderRadius, // Apply border radius from theme
              },
              // Styles for the InputLabel
              '& .MuiInputLabel-root': {
                color: 'rgba(255,255,255,0.7)', // Lighter gray for label
              },
              // Styles for the OutlinedInput fieldset (border)
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'transparent !important', // Remove default border
              },
            }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="contained"
              sx={{
                bgcolor: theme.palette.primary.main, // Use primary color for accent
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                  boxShadow: '0 0 8px 4px rgba(0, 191, 255, 0.4)', // Glow effect, consider using theme.palette.primary
                },
                flexGrow: 1, // Equal width
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
              fullWidth
              onClick={handleSkip}
              sx={{
                mt: 1,
                fontSize: '0.8rem', // Smaller text
                color: 'grey.500', // Grey text
                '&:hover': {
                  bgcolor: 'transparent',
                  textDecoration: 'underline',
                },
                flexGrow: 1, // Equal width
              }}
            >
              Пропустить
            </Button>
          </Box>
        </AnimatedPaper>
      </Fade>
    </Box>
  );
};

export default WelcomePage; 