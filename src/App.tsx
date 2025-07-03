import React, { useState, useEffect, useContext } from 'react';
import { Box, List, ListItemButton, ListItemText, Typography, Paper, Fade, Divider, IconButton, TextField, InputAdornment, Chip, Stack, Avatar, useMediaQuery, useTheme, Button, Switch } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Popper from '@mui/material/Popper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from './index'; // Import ThemeContext

const toTitleCase = (phrase: string) => {
  return phrase
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Mock info for all aromas (можно расширить под каждый аромат)
const aromaInfo = {
  price: '1 800 ₽ — 38 000 ₽',
  quality: 'TOP',
  volumes: ['30 гр', '50 гр', '500 гр', '1 кг'],
  factory: 'Eps',
};

type Brand = { name: string; aromas: string[] };

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

const App: React.FC = () => {
  const navigate = useNavigate();
  const themeContext = useContext(ThemeContext);
  if (!themeContext) {
    throw new Error('App must be used within a ThemeProvider');
  }
  const { themeMode, toggleTheme } = themeContext;

  useEffect(() => {
    const checkRegistrationStatus = () => {
      const userRegistered = localStorage.getItem('userRegistered');
      const userName = localStorage.getItem('userName');
      const userPhone = localStorage.getItem('userPhone');
      const lastRegistrationTime = localStorage.getItem('lastRegistrationTime');
      const lastSkipTime = localStorage.getItem('lastSkipTime');

      const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
      const now = new Date().getTime();

      const registered = userRegistered === 'true' && !!userName && !!userPhone;
      const skippedRecently = lastSkipTime && (now - parseInt(lastSkipTime) < fiveMinutes);
      const registeredRecently = lastRegistrationTime && (now - parseInt(lastRegistrationTime) < fiveMinutes);

      if (registered) {
        setUser(prev => ({ ...prev, name: userName!, phone: userPhone! }));
      } else if (!skippedRecently && !registeredRecently) {
        // User is not registered and has not recently skipped or registered
        navigate('/start');
      }
    };

    // Initial check and setup interval
    checkRegistrationStatus();
    const intervalId = setInterval(checkRegistrationStatus, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [navigate]);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [brandsMenuOpen, setBrandsMenuOpen] = useState(true);
  const [search, setSearch] = useState('');
  // Сохраняем выбранный объём для каждого аромата (по имени)
  const [selectedVolumes, setSelectedVolumes] = useState<{ [aroma: string]: number }>({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const handleVolumeSlider = (aroma: string, idx: number) => {
    setSelectedVolumes((prev) => ({ ...prev, [aroma]: idx }));
  };

  const currentTheme = themeMode === 'light' ? lightTheme : darkTheme;
  const [cart, setCart] = useState<{ aroma: string; brand: string; volume: string }[]>([]);
  const [aromaView, setAromaView] = useState<'cards' | 'list'>('cards');
  const [profileTab, setProfileTab] = useState<'data' | 'orders'>('data');
  const [checkoutStep, setCheckoutStep] = useState<null | 'form' | 'payment' | 'orderDetail'> (null); // Changed to step-based
  const [currentOrder, setCurrentOrder] = useState<number | null>(null); // New state for selected order detail
  const [orderComment, setOrderComment] = useState<string>(''); // New state for order comment
  const [commentFile, setCommentFile] = useState<File | null>(null); // New state for comment file attachment
  const [editingCommentIndex, setEditingCommentIndex] = useState<number | null>(null); // New state to track which comment is being edited
  const [cartFlash, setCartFlash] = useState(false); // New state for cart flash animation
  const [emojiParticles, setEmojiParticles] = useState<Array<{ id: number; emoji: string; x: number; y: number; opacity: number }>>([]);
  const [isProfileFullScreen, setIsProfileFullScreen] = useState(false); // New state for full-screen profile
  const [isCartFullScreen, setIsCartFullScreen] = useState(false); // New state for full-screen cart
  const [selectedAromaFromCart, setSelectedAromaFromCart] = useState<string | null>(null); // New state to hold the aroma selected from cart
  const [isAromaDetailDialogOpen, setIsAromaDetailDialogOpen] = useState(false); // New state for aroma detail dialog
  const [selectedAromaDetail, setSelectedAromaDetail] = useState<{ aroma: string; brand: string; volume: string } | null>(null); // New state for selected aroma detail

  const [user, setUser] = useState(() => {
    const savedName = localStorage.getItem('userName') || '';
    const savedPhone = localStorage.getItem('userPhone') || '';
    return {
      name: savedName,
      balance: '12 500 ₽',
      avatar: '',
      orders: [] as { id: string; date: string; items: { aroma: string; brand: string; volume: string }[]; comment: string; receiptAttached: boolean; history: {text: string, sender: 'user' | 'manager'; file?: {name: string, url: string}}[]; awaitingManagerReply: boolean }[],
      address: '',
      phone: savedPhone,
    };
  });

  // New state for search suggestions
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const searchInputRef = React.useRef<HTMLInputElement>(null); // Ref for TextField

  useEffect(() => {
    fetch('/brands.json')
      .then(res => res.json())
      .then((data: Brand[]) => {
        const sorted = data.slice().sort((a, b) => a.name.localeCompare(b.name, 'ru'));
        setBrands(sorted);
      });
  }, []);

  useEffect(() => {
    if (selectedAromaFromCart) {
      const element = document.getElementById(`aroma-${selectedAromaFromCart}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setSelectedAromaFromCart(null); // Сбросить состояние после прокрутки
      }
    }
  }, [selectedAromaFromCart, selectedIndex]); // Зависимости: когда меняется выбранный аромат или выбранный бренд

  const handleBrandClick = (index: number) => {
    setSelectedIndex(index);
    setIsProfileFullScreen(false); // Закрываем профиль при выборе бренда
  };

  const handleBackToSearch = () => {
    setSelectedIndex(null);
    setIsProfileFullScreen(false); // Закрываем профиль при возврате к поиску
  };

  const handleToggleBrandsMenu = () => {
    setBrandsMenuOpen((prev) => !prev);
  };

  // 1. Кастомный слайдер объёма для карточки аромата:
  const volumeMarks = [30, 50, 500, 1000];

  // 2. Фильтры в поиске:
  // const [activeFilters, setActiveFilters] = useState<string[]>([]);
  // const filterOptions = [
  //   'TOP', 'Q1', 'Q2', 'МУЖСКИЕ', 'ЖЕНСКИЕ', 'УНИСЕКС',
  //   'АПЕЛЬСИН', 'УД', 'ТАБАК', 'МАНДАРИН',
  // ];
  // const handleFilterClick = (filter: string) => {
  //   setActiveFilters((prev) => prev.includes(filter)
  //     ? prev.filter(f => f !== filter)
  //     : [...prev, filter]);
  // };

  const handleOpenAromaDetail = (aroma: string, brand: string, volume: string) => {
    setSelectedAromaDetail({ aroma, brand, volume });
    setIsAromaDetailDialogOpen(true);
  };

  const handleCloseAromaDetailDialog = () => {
    setIsAromaDetailDialogOpen(false);
    setSelectedAromaDetail(null);
  };

  const handleAddToCart = (aroma: string, brand: string, volumeIdx: number) => {
    setCart(prev => [...prev, { aroma, brand, volume: aromaInfo.volumes[volumeIdx] }]);
    setCartFlash(true); // Trigger flash animation
    setTimeout(() => {
      setCartFlash(false); // Reset flash after a short delay
    }, 300);

    // Trigger emoji explosion
    const emojis = ['✨', '🎉', '🚀', '💫', '💯', '✅'];
    const newParticle = { // Create only one particle
      id: Date.now(),
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: 0, // Start exactly at the center (0 offset from 50% left)
      y: 0, // Start exactly at the center (0 offset from 50% top)
      opacity: 1,
    };
    setEmojiParticles([newParticle]); // Set only this new particle

    // Fade out and remove the particle after a delay
    setTimeout(() => {
      setEmojiParticles(prev => prev.map(p => p.id === newParticle.id ? { ...p, opacity: 0 } : p));
      setTimeout(() => {
        setEmojiParticles(prev => prev.filter(p => p.id !== newParticle.id));
      }, 500); // Remove after fade out
    }, 100); // Start fade out after 100ms

    // Play sound effect
    const audioPath = '/voice/voice1.mp3';
    const audio = new Audio(audioPath); // Make sure you have voice1.mp3 in your public/voice folder
    audio.play()
      .then(() => {
      })
      .catch(e => {
        if (e.name === 'NotAllowedError') {
          console.warn('Audio autoplay was prevented by the browser. User interaction might be required first.');
        } else if (e.name === 'DOMException' && e.message.includes('The play() request was interrupted')) {
          console.warn('Audio playback was interrupted. This can happen if the audio source changes rapidly.');
        }
      });
  };
  const handleRemoveFromCart = (idx: number) => {
    setCart(prev => prev.filter((_, i) => i !== idx));
  };

  const handlePlaceOrder = () => {
    setCheckoutStep('form');
  };

  const handleSendOrderDetails = () => {
    // Here you would typically send address and phone to backend
    // For now, move to payment step
    setCheckoutStep('payment');
  };

  const handlePaymentComplete = () => {
    const newOrderId = `ORD-${Date.now()}`;
    const newOrder = { id: newOrderId, date: new Date().toLocaleDateString(), items: [...cart], comment: '', receiptAttached: false, history: [], awaitingManagerReply: false };
    setUser(prevUser => ({...prevUser, orders: [...prevUser.orders, newOrder]})); // Update user orders
    setCart([]); // Clear cart
    setCheckoutStep('orderDetail'); 
    setIsCartFullScreen(false); // Close full screen cart
    setCurrentOrder(user.orders.length); // Select the newly created order (length is the index of the new item)
  };

  const handleCloseCheckoutDialog = () => {
    setCheckoutStep(null);
    setOrderComment(''); // Clear order comment input
    setCommentFile(null); // Clear comment file on dialog close
    setEditingCommentIndex(null); // Clear editing index
    setIsCartFullScreen(false); // Close full screen cart
  };

  const handleOrderCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderComment(e.target.value);
  };

  const handleSendComment = () => {
    if (currentOrder === null || (orderComment.trim() === '' && !commentFile)) {
      alert('Пожалуйста, введите комментарий или прикрепите файл.');
      return;
    }

    setUser(prevUser => {
      const updatedOrders = [...prevUser.orders];
      const currentOrderData = { ...updatedOrders[currentOrder!] };

      if (editingCommentIndex !== null) {
        // User is editing an existing comment
        currentOrderData.history[editingCommentIndex] = {
          ...currentOrderData.history[editingCommentIndex],
          text: orderComment,
          file: commentFile ? { name: commentFile.name, url: URL.createObjectURL(commentFile) } : undefined,
        };
        setEditingCommentIndex(null); // Clear editing index after saving
      } else {
        // User is sending a new comment
        const newComment: { text: string; sender: 'user' | 'manager'; file?: { name: string; url: string } } = { text: orderComment, sender: 'user' };
        if (commentFile) {
          newComment.file = { name: commentFile.name, url: URL.createObjectURL(commentFile) };
        }
        currentOrderData.history.push(newComment);
        currentOrderData.awaitingManagerReply = true;
        setOrderComment(''); // Clear input after sending a *new* comment
        setCommentFile(null); // Clear attached file after sending a *new* comment

        // Simulate manager reply after a short delay
        setTimeout(() => {
          setUser(latestUser => {
            const latestOrders = [...latestUser.orders];
            const latestCurrentOrderData = { ...latestOrders[currentOrder!] };
            // Prevent duplicate manager replies
            const lastMessage = latestCurrentOrderData.history[latestCurrentOrderData.history.length - 1];
            if (!lastMessage || lastMessage.sender !== 'manager') {
              latestCurrentOrderData.history.push({ text: 'Менеджер: Спасибо за ваш комментарий! Мы его рассмотрим.', sender: 'manager' });
            }
            latestCurrentOrderData.awaitingManagerReply = false;
            latestOrders[currentOrder!] = latestCurrentOrderData;
            return { ...latestUser, orders: latestOrders };
          });
        }, 3000);
      }

      updatedOrders[currentOrder!] = currentOrderData;
      return { ...prevUser, orders: updatedOrders };
    });
  };

  const handleCommentFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCommentFile(e.target.files[0]);
    }
  };

  const handleEditOrder = () => {
    if (currentOrder !== null) {
      alert(`Функция редактирования заказа №${user.orders[currentOrder].id} пока не реализована.`);
      // Implement actual order editing logic here later
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSuggestionClick = (suggestion: string, type: 'brand' | 'aroma') => {
    // Implement the logic to handle suggestion click
    console.log(`Suggestion clicked: ${suggestion}, type: ${type}`);
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: 'background.paper', color: 'text.primary', display: 'flex', flexDirection: 'column' }}>
      {/* Main content area (left menu, central content, right panels) */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', p: 0, pt: 0, overflowX: 'hidden', alignItems: 'stretch' }}>

        {/* Меню брендов слева */}
        {brandsMenuOpen && (
          <Paper elevation={0} sx={{ width: 340, minWidth: 340, maxWidth: 340, bgcolor: 'background.paper', p: 2, pr: 2, pb: 0, mr: 0, mb: isMobile ? 2 : 0, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', position: 'relative', height: '100%', justifyContent: 'flex-start', borderTopRightRadius: 0, borderBottomRightRadius: 0, boxShadow: 'none', boxSizing: 'border-box', bottom: 0, borderRight: '1px solid rgba(0, 0, 0, 0.12)', zIndex: 2 }}>
            {/* Кнопка сворачивания меню */}
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', mb: 1 }}>
              <IconButton onClick={handleToggleBrandsMenu} sx={{ mr: 1 }}>
                <MenuOpenIcon />
              </IconButton>
              <IconButton onClick={handleBackToSearch} sx={{ mb: 1, ml: 1 }}>
                <SearchIcon />
              </IconButton>
              {/* Consolidated PersonIcon now directly opens profile */}
              <IconButton
                sx={{ color: 'text.primary', mb: 1, ml: 1 }}
                onClick={() => {
                  setIsProfileFullScreen(true); // Always open profile full screen
                  setIsCartFullScreen(false); // Ensure cart full screen is off
                  // handleOpenLoginDialog(); // Removed as login is now on a separate page
                }}
              >
                <PersonIcon sx={{ fontSize: 28 }} />
              </IconButton>
              {/* Cart Button - Relocated */}
              <IconButton
                sx={{
                  color: 'text.primary',
                  position: 'relative',
                  bgcolor: cartFlash ? 'rgba(0, 255, 0, 0.2)' : 'transparent', // Flash effect
                  transition: 'background-color 0.3s ease-in-out',
                  ml: 2
                }}
                onClick={() => {
                  setIsCartFullScreen(!isCartFullScreen); // Toggle full screen mode for cart
                  setIsProfileFullScreen(false); // Ensure profile full screen is off
                }}
              >
                <ShoppingCartIcon sx={{ fontSize: 28 }} />
                {cart.length > 0 && (
                  <Box sx={{ position: 'absolute', top: -5, right: -5, bgcolor: 'error.main', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{cart.length}</Box>
                )}
              </IconButton>
              {/* Theme Toggle Switch - Relocated */}
              <Switch
                checked={themeMode === 'dark'}
                onChange={toggleTheme}
                color="default"
                inputProps={{ 'aria-label': 'theme switch' }}
                sx={{ ml: 1 }}
              />
            </Box>
            {/* Заголовок */}
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', textAlign: 'center', width: '100%', fontSize: 17, letterSpacing: 1, color: 'text.primary' }}>
              БРЕНДЫ
            </Typography>
            {/* Список брендов */}
            <List sx={{ width: '100%', height: '100%', overflowY: 'auto', pb: 8 }}>
              {brands.filter(brand => brand.name.toLowerCase().includes(search.toLowerCase()))
                .map((brand, index) => (
                  <ListItemButton
                    key={brand.name}
                    selected={selectedIndex === index}
                    onClick={() => handleBrandClick(index)}
                    sx={{ mb: 0.5, borderRadius: 1 }}
                  >
                    <ListItemText primary={brand.name} />
                  </ListItemButton>
                ))}
            </List>
          </Paper>
        )}

        {!brandsMenuOpen && (
          <Box sx={{
            width: 66,
            minWidth: 66,
            maxWidth: 66,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            height: '100%',
            bgcolor: 'background.paper',
            opacity: 0.96,
            pt: 2,
            position: 'relative',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
            zIndex: 2
          }}>
            <IconButton onClick={handleToggleBrandsMenu} sx={{ mb: 1, ml: 1 }}>
              <MenuIcon />
            </IconButton>
            <IconButton onClick={handleBackToSearch} sx={{ mb: 1, ml: 1 }}>
              <SearchIcon />
            </IconButton>
            {/* Consolidated PersonIcon now directly opens profile */}
            <IconButton
              sx={{ color: 'text.primary', mb: 1, ml: 1 }}
              onClick={() => {
                setIsProfileFullScreen(true); // Always open profile full screen
                setIsCartFullScreen(false); // Ensure cart full screen is off
                // handleOpenLoginDialog(); // Removed as login is now on a separate page
              }}
            >
              <PersonIcon sx={{ fontSize: 28 }} />
            </IconButton>
            {/* Cart Button - Relocated */}
            <IconButton
              sx={{
                color: 'text.primary',
                position: 'relative',
                bgcolor: cartFlash ? 'rgba(0, 255, 0, 0.2)' : 'transparent', // Flash effect
                transition: 'background-color 0.3s ease-in-out',
                ml: 1,
                mb: 1
              }}
              onClick={() => {
                setIsCartFullScreen(!isCartFullScreen); // Toggle full screen mode for cart
                setIsProfileFullScreen(false); // Ensure profile full screen is off
              }}
            >
              <ShoppingCartIcon sx={{ fontSize: 28 }} />
              {cart.length > 0 && (
                <Box sx={{ position: 'absolute', top: -5, right: -5, bgcolor: 'error.main', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{cart.length}</Box>
              )}
            </IconButton>
            {/* Theme Toggle Switch - Relocated */}
            <Switch
              checked={themeMode === 'dark'}
              onChange={toggleTheme}
              color="default"
              inputProps={{ 'aria-label': 'theme switch' }}
              sx={{ ml: 1, mb: 1 }}
            />
          </Box>
        )}

        {/* Центральная панель (ароматы/поиск/полноэкранный профиль/полноэкранная корзина) */}
        <Box 
          sx={{
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'flex-start', 
            height: '100%', 
            position: 'relative', // Needed for absolute positioning of emojis
            top: 0, 
            bgcolor: cartFlash ? 'rgba(0, 255, 0, 0.1)' : 'background.paper', // Flash effect on central panel
            transition: 'background-color 0.3s ease-in-out',
            zIndex: 1, 
            px: 0, 
            borderTopLeftRadius: 0, 
            borderBottomLeftRadius: 0, 
            boxSizing: 'border-box'
          }}
        >
          {/* Emoji explosion particles */}
          {emojiParticles.map(particle => (
            <span
              key={particle.id}
              style={{
                position: 'absolute',
                left: '50%', // Position origin at center of parent
                top: '50%',   // Position origin at center of parent
                fontSize: '30px',
                opacity: particle.opacity,
                transform: `translate(-50%, -50%)`, // Centered without vx/vy for simplicity
                transition: 'opacity 0.4s linear', // Fade transition
                pointerEvents: 'none', // Allow interaction with elements below
                zIndex: 100,
              }}
            >
              {particle.emoji}
            </span>
          ))}

          {/* Conditional content inside the central panel */}
          {isProfileFullScreen ? (
            <Paper elevation={0} sx={{ flex: 1, bgcolor: 'background.default', color: 'text.primary', p: 3, display: 'flex', flexDirection: 'column', height: '100%', width: '100%', borderRadius: 0, boxShadow: 'none' }}>
              {/* <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Профиль</Typography>
              </Box> */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                {/* Menu profile on the left */}
                <Box sx={{ width: 120, borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', py: 2 }}>
                  <List disablePadding>
                    <ListItemButton selected={profileTab==='data'} onClick={()=>setProfileTab('data')} sx={{ px: 2, py: 1 }}>Данные</ListItemButton>
                    <ListItemButton selected={profileTab==='orders'} onClick={()=>setProfileTab('orders')} sx={{ px: 2, py: 1 }}>Заказы</ListItemButton>
                  </List>
                </Box>
                {/* Profile content based on profileTab */}
                <Box sx={{ flex: 1, minWidth: 220, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  {profileTab === 'data' && (
                    <>
                      <Avatar src={user.avatar} alt={user.name} sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontWeight: 700, fontSize: 32 }}>
                        {user.avatar ? '' : user.name[0]}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>{user.name}</Typography>
                      <Typography variant="body1" color="text.secondary">Баланс: {user.balance}</Typography>
                      <TextField
                        label="ФИО"
                        fullWidth
                        size="small"
                        value={user.name}
                        onChange={(e) => {
                          setUser(prev => ({...prev, name: e.target.value}));
                          localStorage.setItem('userName', e.target.value);
                        }}
                        sx={{
                          mt: 2,
                          // Styles for the input element itself
                          '& .MuiInputBase-input': {
                            color: theme.palette.text.primary, // Text color based on theme
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', // Dynamic semi-transparent background
                            borderRadius: theme.shape.borderRadius,
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
                        label="Адрес"
                        fullWidth
                        size="small"
                        value={user.address}
                        onChange={(e) => setUser(prev => ({...prev, address: e.target.value}))}
                        sx={{
                          // Styles for the input element itself
                          '& .MuiInputBase-input': {
                            color: theme.palette.text.primary, // Text color based on theme
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', // Dynamic semi-transparent background
                            borderRadius: theme.shape.borderRadius,
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
                        label="Телефон"
                        fullWidth
                        size="small"
                        value={user.phone}
                        onChange={(e) => {
                          setUser(prev => ({...prev, phone: e.target.value}));
                          localStorage.setItem('userPhone', e.target.value);
                        }}
                        sx={{
                          // Styles for the input element itself
                          '& .MuiInputBase-input': {
                            color: theme.palette.text.primary, // Text color based on theme
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', // Dynamic semi-transparent background
                            borderRadius: theme.shape.borderRadius,
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
                      {(localStorage.getItem('userRegistered') !== 'true' || !user.phone) && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => navigate('/start')}
                          sx={{ mt: 2 }}
                        >
                          Завершить регистрацию
                        </Button>
                      )}
                    </>
                  )}
                  {profileTab === 'orders' && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h6">Мои заказы</Typography>
                      {user.orders.length === 0 ? (
                        <Typography sx={{ textAlign: 'center', color: 'text.secondary' }}>У вас пока нет заказов.</Typography>
                      ) : (
                        <List>
                          {user.orders.map((order, index) => (
                            <ListItemButton key={order.id} onClick={() => {
                              setCurrentOrder(index);
                              setCheckoutStep('orderDetail');
                              setOrderComment(order.history.slice().reverse().find((msg: {sender: string}) => msg.sender === 'user')?.text || ''); // Set comment for editing
                            }} sx={{ mb: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                              <ListItemText
                                primary={`Заказ №${order.id} от ${order.date}`}
                                secondary={`Товаров: ${order.items.length}`}
                              />
                            </ListItemButton>
                          ))}
                        </List>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          ) : isCartFullScreen ? (
            <Paper elevation={0} sx={{ flex: 1, bgcolor: 'background.default', color: 'text.primary', p: 3, display: 'flex', flexDirection: 'column', height: '100%', width: '100%', borderRadius: 0, boxShadow: 'none' }}>
              {/* Cart Content */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Корзина ({cart.length} шт.)</Typography>
                <IconButton onClick={() => setIsCartFullScreen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {cart.length === 0 ? (
                <Typography sx={{ textAlign: 'center', color: 'text.secondary', mt: 4 }}>Корзина пуста.</Typography>
              ) : (
                <List sx={{ width: '100%', flex: 1, overflowY: 'auto' }}>
                  {cart.map((item, idx) => (
                    <ListItemButton key={idx} sx={{ mb: 1, bgcolor: 'action.hover', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => handleOpenAromaDetail(item.aroma, item.brand, item.volume)}>
                      <ListItemText primary={`${toTitleCase(item.aroma)} (${item.volume})`} secondary={item.brand} />
                      <IconButton edge="end" aria-label="delete" onClick={(e) => {
                        e.stopPropagation(); // Prevent ListItemButton click from firing
                        handleRemoveFromCart(idx);
                      }}>
                        <CloseIcon />
                      </IconButton>
                    </ListItemButton>
                  ))}
                </List>
              )}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePlaceOrder}
                  disabled={cart.length === 0}
                  fullWidth
                >
                  Оформить заказ
                </Button>
              </Box>
            </Paper>
          ) : selectedIndex === null ? (
            <Paper elevation={4} sx={{ width: '100%', p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, borderRadius: 0, boxSizing: 'border-box' }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                Поиск ароматов
              </Typography>
              <TextField
                variant="outlined"
                placeholder="Введите название аромата..."
                value={search}
                onChange={handleSearchChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                inputRef={searchInputRef}
              />
              {/* Search suggestions */}
              {search && suggestions.length > 0 && (
                <Paper sx={{ width: '100%', maxHeight: 200, overflowY: 'auto', mt: 1 }}>
                  <List dense>
                    {suggestions.map((suggestion, idx) => (
                      <ListItemButton key={idx} onClick={() => handleSuggestionClick(suggestion, 'aroma')}> {/* Assuming suggestion is aroma name */}
                        <ListItemText primary={toTitleCase(suggestion)} />
                      </ListItemButton>
                    ))}
                  </List>
                </Paper>
              )}
            </Paper>
          ) : (
            <Fade in={selectedIndex !== null} timeout={400} unmountOnExit>
              <Paper elevation={4} sx={{ width: '100%', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, position: 'relative', flex: 1, minHeight: 0, overflowY: 'auto', boxSizing: 'border-sizing', bgcolor: 'background.default' }}>
                {/* Header for brand aromas */}
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1, justifyContent: 'space-between' }}>
                  <IconButton onClick={handleBackToSearch} sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                  </IconButton>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1, minWidth: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {brands[selectedIndex].name}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2, width: '100%' }} />

                {/* View Toggle Buttons - NEW LOCATION, centered */}
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mb: 2 }}>
                  <IconButton onClick={() => setAromaView('cards')} color={aromaView === 'cards' ? 'primary' : 'default'}><ViewModuleIcon /></IconButton>
                  <IconButton onClick={() => setAromaView('list')} color={aromaView === 'list' ? 'primary' : 'default'}><ViewListIcon /></IconButton>
                </Box>

                {/* Список или карточки ароматов */}
                {aromaView === 'cards' ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: '100%', justifyContent: 'center' }}>
                    {brands[selectedIndex].aromas.map((aroma) => {
                      const volumeIdx = selectedVolumes[aroma] ?? 0;
                      return (
                        <Paper key={aroma} elevation={2} sx={{ width: 280, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2, bgcolor: 'background.paper' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>{toTitleCase(aroma)}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{aromaInfo.price}</Typography>
                          <Box sx={{ width: '100%', px: 0.5, position: 'relative', minHeight: 50, mt: 1 }}>
                            <Box sx={{ position: 'absolute', left: 0, right: 0, top: 0, height: 32, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', zIndex: 2 }}>
                              {volumeMarks.map((v, idx) => (
                                <Box key={v} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', minWidth: 28 }} onClick={() => handleVolumeSlider(aroma, idx)}>
                                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: idx === volumeIdx ? 'success.main' : 'grey.700', border: idx === volumeIdx ? '2px solid #fff' : '2px solid #b9fbc0', mb: 0.3, transition: 'background 0.3s, border 0.3s' }} />
                                  <Typography variant="caption" sx={{ color: idx === volumeIdx ? 'success.main' : 'text.secondary', fontWeight: idx === volumeIdx ? 700 : 400, transition: 'color 0.3s', mt: 0.2, fontSize: 10 }}>{v}</Typography>
                                </Box>
                              ))}
                            </Box>
                            {/* Градиентная полоса */}
                            <Box sx={{ position: 'absolute', left: 0, right: 0, top: 38, height: 6, borderRadius: 3, background: 'linear-gradient(90deg, #b9fbc0 0%, #a3f7bf 100%)', opacity: 0.5 }} />
                            {/* Бегунок */}
                            <Box sx={{ position: 'absolute', top: 35, width: 20, height: 20, borderRadius: '50%', bgcolor: 'primary.main', boxShadow: '0px 2px 5px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'left 0.3s ease', left: `calc(${(volumeIdx / (volumeMarks.length - 1)) * 100}% - 10px)` }} />
                          </Box>
                          <Button variant="contained" color="success" sx={{ mt: 2 }} fullWidth onClick={() => handleAddToCart(aroma, brands[selectedIndex].name, volumeIdx)}>
                            Добавить в корзину
                          </Button>
                        </Paper>
                      );
                    })}
                  </Box>
                ) : (
                  <List sx={{ width: '100%' }}>
                    {brands[selectedIndex].aromas.map((aroma) => {
                      const volumeIdx = selectedVolumes[aroma] ?? 0;
                      return (
                        <ListItemButton key={aroma} id={`aroma-${aroma}`} sx={{ mb: 1, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography sx={{ fontWeight: 600 }}>{toTitleCase(aroma)}</Typography>
                            <Typography variant="caption" color="text.secondary">{aromaInfo.price} • {aromaInfo.volumes[volumeIdx]}</Typography>
                          </Box>
                          <Box>
                            <IconButton color="success" onClick={() => handleAddToCart(aroma, brands[selectedIndex].name, volumeIdx)}>
                              <ShoppingCartIcon />
                            </IconButton>
                          </Box>
                        </ListItemButton>
                      );
                    })}
                  </List>
                )}
              </Paper>
            </Fade>
          )}
        </Box>

        {/* Checkout Dialog */}
        <Dialog open={checkoutStep !== null} onClose={handleCloseCheckoutDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{checkoutStep === 'form' ? 'Оформление заказа' : checkoutStep === 'payment' ? 'Оплата заказа' : 'Детали заказа'}</DialogTitle>
          <DialogContent>
            {checkoutStep === 'form' && (
              <Stack spacing={2}>
                <TextField
                  label="Адрес доставки"
                  variant="outlined"
                  fullWidth
                  value={user.address}
                  onChange={(e) => setUser(prev => ({...prev, address: e.target.value}))}
                />
                <TextField
                  label="Телефон"
                  variant="outlined"
                  fullWidth
                  value={user.phone}
                  onChange={(e) => setUser(prev => ({...prev, phone: e.target.value}))}
                />
              </Stack>
            )}
            {checkoutStep === 'payment' && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Реквизиты для оплаты:</Typography>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Сумма заказа: {cart.reduce((total, item) => {
                    const priceMatch = aromaInfo.price.match(/(\d+)\s*₽/);
                    const itemPrice = priceMatch ? parseInt(priceMatch[1].replace(/\s/g, '')) : 0;
                    return total + itemPrice;
                  }, 0)} ₽
                </Typography>
                <Typography sx={{ mb: 1 }}>Переведите сумму заказа по номеру телефона: <Typography component="span" fontWeight="bold">89207005595</Typography></Typography>
                <Typography sx={{ mb: 2 }}>или по номеру карты: <Typography component="span" fontWeight="bold">2202 2067 6401 4721</Typography></Typography>
                <Typography sx={{ mb: 1, fontStyle: 'italic' }}>Не пишите ничего в комментариях к переводу.</Typography>
                <Typography sx={{ mb: 2 }}>ФИО получателя: <Typography component="span" fontWeight="bold">Джавадов Джамал Ясарович</Typography></Typography>
                <Typography variant="body2" color="text.secondary">После оплаты нажмите "Продолжить далее" и отправьте нам чек.</Typography>
              </Box>
            )}
            {/* Order Detail View */}
            {checkoutStep === 'orderDetail' && currentOrder !== null && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Детали заказа №{user.orders[currentOrder].id}</Typography>
                <List>
                  {user.orders[currentOrder].items.map((item, idx) => (
                    <ListItemText key={idx} primary={`${item.aroma} (${item.volume})`} secondary={item.brand} />
                  ))}
                </List>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>История комментариев:</Typography>
                <Box sx={{ maxHeight: 150, overflowY: 'auto', border: '1px solid #444', borderRadius: 1, p: 1, mb: 2 }}>
                  {user.orders[currentOrder].history.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">Нет комментариев.</Typography>
                  ) : (
                    user.orders[currentOrder].history.map((msg, idx) => (
                      <Box key={idx} sx={{ mb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: msg.sender === 'user' ? 'primary.main' : 'text.secondary' }}>
                          <Typography component="span" fontWeight="bold">{msg.sender === 'user' ? 'Вы' : 'Менеджер'}: </Typography>{msg.text}
                          {msg.file && (
                            <Typography component="span" sx={{ ml: 1, fontSize: '0.75rem' }}>
                              (Файл: <a href={msg.file.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>{msg.file.name}</a>)
                            </Typography>
                          )}
                        </Typography>
                        {msg.sender === 'user' && (
                          <Button size="small" onClick={() => {
                            setOrderComment(msg.text);
                            setCommentFile(msg.file ? new File([], msg.file.name) : null); // Re-create File object from name/url
                            setEditingCommentIndex(idx);
                          }}>Редактировать</Button>
                        )}
                      </Box>
                    ))
                  )}
                </Box>
                <TextField
                  label="Комментарий к заказу"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  value={orderComment}
                  onChange={handleOrderCommentChange}
                  sx={{ mt: 2, mb: 2 }}
                />
                {currentOrder !== null && user.orders[currentOrder].awaitingManagerReply && (
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>Ожидайте ответа менеджера.</Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Button variant="contained" onClick={handleSendComment} sx={{ mr: 1 }} disabled={orderComment.trim() === '' && !commentFile}>Отправить комментарий</Button>
                  <input
                    accept="image/*,.pdf"
                    style={{ display: 'none' }}
                    id="comment-file-upload-button"
                    type="file"
                    onChange={handleCommentFileUpload}
                  />
                  <label htmlFor="comment-file-upload-button">
                    <Button variant="outlined" component="span">
                      Приложить фото
                    </Button>
                  </label>
                  {commentFile && <Typography variant="body2">{commentFile.name}</Typography>}
                </Box>
                <Button variant="outlined" color="secondary" onClick={handleEditOrder} sx={{ mt: 2 }}>
                  Редактировать заказ
                </Button>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            {checkoutStep === 'form' && (
              <>
                <Button onClick={handleCloseCheckoutDialog}>Отмена</Button>
                <Button onClick={handleSendOrderDetails} variant="contained" color="primary">Отправить</Button>
              </>
            )}
            {checkoutStep === 'payment' && (
              <Button onClick={handlePaymentComplete} variant="contained" color="success">Я оплатил</Button>
            )}
            {checkoutStep === 'orderDetail' && (
              <Button onClick={handleCloseCheckoutDialog} variant="contained">Закрыть</Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Aroma Detail Dialog */}
        <Dialog open={isAromaDetailDialogOpen} onClose={handleCloseAromaDetailDialog} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {selectedAromaDetail && toTitleCase(selectedAromaDetail.aroma)}
            <IconButton onClick={handleCloseAromaDetailDialog}><CloseIcon /></IconButton>
          </DialogTitle>
          <DialogContent>
            {selectedAromaDetail && (
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight="bold">Бренд: {selectedAromaDetail.brand}</Typography>
                <Typography variant="body2">Цена: {aromaInfo.price}</Typography>
                <Typography variant="body2">Качество: {aromaInfo.quality}</Typography>
                <Typography variant="body2">Объёмы: {aromaInfo.volumes.join(', ')}</Typography>
                <Typography variant="body2">Фабрика: {aromaInfo.factory}</Typography>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            {selectedAromaDetail && (
              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={() => {
                  const brandIdx = brands.findIndex(b => b.name === selectedAromaDetail.brand);
                  handleAddToCart(selectedAromaDetail.aroma, selectedAromaDetail.brand, aromaInfo.volumes.indexOf(selectedAromaDetail.volume));
                  handleCloseAromaDetailDialog();
                }}
              >
                Добавить в корзину
              </Button>
            )}
          </DialogActions>
        </Dialog>

      </Box>
    </Box>
  );
};

export default App;
