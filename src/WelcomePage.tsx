import React, { useState, useContext } from 'react';
import { Box, TextField, Button, Typography, Paper, IconButton } from '@mui/material';
import { MuiTelInput } from 'mui-tel-input';
import { styled, useTheme } from '@mui/material/styles';
// import { Fade } from '@mui/material'; // Removed Fade import
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from './index'; // Import ThemeContext
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import SwapCallsIcon from '@mui/icons-material/SwapCalls'; // New import for background animation toggle
import Snowflake from './animations/Snowflake';
import Rain from './animations/Rain';
import Stars from './animations/Stars';
import Smoke from './animations/Smoke';

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
  const [backgroundAnimation, setBackgroundAnimation] = useState<'none' | 'snowflake' | 'rain' | 'stars' | 'smoke'>('none');
  const [inviteCode, setInviteCode] = useState('');
  const [inviteCodeError, setInviteCodeError] = useState(false);
  const navigate = useNavigate();
  const { themeMode, toggleTheme } = useContext(ThemeContext)!;
  const theme = useTheme();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    const filteredName = newName.replace(/[^a-zA-Z0-9-_а-яА-ЯёЁ ]/g, ''); // Allow letters, numbers, -, _ and spaces (fixed escape)
    setName(filteredName);
    setNameError(filteredName.trim().length < 2 && filteredName.trim().length > 0); // Name must be at least 2 characters
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
    // Simulate API response: true always for now to simplify testing
    return true; // Simplified: always return true for now
  };

  const handleInviteCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCode = e.target.value.replace(/[^0-9-]/g, ''); // Allow only numbers and hyphens
    let formattedCode = newCode;
    if (newCode.length > 4 && !newCode.includes('-')) {
      formattedCode = `${newCode.substring(0, 4)}-${newCode.substring(4, 8)}`;
    } else if (newCode.length > 9) { // Max 8 digits + 1 hyphen
      formattedCode = newCode.substring(0, 9);
    }
    setInviteCode(formattedCode);
    setInviteCodeError(false);
  };

  const validateInviteCode = (code: string): boolean => {
    // Example: Valid codes are '1234-5678' or '0000-0000'
    return code === '1234-5678'; // Replace with actual validation logic
  };

  const handleContinue = async () => {
    const isNameValid = name.trim().length >= 2;
    const isPhoneLengthValid = validatePhoneInput(phone);
    const isInviteCodeValid = validateInviteCode(inviteCode);

    if (!isNameValid || !isPhoneLengthValid || !isInviteCodeValid) {
      setNameError(!isNameValid);
      setPhoneError(!isPhoneLengthValid);
      setInviteCodeError(!isInviteCodeValid);
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
      navigate('/'); // Navigate to home page on successful registration
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

  const toggleBackgroundAnimation = () => {
    setBackgroundAnimation((prevAnimation) => {
      switch (prevAnimation) {
        case 'none': return 'snowflake';
        case 'snowflake': return 'rain';
        case 'rain': return 'stars';
        case 'stars': return 'smoke';
        case 'smoke': return 'none';
        default: return 'none';
      }
    });
  };

  const isFormValid = (name.trim().length >= 2 && validatePhoneInput(phone)) || validateInviteCode(inviteCode);

  // Debugging logs
  console.log('Current State:');
  console.log('Name:', name, 'Error:', nameError);
  console.log('Phone:', phone, 'Error:', phoneError);
  console.log('Invite Code:', inviteCode, 'Error:', inviteCodeError);
  console.log('isFormValid:', isFormValid);

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
        zIndex: 999, // Changed from 9999 to 999 to be behind modal
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

      {backgroundAnimation === 'snowflake' && <Snowflake />}
      {backgroundAnimation === 'rain' && <Rain />}
      {backgroundAnimation === 'stars' && <Stars />}
      {backgroundAnimation === 'smoke' && <Smoke />}

      <Box // This Box handles the fade animation
        sx={{
          opacity: isFadingOut ? 0 : 1,
          transition: 'opacity 0.5s ease-in-out',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          margin: '0 auto', // Center horizontally
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000, // Changed from 1 to 1000 to be on top of background
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
              transition: 'transform 0.1s ease-in-out', // Smooth animation
              '&:active': {
                transform: 'scale(0.9)', // Scale down on click
              },
            }}
            onClick={toggleTheme}
          >
            {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          <IconButton
            sx={{
              position: 'absolute',
              top: theme.spacing(1),
              right: theme.spacing(7), // Position next to theme button
              color: theme.palette.text.primary,
              zIndex: 10000,
              transition: 'transform 0.1s ease-in-out',
              '&:active': {
                transform: 'scale(0.9)',
              },
            }}
            onClick={toggleBackgroundAnimation}
          >
            <SwapCallsIcon />
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
              inputProps={{ pattern: '^[a-zA-Z0-9-_а-яА-ЯёЁ ]*$' }} // Prevent special characters (fixed escape)
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

            <TextField
              label="Инвайт-код"
              placeholder="XXXX-XXXX"
              variant="outlined"
              fullWidth
              required
              value={inviteCode}
              onChange={handleInviteCodeChange}
              error={inviteCodeError}
              helperText={inviteCodeError ? 'Неверный инвайт-код' : ''}
              inputProps={{ maxLength: 9 }} // Max length for XXXX-XXXX format
              sx={{
                // Styles for the input element itself
                '& .MuiInputBase-input': {
                  color: theme.palette.text.primary,
                  opacity: 1,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  borderRadius: theme.shape.borderRadius,
                },
                // Styles for the InputLabel
                '& .MuiInputLabel-root': {
                  color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
                },
                // Styles for the OutlinedInput fieldset (border)
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent !important',
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
                mb: 8, // Increased margin-bottom to create more space before the absolute positioned skip button
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