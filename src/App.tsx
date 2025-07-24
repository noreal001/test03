import React, { useState, useEffect, useContext, ChangeEvent } from 'react';
import { Box, List, ListItemButton, ListItemText, Typography, Paper, IconButton, TextField, InputAdornment, Avatar, useMediaQuery, useTheme, Button, Switch, ListItem, ListItemAvatar, Card, CardMedia, CardContent, Slider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from './index'; // Import ThemeContext

// Mock info for all aromas (можно расширить под каждый аромат)
const aromaInfo = {
  price: '1 800 ₽ — 38 000 ₽',
  quality: 'TOP',
  volumes: ['30 гр', '50 гр', '500 гр', '1 кг'],
  factory: 'Eps',
};

type Brand = { name: string; aromas: Aroma[] };
type Aroma = { name: string; description: string; aroma_group: string; prices: { [key: string]: number }; image?: string; brand?: string };

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

const App = () => {
  const navigate = useNavigate();
  const themeContext = useContext(ThemeContext);
  if (!themeContext) {
    throw new Error('App must be used within a ThemeProvider');
  }
  const { themeMode, toggleTheme } = themeContext;

  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [brandsMenuOpen, setBrandsMenuOpen] = useState(true);
  const [search, setSearch] = useState('');
  // Отладочный лог для brandsMenuOpen
  useEffect(() => {
    console.log("Текущее состояние brandsMenuOpen (useEffect):", brandsMenuOpen);
  }, [brandsMenuOpen]);
  // Сохраняем выбранный объём для каждого аромата (по имени)
  const [selectedVolumes, setSelectedVolumes] = useState<{ [aroma: string]: number }>({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const handleVolumeSlider = (aroma: string, _: any, value: number) => {
    setSelectedVolumes((prev) => ({ ...prev, [aroma]: value }));
  };

  const [cart, setCart] = useState<{ aroma: string; brand: string; volume: string }[]>([]);
  const [aromaView] = useState<'cards' | 'list'>('cards'); 
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
  const [selectedAromaDetail] = useState<{ aroma: string; brand: string; volume: string } | null>(null); // New state for selected aroma detail

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

  /* const [suggestions, setSuggestions] = useState<({ type: 'brand'; name: string; index: number } | { type: 'aroma'; name: string; brand: string; aroma: Aroma })[]>([]); */
  /* const searchInputRef = React.useRef<HTMLInputElement>(null); */ // Ref for TextField

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        // Изменено: указываем полный URL с портом 3002
        const response = await fetch('http://localhost:3002/brands.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Brand[] = await response.json();
        const sorted = data.slice().sort((a, b) => a.name.localeCompare(b.name, 'ru'));
        setBrands(sorted);
        console.log("Загруженные бренды в useEffect:", sorted); // Отладочный лог
      } catch (error) {
        console.error("Ошибка при загрузке брендов:", error);
      }
    };

    fetchBrands();
  }, []);

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
    setSearch(''); // Очищаем строку поиска при выборе бренда
    /* setSuggestions([]); */ // Очищаем предложения при выборе бренда
    console.log("Выбран бренд с индексом:", index, "Объект бренда:", brands[index]); // Отладочный лог здесь
  };

  const handleToggleBrandsMenu = () => {
    setBrandsMenuOpen((prev) => !prev);
    console.log("brandsMenuOpen после переключения:", !brandsMenuOpen); // Отладочный лог
  };

  const handleOpenAromaDetail = (aroma: string, brand: string, volume: string) => {
    setIsAromaDetailDialogOpen(true);
  };

  const handleCloseAromaDetailDialog = () => {
    setIsAromaDetailDialogOpen(false);
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
    setCart(prev => prev.filter((_: any, i: number) => i !== idx)); // Explicitly typed _ as any and i as number
  };

  const handleAromaClickFromCart = (aromaName: string, brandName: string, volume: string) => {
    // Logic to navigate to the aroma detail, or open a dialog
    // For now, let's assume it opens the aroma detail dialog
    // You might want to scroll to the aroma in the main view or open a specific dialog
    console.log(`Clicked on aroma: ${aromaName} from brand: ${brandName}, volume: ${volume}`);
    setSelectedAromaFromCart(aromaName);
    // If you want to show aroma details in a modal, you would open that modal here
    handleOpenAromaDetail(aromaName, brandName, volume);
  };

  /* const handlePlaceOrder = () => { setCheckoutStep('form'); }; */ // Simplified and kept

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

  const handleOrderCommentChange = (e: ChangeEvent<HTMLInputElement>) => {
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

  /* const handleEditOrder = () => {
    if (currentOrder !== null) {
      alert(`Функция редактирования заказа №${user.orders[currentOrder].id} пока не реализована.`);
      // Implement actual order editing logic here later
    }
  }; */

  /* const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearch(query);

    if (query.length > 1) { // Trigger suggestions after 1 character
      const lowerCaseQuery = query.toLowerCase();
      const newSuggestions: ({ type: 'brand'; name: string; index: number } | { type: 'aroma'; name: string; brand: string; aroma: Aroma })[] = [];

      // Filter brands
      brands.forEach((brand, index) => {
        if (brand.name.toLowerCase().includes(lowerCaseQuery)) {
          newSuggestions.push({ type: 'brand', name: brand.name, index: index });
        }
        // Filter aromas within brands
        brand.aromas.forEach(aroma => {
          if (aroma.name.toLowerCase().includes(lowerCaseQuery)) {
            newSuggestions.push({ type: 'aroma', name: aroma.name, brand: brand.name, aroma: aroma });
          }
        });
      });
      setSuggestions(newSuggestions.slice(0, 10)); // Limit to 10 suggestions
    } else {
      setSuggestions([]);
    }
  }; */

  /* const handleSuggestionClick = (suggestion: { type: 'brand' | 'aroma'; name: string; index?: number; brand?: string; aroma?: Aroma }) => {
    setSearch(suggestion.name); // Set search input to selected suggestion
    setSuggestions([]); // Clear suggestions

    if (suggestion.type === 'brand' && typeof suggestion.index === 'number') {
      handleBrandClick(suggestion.index);
    } else if (suggestion.type === 'aroma' && suggestion.aroma) {
      // For aroma, you might want to navigate to a detail page or highlight it
      console.log(`Clicked on aroma suggestion: ${suggestion.name} from brand: ${suggestion.brand}`);
      // Example: If you have a way to navigate directly to aroma detail
      // navigate(`/aroma/${suggestion.brand}/${suggestion.name}`);
      // Or open a dialog with aroma details
      handleOpenAromaDetail(suggestion.aroma.name, suggestion.aroma.brand || '', Object.keys(suggestion.aroma.prices)[0] || ''); // Pass first volume as example
    }
  }; */

  /* const handleAddMessageToOrder = (orderIndex: number | null, comment: string, file: File | null) => {
    console.log(`Adding message to order ${orderIndex}: ${comment}`);
    handleSendComment(); // Call the unified send/save function
  }; */

  const handleCancelEditComment = () => {
    setEditingCommentIndex(null);
    setOrderComment('');
    setCommentFile(null);
  };

  /* const handleSaveEditedComment = () => { handleSendComment(); }; */ // Simplified and kept

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: 'background.paper', color: 'text.primary', display: 'flex', flexDirection: 'column', transition: 'background-color 0.3s ease-in-out' }}>
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
              <IconButton onClick={() => setSelectedIndex(null)} sx={{ mb: 1, ml: 1 }}> {/* Изменено: при нажатии на поиск скрываем выбранный бренд */}
                <SearchIcon />
              </IconButton>
              {/* Consolidated PersonIcon now directly opens profile */}
              <IconButton
                sx={{ color: 'text.primary', mb: 1, ml: 1 }}
                onClick={() => {
                  setIsProfileFullScreen(true); // Always open profile full screen
                  setIsCartFullScreen(false); // Ensure cart full screen is off
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
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', textAlign: 'center', width: '100%', fontSize: 17, letterSpacing: 1, color: 'text.primary' /*, fontFamily: 'Pensile Round, sans-serif'*/ }}>
              БРЕНДЫ
            </Typography>
            {/* Список брендов */}
            <List sx={{ width: '100%', height: '100%', overflowY: 'auto', pb: 8 }}>
              {(brands.filter(brand => {
                if (!brand || typeof brand.name === 'undefined' || brand.name === null) return false; // Дополнительная проверка
                return brand.name.toLowerCase().includes(search.toLowerCase());
              }))
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
            alignItems: 'center',
            justifyContent: 'flex-start',
            height: '100vh', // Changed to 100vh for full screen height
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
            <IconButton onClick={() => setSelectedIndex(null)} sx={{ mb: 1, ml: 1 }}> {/* Изменено: при нажатии на поиск скрываем выбранный бренд */}
              <SearchIcon />
            </IconButton>
            {/* Consolidated PersonIcon now directly opens profile */}
            <IconButton
              sx={{ color: 'text.primary', mb: 1, ml: 1 }}
              onClick={() => {
                setIsProfileFullScreen(true); // Always open profile full screen
                setIsCartFullScreen(false); // Ensure cart full screen is off
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
            <Box
              key={particle.id}
              sx={{
                position: 'absolute',
                fontSize: '24px',
                opacity: particle.opacity,
                transform: `translate(${particle.x}px, ${particle.y}px)`,
                zIndex: 1000,
                pointerEvents: 'none',
              }}
            >
              {particle.emoji}
            </Box>
          ))}
            {selectedIndex === null ? (
              // Show search input when no brand is selected
              <Box sx={{ width: '95%', mt: 2, mb: 2, /* bgcolor: 'background.paper', borderRadius: 1, p: 2, boxShadow: 1 */ maxWidth: 600, mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <TextField
                  label="Поиск ароматов и брендов"
                  variant="outlined"
                  fullWidth
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 1 }}
                />

                {/* Suggested Search Results */}
                {search && ( // Show suggestions only when search input is not empty
                  <Paper elevation={0} sx={{ width: '100%', maxWidth: 600, overflowY: 'auto', borderTop: '1px solid rgba(0, 0, 0, 0.12)', mt: 1 }}>
                    <List>
                      {/* suggestions.map((s, index) => (
                        <ListItemButton key={index} onClick={() => handleSuggestionClick(s)}>
                          <ListItemText primary={s.name} secondary={s.type === 'aroma' ? `(${s.brand})` : null} />
                        </ListItemButton>
                      )) */} 
                    </List>
                  </Paper>
                )}
              </Box>
            ) : (
              // Show aromas when a brand is selected
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', overflowY: 'auto', pb: 2, pt: 0, px: 2 }}>
                <Typography variant="h5" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}>
                  Ароматы {brands[selectedIndex]?.name}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: aromaView === 'cards' ? 'row' : 'column', flexWrap: 'wrap', gap: 2, justifyContent: aromaView === 'cards' ? 'center' : 'flex-start', width: '100%' }}>
                  {(brands[selectedIndex!]?.aromas || [])
                    .filter((aroma: Aroma) => {
                      if (!aroma || typeof aroma.name === 'undefined' || aroma.name === null) return false;
                      return aroma.name.toLowerCase().includes(search.toLowerCase());
                    })
                    .map((aroma: Aroma, aromaIdx: number) => (
                      <Card key={aroma.name} sx={{
                        width: aromaView === 'cards' ? 200 : '100%',
                        mb: aromaView === 'list' ? 2 : 0,
                        boxShadow: 'none',
                        border: '1px solid rgba(0, 0, 0, 0.12)',
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: aromaView === 'list' ? 'row' : 'column',
                        alignItems: aromaView === 'list' ? 'flex-start' : 'center',
                        gap: aromaView === 'list' ? 2 : 0,
                        p: aromaView === 'list' ? 2 : 0,
                        position: 'relative',
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
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{brands[selectedIndex!]?.name}</Typography>
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
                              onChange={(_: any, value: number) => handleVolumeSlider(aroma.name, _, value)}
                              valueLabelFormat={(value: number) => Object.keys(aroma.prices)[value]}
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
                            onClick={() => handleAddToCart(aroma.name, brands[selectedIndex!]?.name || '', Object.keys(aroma.prices).indexOf(Object.keys(aroma.prices)[selectedVolumes[aroma.name] || 0]))}
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
                          onClick={() => handleAddToCart(aroma.name, brands[selectedIndex!]?.name || '', Object.keys(aroma.prices).indexOf(Object.keys(aroma.prices)[selectedVolumes[aroma.name] || 0]))}
                        >
                          <ShoppingCartIcon />
                        </IconButton>
                      </Card>
                    ))}
                </Box>
              </Box>
            )}

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
                    <ListItemButton selected={profileTab==='orders'} onClick={()=>setProfileTab('orders')} sx={{ px: 2, py: 1 }}>Заказы</ListItemB