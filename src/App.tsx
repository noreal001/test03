import React, { useState, useEffect, useContext } from 'react';
import { Box, List, ListItemButton, ListItemText, Typography, Paper, Fade, Divider, IconButton, TextField, InputAdornment, Stack, Avatar, useMediaQuery, useTheme, Button, Switch, ListItem, ListItemAvatar, Card, CardMedia, CardContent, Slider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist'; // Re-added import
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { createTheme } from '@mui/material/styles'; // Re-added import
// import Popper from '@mui/material/Popper'; // Removed unused import
// import ClickAwayListener from '@mui/material/ClickAwayListener'; // Removed unused import
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

type Brand = { name: string; aromas: Aroma[] };
type Aroma = { name: string; description: string; aroma_group: string; prices: { [key: string]: number }; image?: string };

interface Order {
  id: string;
  date: string;
  items: { aroma: string; brand: string; volume: string }[];
  comment: string;
  receiptAttached: boolean;
  history: {text: string, sender: 'user' | 'manager'; file?: {name: string, url: string}}[];
  awaitingManagerReply: boolean;
  address?: string; // New: Add address to Order type
  phone?: string;   // New: Add phone to Order type
}

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
      orders: [] as Order[], // Use defined Order type
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

  const handleAddToCart = (aromaName: string, brandName: string, volumeIndex: number) => {
    setCart(prev => [...prev, { aroma: aromaName, brand: brandName, volume: aromaInfo.volumes[volumeIndex] }]);
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

  const handleAromaClickFromCart = (aromaName: string, brandName: string, volume: string) => {
    // Logic to navigate to the aroma detail, or open a dialog
    // For now, let's assume it opens the aroma detail dialog
    // You might want to scroll to the aroma in the main view or open a specific dialog
    console.log(`Clicked on aroma: ${aromaName} from brand: ${brandName}, volume: ${volume}`);
    setSelectedAromaFromCart(aromaName);
    // If you want to show aroma details in a modal, you would open that modal here
    // For example:
    // handleOpenAromaDetail(aromaName, brandName, volume);
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

  const handleAddMessageToOrder = (orderIndex: number | null, comment: string, file: File | null) => {
    // This function can now directly call handleSendComment if logic is unified
    // For simplicity, I'll remove its usage if handleSendComment can cover it
    console.log(`Adding message to order ${orderIndex}: ${comment}`);
    handleSendComment(); // Call the unified send/save function
  };

  const handleCancelEditComment = () => {
    setEditingCommentIndex(null);
    setOrderComment('');
    setCommentFile(null);
  };

  const handleSaveEditedComment = () => {
    handleSendComment(); // Call the unified send/save function
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
                ml: 'auto', mr: 'auto', // Center the cart button
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
              sx={{ ml: 'auto', mr: 'auto', mb: 1 }} // Center the theme switch
            />
          </Box>
        )}

        {/* Центральная панель (ароматы/поиск) - теперь без полноэкранных профиля/корзины */}
        {!isProfileFullScreen && !isCartFullScreen && (
          <Box 
            sx={{
              flex: 1, 
              minWidth: 0, // Ensure it can shrink
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

            {/* Search Input */}
            <TextField
              label="Поиск ароматов и брендов"
              variant="outlined"
              fullWidth
              value={search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2, bgcolor: 'background.paper', width: '95%', mt: 2 }}
            />

            {/* Suggested Search Results */}
            {search && (
              <Paper sx={{ width: '95%', mb: 2, maxHeight: 200, overflowY: 'auto' }}>
                <List>
                  {suggestions.map((s, index) => (
                    <ListItemButton key={index} onClick={() => handleSuggestionClick(s, 'aroma')}> {/* Dummy type for now */}
                      <ListItemText primary={s} />
                    </ListItemButton>
                  ))}
                </List>
              </Paper>
            )}

            {/* Список или карточки ароматов */}
            <Box sx={{ display: 'flex', flexDirection: aromaView === 'cards' ? 'row' : 'column', flexWrap: 'wrap', gap: 2, justifyContent: aromaView === 'cards' ? 'center' : 'flex-start', width: '100%', overflowY: 'auto', pb: 2, pt: 0, px: 2 }}>
              {selectedIndex !== null && brands[selectedIndex]?.aromas
                ?.filter((aroma: Aroma) => aroma.name.toLowerCase().includes(search.toLowerCase()))
                .map((aroma: Aroma, aromaIdx: number) => (
                  <Card key={aroma.name} sx={{
                    width: aromaView === 'cards' ? 200 : '100%',
                    mb: aromaView === 'list' ? 2 : 0, // Margin bottom for list view
                    boxShadow: 'none', // Remove default card shadow
                    border: '1px solid rgba(0, 0, 0, 0.12)', // Thin grey border
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: aromaView === 'list' ? 'row' : 'column',
                    alignItems: aromaView === 'list' ? 'flex-start' : 'center',
                    gap: aromaView === 'list' ? 2 : 0,
                    p: aromaView === 'list' ? 2 : 0, // Padding for list view
                    position: 'relative', // For absolute positioning of cart icon
                  }} id={`aroma-${aroma.name}`}>
                    {aromaView === 'cards' && (
                      <CardMedia
                        component="img"
                        height="140"
                        image={aroma.image || 'https://via.placeholder.com/150'}
                        alt={aroma.name}
                        sx={{ width: '100%', objectFit: 'cover', borderRadius: 1, mb: 1 }}
                      />
                    )}
                    <CardContent sx={{ p: aromaView === 'list' ? 0 : 2, textAlign: aromaView === 'cards' ? 'center' : 'left', flexGrow: 1, width: '100%' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>{aroma.name}</Typography>
                      {aromaView === 'list' && (
                        <Typography variant="body2" color="text.secondary">{aroma.description}</Typography>
                      )}
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{brands[selectedIndex]?.name}</Typography>
                      <Box sx={{ display: 'flex', justifyContent: aromaView === 'cards' ? 'center' : 'flex-start', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LocalFloristIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                        <Typography variant="body2">{aroma.aroma_group}</Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {Object.keys(aroma.prices).map((volume) => (
                          `${volume}ml: ${aroma.prices[volume]} ₽`
                        )).join(' / ')}
                      </Typography>
                      {/* Volume Slider */}
                      <Box sx={{ width: '100%', px: 2, mt: 2 }}>
                        <Slider
                          aria-label="Объем"
                          defaultValue={0}
                          step={1}
                          marks
                          min={0}
                          max={Object.keys(aroma.prices).length - 1}
                          value={selectedVolumes[aroma.name] || 0}
                          onChange={(_, value) => handleVolumeSlider(aroma.name, value as number)}
                          valueLabelFormat={(value) => Object.keys(aroma.prices)[value]}
                          valueLabelDisplay="auto"
                          sx={{
                            color: 'primary.main',
                            '& .MuiSlider-thumb': {
                              width: 16,
                              height: 16,
                            },
                            '& .MuiSlider-track': {
                              height: 4,
                            },
                            '& .MuiSlider-rail': {
                              height: 4,
                            },
                          }}
                        />
                        <Typography variant="caption" sx={{ textAlign: 'center', width: '100%', display: 'block' }}>
                          Объем: {Object.keys(aroma.prices)[selectedVolumes[aroma.name] || 0]}ml
                        </Typography>
                      </Box>

                      <Button
                        variant="contained"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={() => handleAddToCart(aroma.name, brands[selectedIndex]?.name || '', Object.keys(aroma.prices).indexOf(Object.keys(aroma.prices)[selectedVolumes[aroma.name] || 0]))}
                      >
                        Добавить в корзину
                      </Button>

                    </CardContent>
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: aromaView === 'cards' ? 10 : '50%',
                        right: aromaView === 'cards' ? 10 : 10,
                        transform: aromaView === 'list' ? 'translateY(-50%)' : 'none',
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': { bgcolor: 'primary.dark' },
                      }}
                      onClick={() => handleAddToCart(aroma.name, brands[selectedIndex]?.name || '', Object.keys(aroma.prices).indexOf(Object.keys(aroma.prices)[selectedVolumes[aroma.name] || 0]))}
                    >
                      <ShoppingCartIcon />
                    </IconButton>
                  </Card>
                ))}
            </Box>

          </Box>
        )}

        {/* Полноэкранный профиль */}
        {isProfileFullScreen && (
          <Paper
            elevation={0}
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              left: brandsMenuOpen ? 340 : 66, // Dynamic left based on menu state
              bgcolor: 'background.default',
              color: 'text.primary',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              width: brandsMenuOpen ? 'calc(100vw - 340px)' : 'calc(100vw - 66px)', // Explicit width
              borderRadius: 0,
              boxShadow: 'none',
              zIndex: 3, // Higher zIndex to be on top
              overflowX: 'hidden'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'flex-end' }}>
              <IconButton onClick={() => setIsProfileFullScreen(false)} sx={{ color: 'text.secondary' }}>
                <CloseIcon />
              </IconButton>
            </Box>
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
        )}

        {/* Полноэкранная корзина */}
        {isCartFullScreen && (
          <Paper
            elevation={0}
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              left: brandsMenuOpen ? 340 : 66, // Dynamic left based on menu state
              bgcolor: 'background.default',
              color: 'text.primary',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              width: brandsMenuOpen ? 'calc(100vw - 340px)' : 'calc(100vw - 66px)', // Explicit width
              borderRadius: 0,
              boxShadow: 'none',
              zIndex: 3, // Higher zIndex to be on top
              overflowX: 'hidden'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'flex-end' }}>
              <IconButton onClick={() => setIsCartFullScreen(false)} sx={{ color: 'text.secondary' }}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, height: '100%', overflowY: 'auto' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 2 }}>Корзина</Typography>

              {cart.length === 0 ? (
                <Typography sx={{ textAlign: 'center', color: 'text.secondary' }}>Корзина пуста.</Typography>
              ) : (
                <List sx={{ width: '100%' }}>
                  {cart.map((item, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveFromCart(index)}>
                          <CloseIcon />
                        </IconButton>
                      }
                      sx={{ mb: 1, bgcolor: 'action.hover', borderRadius: 1, pr: 7 }}
                    >
                      <ListItemAvatar>
                        <Avatar><LocalFloristIcon /></Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${item.aroma} (${item.volume}ml)`}
                        secondary={item.brand}
                        onClick={() => handleAromaClickFromCart(item.aroma, item.brand, item.volume)} // Allow clicking to jump to aroma
                      />
                    </ListItem>
                  ))}
                </List>
              )}

              {cart.length > 0 && (
                <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
                  <Typography variant="h6" sx={{ textAlign: 'right', mb: 2 }}>
                    Итого: {cart.reduce((total, item) => {
                      // Find the brand and aroma to get the price
                      const brand = brands.find(b => b.name === item.brand);
                      const aroma = brand?.aromas.find(a => a.name === item.aroma);
                      return total + (aroma?.prices?.[item.volume] || 0);
                    }, 0)} ₽
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => setCheckoutStep('form')}
                  >
                    Оформить заказ
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        )}

        {/* Модальное окно деталей аромата */}
        <Dialog open={isAromaDetailDialogOpen} onClose={() => setIsAromaDetailDialogOpen(false)} maxWidth="md" fullWidth>
          {selectedAromaDetail && (
            <>
              <DialogTitle>{selectedAromaDetail.aroma}</DialogTitle>
              <DialogContent dividers>
                <Typography>Бренд: {selectedAromaDetail.brand}</Typography>
                <Typography>Объем: {selectedAromaDetail.volume}ml</Typography>
                {/* Add more details here */}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setIsAromaDetailDialogOpen(false)}>Закрыть</Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Модальное окно оформления заказа */}
        <Dialog open={checkoutStep !== null && checkoutStep !== 'orderDetail'} onClose={() => setCheckoutStep(null)} maxWidth="md" fullWidth>
          {checkoutStep === 'form' && (
            <>
              <DialogTitle>Оформление заказа</DialogTitle>
              <DialogContent dividers>
                {/* Order Form Content */}
                <TextField label="Ваше имя" fullWidth margin="normal" value={user.name} onChange={(e) => setUser(prev => ({...prev, name: e.target.value}))} />
                <TextField label="Ваш телефон" fullWidth margin="normal" value={user.phone} onChange={(e) => setUser(prev => ({...prev, phone: e.target.value}))} />
                <TextField label="Адрес доставки" fullWidth margin="normal" value={user.address} onChange={(e) => setUser(prev => ({...prev, address: e.target.value}))} />
                <TextField
                  label="Комментарий к заказу"
                  fullWidth
                  multiline
                  rows={4}
                  margin="normal"
                  value={orderComment}
                  onChange={(e) => setOrderComment(e.target.value)}
                />
                <Button
                  variant="contained"
                  component="label"
                  sx={{ mt: 2 }}
                >
                  Прикрепить файл
                  <input
                    type="file"
                    hidden
                    onChange={(e) => { if (e.target.files) setCommentFile(e.target.files[0]); }}
                  />
                </Button>
                {commentFile && <Typography variant="body2" sx={{ ml: 1 }}>{commentFile.name}</Typography>}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setCheckoutStep(null)}>Отмена</Button>
                <Button onClick={() => setCheckoutStep('payment')} variant="contained">Продолжить</Button>
              </DialogActions>
            </>
          )}
          {checkoutStep === 'payment' && (
            <>
              <DialogTitle>Оплата</DialogTitle>
              <DialogContent dividers>
                <Typography>Здесь будет платежная система.</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setCheckoutStep('form')}>Назад</Button>
                <Button onClick={handlePlaceOrder} variant="contained">Оплатить</Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Модальное окно деталей заказа */}
        <Dialog open={checkoutStep === 'orderDetail'} onClose={() => setCheckoutStep(null)} maxWidth="md" fullWidth>
          {currentOrder !== null && (
            <>
              <DialogTitle>Детали заказа №{user.orders[currentOrder].id}</DialogTitle>
              <DialogContent dividers>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Дата: {user.orders[currentOrder].date}</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Адрес: {user.orders[currentOrder].address || 'Не указан'}</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Телефон: {user.orders[currentOrder].phone || 'Не указан'}</Typography>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Товары:</Typography>
                <List dense>
                  {user.orders[currentOrder].items.map((item, idx) => (
                    <ListItem key={idx}>
                      <ListItemText primary={`${item.aroma} (${item.volume}ml) - ${item.brand}`}
                      />
                    </ListItem>
                  ))}
                </List>
                {user.orders[currentOrder].comment && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Ваш комментарий:</Typography>
                    <Typography variant="body2">{user.orders[currentOrder].comment}</Typography>
                  </Box>
                )}
                {user.orders[currentOrder].receiptAttached && (
                  <Typography variant="body2" sx={{ mt: 1 }}>Квитанция прикреплена.</Typography>
                )}

                {/* Order History/Chat */}
                <Box sx={{ mt: 2, p: 2, border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: 1, maxHeight: 200, overflowY: 'auto' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>История заказа:</Typography>
                  {user.orders[currentOrder].history.length > 0 ? (
                    user.orders[currentOrder].history.map((msg, idx) => (
                      <Box key={idx} sx={{ mb: 1, p: 1, bgcolor: msg.sender === 'user' ? 'primary.light' : 'grey.200', color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary', borderRadius: 1, alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{msg.sender === 'user' ? 'Вы:' : 'Менеджер:'}</Typography>
                        <Typography variant="body2">{msg.text}</Typography>
                        {msg.file && <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>Файл: <a href={msg.file.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>{msg.file.name}</a></Typography>}
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">История пуста.</Typography>
                  )}
                </Box>

                {user.orders[currentOrder].awaitingManagerReply && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>Ожидается ответ менеджера...</Typography>
                )}

                {/* Reply to manager */}
                {!user.orders[currentOrder].awaitingManagerReply && (
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <TextField
                      label="Ответить менеджеру"
                      fullWidth
                      multiline
                      rows={2}
                      value={orderComment}
                      onChange={(e) => setOrderComment(e.target.value)}
                    />
                    <Button
                      variant="contained"
                      component="label"
                      sx={{ mt: 1 }}
                    >
                      Прикрепить файл
                      <input
                        type="file"
                        hidden
                        onChange={(e) => { if (e.target.files) setCommentFile(e.target.files[0]); }}
                      />
                    </Button>
                    {commentFile && <Typography variant="body2" sx={{ ml: 1 }}>{commentFile.name}</Typography>}
                    <Button
                      variant="contained"
                      onClick={handleSendComment} // Use unified send/save function
                      sx={{ mt: 1 }}
                      disabled={!orderComment.trim() && !commentFile} // Disable if both comment and file are empty
                    >
                      Отправить ответ
                    </Button>
                    {editingCommentIndex !== null && (
                      <Button
                        variant="outlined"
                        onClick={handleCancelEditComment} // Use the new function
                        sx={{ mt: 1 }}
                      >
                        Отменить редактирование
                      </Button>
                    )}
                  </Box>
                )}

              </DialogContent>
              <DialogActions>
                <Button onClick={() => setCheckoutStep(null)}>Закрыть</Button>
                {editingCommentIndex !== null && (
                  <Button onClick={handleSendComment} variant="contained">Сохранить изменения</Button> // Use unified send/save function
                )}
                {profileTab === 'orders' && currentOrder !== null && (
                  <Button onClick={handleEditOrder} variant="outlined">Редактировать</Button>
                )}

              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </Box>
  );
};

export default App;
