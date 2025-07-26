import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  List, 
  ListItemButton, 
  ListItemText, 
  Typography, 
  Paper, 
  IconButton, 
  TextField, 
  InputAdornment, 
  Avatar, 
  useMediaQuery, 
  useTheme, 
  Button, 
  Switch, 
  ListItem, 
  ListItemAvatar, 
  Card, 
  CardContent
} from '@mui/material';
import { 
  Close, 
  MenuOpen, 
  Menu, 
  Search, 
  LocalFlorist, 
  Person, 
  ShoppingCart 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from './index';


// Типы и интерфейсы
type Brand = { 
  name: string; 
  aromas: Aroma[] 
};

type Aroma = { 
  name: string; 
  description: string; 
  aroma_group: string; 
  prices: { [key: string]: number }; 
  image?: string; 
  brand?: string;
  country?: string;
  flag?: string;
  gender?: string;
  rating?: number;
  topNotes?: string;
  middleNotes?: string;
  baseNotes?: string;
};

interface Order {
  id: string;
  date: string;
  items: { aroma: string; brand: string; volume: string; price: number }[];
  comment: string;
  receiptAttached: boolean;
  history: {text: string, sender: 'user' | 'manager'; file?: {name: string, url: string}}[];
  awaitingManagerReply: boolean;
  address?: string;
  phone?: string;
  total: number;
}

interface User {
  name: string;
  balance: string;
  avatar: string;
  orders: Order[];
  address: string;
  phone: string;
  inviteCode: string;
}

// Константы
const AROMA_INFO = {
  price: '1 800 ₽ — 38 000 ₽',
  quality: 'TOP',
  factory: 'Eps',
};

const EMOJIS = ['✨', '🎉', '🚀', '💫', '💯', '✅'];

const App = () => {
  // Хуки и контекст
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const themeContext = useContext(ThemeContext);
  if (!themeContext) {
    throw new Error('App must be used within a ThemeProvider');
  }
  const { themeMode, toggleTheme } = themeContext;

  // Состояния
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [brandsMenuOpen, setBrandsMenuOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedVolumes, setSelectedVolumes] = useState<{ [aroma: string]: number }>({});
  const [cart, setCart] = useState<{ aroma: string; brand: string; volume: string; price: number }[]>([]);
  const [profileTab, setProfileTab] = useState<'data' | 'orders'>('data');
  const [checkoutStep, setCheckoutStep] = useState<null | 'form' | 'payment' | 'orderDetail'>(null);
  const [currentOrder, setCurrentOrder] = useState<number | null>(null);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [orderComment, setOrderComment] = useState<string>('');
  const [commentFile, setCommentFile] = useState<File | null>(null);
  const [editingCommentIndex, setEditingCommentIndex] = useState<number | null>(null);
  const [cartFlash, setCartFlash] = useState(false);
  const [emojiParticles, setEmojiParticles] = useState<
    Array<{ id: number; emoji: string; x: number; y: number; opacity: number }>
  >([]);
  const [isProfileFullScreen, setIsProfileFullScreen] = useState(false);
  const [isCartFullScreen, setIsCartFullScreen] = useState(false);
  const [selectedAromaForVolume, setSelectedAromaForVolume] = useState<{aroma: Aroma, brand: string} | null>(null);
  const [volumeSliderValue, setVolumeSliderValue] = useState(30);
  const [knobPosition, setKnobPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, volume: 0 });
  const [selectedAromaFromCart, setSelectedAromaFromCart] = useState<string | null>(null);
  const [isAromaDetailDialogOpen, setIsAromaDetailDialogOpen] = useState(false);

  const [user, setUser] = useState<User>(() => {
    const savedName = localStorage.getItem('userName') || '';
    const savedPhone = localStorage.getItem('userPhone') || '';
    const savedInviteCode = localStorage.getItem('inviteCode') || '';
    return {
      name: savedName,
      balance: '12 500 ₽',
      avatar: '',
      orders: [],
      address: '',
      phone: savedPhone,
      inviteCode: savedInviteCode,
    };
  });

  // Обработка 2D перетаскивания шарика
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      // Обновляем позицию кнопки (ограничено пределами шкалы)
      const newX = (knobPosition.x + deltaX * 0.5);
      const newY = (knobPosition.y + deltaY * 0.5);
      
      // Ограничиваем движение кнопки пределами шкалы
      const limitedX = Math.max(-200, Math.min(200, newX)); // горизонтальные пределы
      const limitedY = Math.max(-80, Math.min(80, newY));   // вертикальные пределы (не слишком выше/ниже шкалы)
      
      setKnobPosition({
        x: limitedX,
        y: limitedY
      });
      
      // Обновляем значение объема на основе горизонтального движения (более отзывчиво)
      const volumeRange = 1000 - 30;
      const newVolume = Math.max(30, Math.min(1000, 
        dragStart.volume + (deltaX * volumeRange) / 800
      ));
      
      // Округляем до ближайшего кратного 5
      const roundedVolume = Math.round(newVolume / 5) * 5;
      setVolumeSliderValue(roundedVolume);
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        // Кнопка остается в текущем положении (не возвращается в центр)
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragStart]);

  // Функция для получения Volt цвета для заполнения
  const getDarkerFillColor = (volume: number) => {
    return '#CEFF00'; // Всегда используем Volt цвет
  };

  // Функция для получения процента заполнения карточки снизу вверх (30гр = 8% заполнения)
  const getFillPercentage = (volume: number) => {
    const basePercentage = ((volume - 30) / (1000 - 30)) * 92; // 92% вместо 100%
    return basePercentage + 8; // +8% минимального заполнения
  };

  // Функция для определения изгиба шкалы при приближении кнопки (как на фото)
  const getLineBendAndGlow = () => {
    if (!selectedAromaForVolume) return { shouldBend: false, bendPosition: 50, bendIntensity: 0, glowIntensity: 0, knobDistance: 0, isContact: false };
    
    const knobPositionPercent = ((volumeSliderValue - 30) / (1000 - 30)) * 100;
    const actualKnobX = knobPositionPercent + (knobPosition.x / 5);
    const knobY = Math.abs(knobPosition.y);
    
    // Определяем состояния как на фото:
    // Фото 1: приближение (20-40px от шкалы) - слабое свечение
    // Фото 2: контакт (0-15px от шкалы) - яркое свечение
    const isContact = knobY <= 15;           // прямой контакт со шкалой
    const isApproaching = knobY > 15 && knobY <= 50; // приближение к шкале
    const shouldShow = isContact || isApproaching;
    
    // Интенсивность свечения как на фото
    let glowIntensity = 0;
    if (isContact) {
      glowIntensity = 1.0; // максимальное свечение при контакте
    } else if (isApproaching) {
      glowIntensity = Math.max(0.2, (50 - knobY) / 35); // слабое свечение при приближении
    }
    
    // Изгиб шкалы
    const bendIntensity = isContact ? 8 : (isApproaching ? 3 : 0);
    
    return {
      shouldBend: shouldShow,
      bendPosition: Math.max(10, Math.min(90, actualKnobX)),
      bendIntensity: bendIntensity,
      glowIntensity: glowIntensity,
      knobDistance: knobY,
      isContact: isContact
    };
  };

  // Эффекты
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/brands.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Brand[] = await response.json();
        const sorted = data.slice().sort((a, b) => a.name.localeCompare(b.name, 'ru'));
        setBrands(sorted);
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

      const fiveMinutes = 5 * 60 * 1000;
      const now = new Date().getTime();

      const registered = userRegistered === 'true' && !!userName && !!userPhone;
      const skippedRecently = lastSkipTime && (now - parseInt(lastSkipTime) < fiveMinutes);
      const registeredRecently = lastRegistrationTime && (now - parseInt(lastRegistrationTime) < fiveMinutes);

      if (registered) {
        const savedInviteCode = localStorage.getItem('inviteCode') || '';
        setUser(prev => ({ ...prev, name: userName!, phone: userPhone!, inviteCode: savedInviteCode }));
      } else if (!skippedRecently && !registeredRecently) {
        navigate('/start');
      }
    };

    checkRegistrationStatus();
    const intervalId = setInterval(checkRegistrationStatus, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [navigate]);

  useEffect(() => {
    if (selectedAromaFromCart) {
      const element = document.getElementById(`aroma-${selectedAromaFromCart}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setSelectedAromaFromCart(null);
      }
    }
  }, [selectedAromaFromCart, selectedIndex]);

  // Обработчики событий
  const handleBrandClick = (index: number) => {
    setSelectedIndex(index);
    setIsProfileFullScreen(false);
    setSearch('');
  };

  const handleToggleBrandsMenu = () => {
    setBrandsMenuOpen(prev => !prev);
  };

  const handleVolumeSlider = (aroma: string, _: any, value: number) => {
    setSelectedVolumes(prev => ({ ...prev, [aroma]: value }));
  };

  const handleAddToCart = (aromaName: string, brandName: string, volume: number) => {
    // Находим цену аромата
    const selectedBrand = brands[selectedIndex!];
    const selectedAroma = selectedBrand?.aromas.find(aroma => aroma.name === aromaName);
    const price = selectedAroma?.prices[volume] || 0;

    setCart(prev => [...prev, { 
      aroma: aromaName, 
      brand: brandName, 
      volume: `${volume} гр`,
      price: price
    }]);
    
    setCartFlash(true);
    setTimeout(() => setCartFlash(false), 300);

    // Эффект эмодзи
    const newParticle = {
      id: Date.now(),
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      x: 0,
      y: 0,
      opacity: 1,
    };

    setEmojiParticles([newParticle]);

    setTimeout(() => {
      setEmojiParticles(prev => 
        prev.map(p => p.id === newParticle.id ? { ...p, opacity: 0 } : p)
      );
      setTimeout(() => {
        setEmojiParticles(prev => 
          prev.filter(p => p.id !== newParticle.id)
        );
      }, 500);
    }, 100);

    // Воспроизведение звука
    const audio = new Audio('/voice/voice1.mp3');
    audio.play().catch(e => {
      console.warn('Audio playback failed:', e);
      });
  };

  const handleRemoveFromCart = (idx: number) => {
    setCart(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSendOrderDetails = () => {
    setCheckoutStep('payment');
  };

  const handlePaymentComplete = () => {
    const newOrderId = `ORD-${Date.now()}`;
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const newOrder = { 
      id: newOrderId, 
      date: new Date().toLocaleDateString('ru-RU'), 
      items: [...cart], 
      comment: '', 
      receiptAttached: false, 
      history: [], 
      awaitingManagerReply: false,
      address: user.address,
      phone: user.phone,
      total: total
    };
    
    setUser(prev => ({
      ...prev, 
      orders: [...prev.orders, newOrder]
    }));
    
    setCart([]);
    setCheckoutStep('orderDetail'); 
    setIsCartFullScreen(false);
    setCurrentOrder(user.orders.length);
  };

  const handleRepeatOrder = (order: Order) => {
    setCart([...order.items]);
    setSelectedOrderForDetail(null);
    setIsProfileFullScreen(false);
  };

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrderForDetail(order);
  };

  const handleCloseCheckoutDialog = () => {
    setCheckoutStep(null);
    setOrderComment('');
    setCommentFile(null);
    setEditingCommentIndex(null);
    setIsCartFullScreen(false);
  };

  const handleOrderCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderComment(e.target.value);
  };

  const handleSendComment = () => {
    if (currentOrder === null || (orderComment.trim() === '' && !commentFile)) {
      alert('Пожалуйста, введите комментарий или прикрепите файл.');
      return;
    }

    setUser(prev => {
      const updatedOrders = [...prev.orders];
      const currentOrderData = { ...updatedOrders[currentOrder!] };

      if (editingCommentIndex !== null) {
        currentOrderData.history[editingCommentIndex] = {
          ...currentOrderData.history[editingCommentIndex],
          text: orderComment,
          file: commentFile ? { 
            name: commentFile.name, 
            url: URL.createObjectURL(commentFile) 
          } : undefined,
        };
        setEditingCommentIndex(null);
      } else {
        const newComment = { 
          text: orderComment, 
          sender: 'user' as const,
          ...(commentFile && {
            file: { 
              name: commentFile.name, 
              url: URL.createObjectURL(commentFile) 
            }
          })
        };
        
        currentOrderData.history.push(newComment);
        currentOrderData.awaitingManagerReply = true;
        setOrderComment('');
        setCommentFile(null);

        setTimeout(() => {
          setUser(latest => {
            const latestOrders = [...latest.orders];
            const latestCurrentOrderData = { ...latestOrders[currentOrder!] };
            
            if (latestCurrentOrderData.history[latestCurrentOrderData.history.length - 1]?.sender !== 'manager') {
              latestCurrentOrderData.history.push({ 
                text: 'Менеджер: Спасибо за ваш комментарий! Мы его рассмотрим.', 
                sender: 'manager' 
              });
            }
            
            latestCurrentOrderData.awaitingManagerReply = false;
            latestOrders[currentOrder!] = latestCurrentOrderData;
            return { ...latest, orders: latestOrders };
          });
        }, 3000);
      }

      updatedOrders[currentOrder!] = currentOrderData;
      return { ...prev, orders: updatedOrders };
    });
  };

  const handleCommentFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setCommentFile(e.target.files[0]);
    }
  };

  const handleCancelEditComment = () => {
    setEditingCommentIndex(null);
    setOrderComment('');
    setCommentFile(null);
  };

  // Рендер компонентов
  const renderBrandsMenu = () => (
    <Paper elevation={0} sx={{
      width: 340,
      minWidth: 340,
      maxWidth: 340,
      bgcolor: 'background.paper',
      p: 2,
      pr: 2,
      pb: 0,
      mr: 0,
      mb: isMobile ? 2 : 0,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      position: 'relative',
      height: '100%',
      justifyContent: 'flex-start',
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      boxShadow: 'none',
      boxSizing: 'border-box',
      bottom: 0,
      borderRight: `1px solid ${theme.palette.divider}`,
      zIndex: 2
    }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', mb: 1 }}>
              <IconButton onClick={handleToggleBrandsMenu} sx={{ mr: 1 }}>
          <MenuOpen />
              </IconButton>
        <IconButton onClick={() => setSelectedIndex(null)} sx={{ mb: 1, ml: 1 }}>
          <Search />
              </IconButton>
              <IconButton
                sx={{ color: 'text.primary', mb: 1, ml: 1 }}
                onClick={() => {
            setIsProfileFullScreen(true);
            setIsCartFullScreen(false);
                }}
              >
          <Person sx={{ fontSize: 28 }} />
              </IconButton>
              <IconButton
                sx={{
                  color: 'text.primary',
                  position: 'relative',
            bgcolor: cartFlash ? 'rgba(0, 255, 0, 0.2)' : 'transparent',
                  transition: 'background-color 0.3s ease-in-out',
                  ml: 2
                }}
                onClick={() => {
            setIsCartFullScreen(!isCartFullScreen);
            setIsProfileFullScreen(false);
                }}
              >
          <ShoppingCart sx={{ fontSize: 28 }} />
                {cart.length > 0 && (
            <Box sx={{ 
              position: 'absolute', 
              top: -5, 
              right: -5, 
              bgcolor: 'error.main', 
              color: '#fff', 
              borderRadius: '50%', 
              width: 18, 
              height: 18, 
              fontSize: 12, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontWeight: 700 
            }}>
              {cart.length}
            </Box>
                )}
              </IconButton>
              <Switch
                checked={themeMode === 'dark'}
                onChange={toggleTheme}
                color="default"
                inputProps={{ 'aria-label': 'theme switch' }}
                sx={{ ml: 1 }}
              />
            </Box>
      <Typography variant="h6" sx={{ 
        mb: 1, 
        fontWeight: 'bold', 
        textAlign: 'center', 
        width: '100%', 
        fontSize: 17, 
        letterSpacing: 1, 
        color: 'text.primary'
      }}>
              БРЕНДЫ
            </Typography>
            <List sx={{ width: '100%', height: '100%', overflowY: 'auto', pb: 8 }}>
        {brands.filter(brand => brand?.name?.toLowerCase().includes(search.toLowerCase()))
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
  );

  const renderCollapsedMenu = () => (
          <Box sx={{
            width: 66,
            minWidth: 66,
            maxWidth: 66,
            display: 'flex',
            flexDirection: 'column',
      alignItems: 'center',
            justifyContent: 'flex-start',
      height: '100vh',
            bgcolor: 'background.paper',
            opacity: 0.96,
            pt: 2,
            position: 'relative',
            borderRight: `1px solid ${theme.palette.divider}`,
            zIndex: 2
          }}>
            <IconButton onClick={handleToggleBrandsMenu} sx={{ mb: 1, ml: 1 }}>
        <Menu />
            </IconButton>
      <IconButton onClick={() => setSelectedIndex(null)} sx={{ mb: 1, ml: 1 }}>
        <Search />
            </IconButton>
            <IconButton
              sx={{ color: 'text.primary', mb: 1, ml: 1 }}
              onClick={() => {
          setIsProfileFullScreen(true);
          setIsCartFullScreen(false);
              }}
            >
        <Person sx={{ fontSize: 28 }} />
            </IconButton>
            <IconButton
              sx={{
                color: 'text.primary',
                position: 'relative',
          bgcolor: cartFlash ? 'rgba(0, 255, 0, 0.2)' : 'transparent',
                transition: 'background-color 0.3s ease-in-out',
          ml: 'auto',
          mr: 'auto',
                mb: 1
              }}
              onClick={() => {
          setIsCartFullScreen(!isCartFullScreen);
          setIsProfileFullScreen(false);
              }}
            >
        <ShoppingCart sx={{ fontSize: 28 }} />
              {cart.length > 0 && (
          <Box sx={{ 
            position: 'absolute', 
            top: -5, 
            right: -5, 
            bgcolor: 'error.main', 
            color: '#fff', 
            borderRadius: '50%', 
            width: 18, 
            height: 18, 
            fontSize: 12, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 700 
          }}>
            {cart.length}
          </Box>
              )}
            </IconButton>
            <Switch
              checked={themeMode === 'dark'}
              onChange={toggleTheme}
              color="default"
              inputProps={{ 'aria-label': 'theme switch' }}
        sx={{ ml: 'auto', mr: 'auto', mb: 1 }}
            />
          </Box>
  );

  const renderMainContent = () => (
    <Box sx={{
            flex: 1, 
      minWidth: 0,
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'flex-start', 
            height: '100%', 
      position: 'relative',
            top: 0, 
      bgcolor: cartFlash ? 'rgba(0, 255, 0, 0.1)' : 'background.paper',
            transition: 'background-color 0.3s ease-in-out',
            zIndex: 1, 
            px: 0, 
            borderTopLeftRadius: 0, 
            borderBottomLeftRadius: 0, 
            boxSizing: 'border-box'
    }}>
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
        <Box sx={{ 
          width: '95%', 
          mt: 2,
          mb: 2,
          maxWidth: 600, 
          mx: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh'
        }}>
                      <TextField
            label="Поиск ароматов и брендов"
            variant="outlined"
                        fullWidth
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1 }}
          />
        </Box>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          width: '100%', 
          overflowY: 'auto',
          overflowX: 'hidden',
          overscrollBehavior: 'none',
          pb: 2, 
          pt: 0, 
          px: 2 
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            gap: 3, 
            justifyContent: 'center', 
            width: '100%',
            px: 2,
            py: 3,
            overflowX: 'hidden'
          }}>
            {(brands[selectedIndex]?.aromas || [])
              .filter((aroma: Aroma) => 
                aroma?.name?.toLowerCase().includes(search.toLowerCase())
              )
              .map((aroma: Aroma, aromaIdx: number) => {
                // Примерные данные для ароматов в стиле FIFA
                const aromaData = {
                  rating: aroma.rating || (85 + Math.floor(Math.random() * 10)),
                  brand: aroma.brand || brands[selectedIndex]?.name || 'AJMAL',
                  country: aroma.country || 'ОАЭ',
                  flag: aroma.flag || '🇦🇪',
                  gender: aroma.gender || 'Унисекс',
                  topNotes: aroma.topNotes || 'корица, кардамон, цветок апельсина и бергамот',
                  middleNotes: aroma.middleNotes || 'бурбонская ваниль и элеми',
                  baseNotes: aroma.baseNotes || 'пралине, мускус, ambroxan, гваяк'
                };

                return (
                  <Box
                    key={aroma.name}
                    id={`aroma-${aroma.name}`}
                    onClick={() => {
                      // При клике показываем ползунок выбора объема
                      setSelectedAromaForVolume({
                        aroma: aroma,
                        brand: brands[selectedIndex]?.name || ''
                      });
                      setVolumeSliderValue(30);

                    }}
                    sx={{
                      width: 240,
                      height: 440,
                      borderRadius: 4,
                      background: theme.palette.mode === 'dark' 
                        ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #404040 100%)'
                        : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 4px 20px rgba(0, 0, 0, 0.5)'
                        : '0 4px 20px rgba(0, 0, 0, 0.15)',
                      overflow: 'hidden',
                      border: theme.palette.mode === 'dark' 
                        ? '1px solid #333'
                        : '1px solid #ddd',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.palette.mode === 'dark'
                          ? '0 8px 30px rgba(0, 0, 0, 0.7)'
                          : '0 8px 30px rgba(0, 0, 0, 0.2)',
                      },
                      // Эффект заполнения снизу вверх для выбранной карточки
                      '&::after': selectedAromaForVolume?.aroma.name === aroma.name ? {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: `${getFillPercentage(volumeSliderValue)}%`,
                        background: `linear-gradient(to top, ${getDarkerFillColor(volumeSliderValue)} 0%, ${getDarkerFillColor(volumeSliderValue)}CC 30%, ${getDarkerFillColor(volumeSliderValue)}88 60%, ${getDarkerFillColor(volumeSliderValue)}44 85%, transparent 100%)`,
                        borderRadius: '0 0 16px 16px',
                        transition: 'height 0.3s ease, background 0.3s ease',
                        zIndex: 1,
                        pointerEvents: 'none'
                      } : {},
                      // Вырезы по краям как у билета
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '100%',
                        background: `radial-gradient(circle at 0% 20%, transparent 8px, ${theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fa'} 8px),
                                     radial-gradient(circle at 0% 40%, transparent 8px, ${theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fa'} 8px),
                                     radial-gradient(circle at 0% 60%, transparent 8px, ${theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fa'} 8px),
                                     radial-gradient(circle at 0% 80%, transparent 8px, ${theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fa'} 8px),
                                     radial-gradient(circle at 100% 20%, transparent 8px, ${theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fa'} 8px),
                                     radial-gradient(circle at 100% 40%, transparent 8px, ${theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fa'} 8px),
                                     radial-gradient(circle at 100% 60%, transparent 8px, ${theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fa'} 8px),
                                                                          radial-gradient(circle at 100% 80%, transparent 8px, ${theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fa'} 8px)`,
                         zIndex: -2,
                      }
                    }}
                  >
                    {/* Верхняя секция */}
                    <Box sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      right: 16,
                      height: 60,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      zIndex: 2
                    }}>
                      {/* MRVV эквивалент */}
                      <Box sx={{
                        background: theme.palette.mode === 'dark' ? '#fff' : '#000',
                        color: theme.palette.mode === 'dark' ? '#000' : '#fff',
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                        fontWeight: 900,
                        fontSize: '16px',
                        fontFamily: '"Kollektif", sans-serif'
                      }}>
                        {aromaData.brand.substring(0, 4).toUpperCase()}
                      </Box>

                      {/* Штрих-код справа */}
                      <Box sx={{
                        width: 80,
                        height: 50,
                        background: theme.palette.mode === 'dark' ? '#fff' : '#000',
                        borderRadius: 1,
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <Box sx={{
                          position: 'absolute',
                          top: 4,
                          left: 4,
                          right: 4,
                          bottom: 4,
                          background: 'repeating-linear-gradient(to right, transparent 0px, transparent 1px, ' + (theme.palette.mode === 'dark' ? '#000' : '#fff') + ' 1px, ' + (theme.palette.mode === 'dark' ? '#000' : '#fff') + ' 2px)',
                        }} />
                        <Typography sx={{
                          position: 'absolute',
                          bottom: 2,
                          right: 4,
                          fontSize: '6px',
                          color: theme.palette.mode === 'dark' ? '#000' : '#fff',
                          fontFamily: 'monospace',
                          transform: 'rotate(90deg)',
                          transformOrigin: 'bottom right'
                        }}>
                          {aromaData.rating}52279
                        </Typography>
                      </Box>
                    </Box>

                    {/* Текст CHECK-IN слева */}
                    <Typography sx={{
                      position: 'absolute',
                      top: 100,
                      right: 16,
                      fontSize: '8px',
                      color: theme.palette.mode === 'dark' ? '#ccc' : '#666',
                      fontWeight: 600,
                      transform: 'rotate(90deg)',
                      transformOrigin: 'center',
                      letterSpacing: '1px',
                      zIndex: 2
                    }}>
                      CHECK-IN
                    </Typography>
                    <Typography sx={{
                      position: 'absolute',
                      top: 120,
                      right: 16,
                      fontSize: '8px',
                      color: theme.palette.mode === 'dark' ? '#ccc' : '#666',
                      fontWeight: 600,
                      transform: 'rotate(90deg)',
                      transformOrigin: 'center',
                      letterSpacing: '1px',
                      zIndex: 2
                    }}>
                      ORDER IN
                    </Typography>
                    <Typography sx={{
                      position: 'absolute',
                      top: 140,
                      right: 16,
                      fontSize: '8px',
                      color: theme.palette.mode === 'dark' ? '#ccc' : '#666',
                      fontWeight: 600,
                      transform: 'rotate(90deg)',
                      transformOrigin: 'center',
                      letterSpacing: '1px',
                      zIndex: 2
                    }}>
                      МИРЕ
                    </Typography>

                    {/* Номер заказа */}
                    <Typography sx={{
                      position: 'absolute',
                      top: 100,
                      left: 16,
                      fontSize: '10px',
                      color: theme.palette.mode === 'dark' ? '#ccc' : '#666',
                      fontWeight: 600,
                      zIndex: 2
                    }}>
                      067638
                    </Typography>

                    {/* Главное название */}
                    <Typography sx={{
                      position: 'absolute',
                      top: 140,
                      left: 16,
                      right: 40,
                      fontSize: '48px',
                      fontWeight: 900,
                      color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                      fontFamily: '"Kollektif", sans-serif',
                      lineHeight: 0.8,
                      letterSpacing: '-1px',
                      textTransform: 'uppercase',
                      zIndex: 2
                    }}>
                      {aroma.name.split(' ').slice(0, 2).join(' ')}
                    </Typography>

                    {/* Год */}
                    <Typography sx={{
                      position: 'absolute',
                      top: 240,
                      right: 16,
                      fontSize: '20px',
                      fontWeight: 700,
                      color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                      fontFamily: '"Kollektif", sans-serif',
                      zIndex: 2
                    }}>
                      2024
                    </Typography>

                    {/* ПАРФЮМ *** */}
                    <Typography sx={{
                      position: 'absolute',
                      top: 270,
                      left: 16,
                      fontSize: '24px',
                      fontWeight: 700,
                      color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                      fontFamily: '"Kollektif", sans-serif',
                      letterSpacing: '1px',
                      zIndex: 2
                    }}>
                      ПАРФЮМ ***
                    </Typography>

                    {/* Нижняя информация */}
                    <Box sx={{
                      position: 'absolute',
                      bottom: 80,
                      left: 16,
                      right: 16,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                      zIndex: 2
                    }}>
                      <Box>
                        <Typography sx={{
                          fontSize: '10px',
                          color: theme.palette.mode === 'dark' ? '#ccc' : '#666',
                          fontWeight: 600
                        }}>
                          date
                        </Typography>
                        <Typography sx={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: theme.palette.mode === 'dark' ? '#fff' : '#000'
                        }}>
                          08/06
                        </Typography>
                        <Typography sx={{
                          fontSize: '10px',
                          color: theme.palette.mode === 'dark' ? '#ccc' : '#666',
                          fontWeight: 600,
                          mt: 1
                        }}>
                          passenger
                        </Typography>
                        <Typography sx={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: theme.palette.mode === 'dark' ? '#fff' : '#000'
                        }}>
                          {aromaData.brand.substring(0, 3).toUpperCase()}
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{
                          fontSize: '10px',
                          color: theme.palette.mode === 'dark' ? '#ccc' : '#666',
                          fontWeight: 600
                        }}>
                          cabin
                        </Typography>
                        <Typography sx={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: theme.palette.mode === 'dark' ? '#fff' : '#000'
                        }}>
                          PERFUME CLASS
                        </Typography>
                        
                        {/* Иконка */}
                        <Box sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: theme.palette.mode === 'dark' ? '#fff' : '#000',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mt: 1,
                          ml: 'auto'
                        }}>
                          <Typography sx={{
                            fontSize: '12px',
                            color: theme.palette.mode === 'dark' ? '#000' : '#fff'
                          }}>
                            ★
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Штрих-код внизу */}
                    <Box sx={{
                      position: 'absolute',
                      bottom: 16,
                      left: 16,
                      right: 16,
                      height: 40,
                      background: theme.palette.mode === 'dark' ? '#fff' : '#000',
                      zIndex: 2,
                      borderRadius: 1,
                      overflow: 'hidden'
                    }}>
                      <Box sx={{
                        width: '100%',
                        height: '100%',
                        background: 'repeating-linear-gradient(to right, transparent 0px, transparent 1px, ' + (theme.palette.mode === 'dark' ? '#000' : '#fff') + ' 1px, ' + (theme.palette.mode === 'dark' ? '#000' : '#fff') + ' 2px)',
                        position: 'relative'
                      }}>
                        {/* Вырезы в штрих-коде */}
                        <Box sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 20,
                          right: 20,
                          height: 8,
                          background: `radial-gradient(circle at 10% 100%, transparent 4px, ${theme.palette.mode === 'dark' ? '#000' : '#fff'} 4px),
                                       radial-gradient(circle at 30% 100%, transparent 4px, ${theme.palette.mode === 'dark' ? '#000' : '#fff'} 4px),
                                       radial-gradient(circle at 50% 100%, transparent 4px, ${theme.palette.mode === 'dark' ? '#000' : '#fff'} 4px),
                                       radial-gradient(circle at 70% 100%, transparent 4px, ${theme.palette.mode === 'dark' ? '#000' : '#fff'} 4px),
                                       radial-gradient(circle at 90% 100%, transparent 4px, ${theme.palette.mode === 'dark' ? '#000' : '#fff'} 4px)`
                        }} />
                      </Box>
                    </Box>

                    {/* Цена */}
                    <Typography sx={{
                      position: 'absolute',
                      top: 16,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                      background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1
                    }}>
                      {aroma.prices[30] || 1800}₽
                    </Typography>
                  </Box>
                );
              })}
          </Box>

          {/* Компонент выбора объема под карточками */}
          {selectedAromaForVolume && (
                        <Box sx={{
              mt: 4,
              p: 4,
              background: theme.palette.mode === 'dark' 
                ? 'rgba(26, 26, 26, 0.3)'
                : 'rgba(248, 249, 250, 0.3)',
              borderRadius: 3,
              border: theme.palette.mode === 'dark' ? '1px solid rgba(51, 51, 51, 0.3)' : '1px solid rgba(221, 221, 221, 0.3)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.05)',
              mx: 2,
              backdropFilter: 'blur(10px)'
            }}>
              {/* Заголовок */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 4
              }}>
                <Box>
                  <Typography sx={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                    fontFamily: '"Kollektif", sans-serif'
                  }}>
                    {selectedAromaForVolume.aroma.name}
                  </Typography>
                  <Typography sx={{
                    fontSize: '14px',
                    color: theme.palette.mode === 'dark' ? '#999' : '#666',
                    fontWeight: 600
                  }}>
                    {selectedAromaForVolume.brand}
                  </Typography>
                </Box>
                
                <IconButton 
                  onClick={() => setSelectedAromaForVolume(null)}
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? '#999' : '#666',
                    '&:hover': { 
                      color: theme.palette.mode === 'dark' ? '#fff' : '#000'
                    }
                  }}
                >
                  ✕
                </IconButton>
              </Box>

              {/* Большое значение объема */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography sx={{
                  fontSize: '48px',
                  fontWeight: 900,
                  color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                  fontFamily: '"Kollektif", sans-serif',
                  lineHeight: 1
                }}>
                  {volumeSliderValue}
                </Typography>
                <Typography sx={{
                  fontSize: '16px',
                  color: theme.palette.mode === 'dark' ? '#999' : '#666',
                  fontWeight: 600,
                  mt: -1,
                  fontFamily: '"Kollektif", sans-serif'
                }}>
                  грамм
                </Typography>
              </Box>

              {/* Шкала и шарик (профессиональный стиль) */}
              <Box sx={{ position: 'relative', mx: 4, mb: 4 }}
                onClick={(e) => {
                  // Клик в любом месте области шкалы перемещает кнопку
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relativeX = e.clientX - rect.left - rect.width / 2;
                  const relativeY = e.clientY - rect.top - rect.height / 2;
                  
                  // Ограничиваем позицию пределами шкалы
                  const limitedX = Math.max(-200, Math.min(200, relativeX));
                  const limitedY = Math.max(-80, Math.min(80, relativeY));
                  
                  setKnobPosition({
                    x: limitedX,
                    y: limitedY
                  });
                  
                  // Обновляем объем на основе X позиции
                  const percentageX = (limitedX + 200) / 400; // нормализуем -200..200 в 0..1
                  const newVolume = 30 + (1000 - 30) * Math.max(0, Math.min(1, percentageX));
                  const roundedVolume = Math.round(newVolume / 5) * 5;
                  setVolumeSliderValue(roundedVolume);
                }}>
                {/* Шкала с делениями сверху */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  mb: 3,
                  px: 2,
                  position: 'relative'
                }}>
                  {/* Горизонтальная линия шкалы с изгибом и свечением */}
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: '20px',
                    marginTop: '-10px',
                    zIndex: 1
                  }}>
                    <svg width="100%" height="20" style={{ overflow: 'visible' }}>
                                             <defs>
                         <filter id="greenGlow" x="-50%" y="-50%" width="200%" height="200%">
                           <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                           <feMerge> 
                             <feMergeNode in="coloredBlur"/>
                             <feMergeNode in="SourceGraphic"/>
                           </feMerge>
                         </filter>
                         <filter id="voltGlow" x="-100%" y="-100%" width="300%" height="300%">
                           <feGaussianBlur stdDeviation="8" result="bigBlur"/>
                           <feGaussianBlur stdDeviation="2" result="smallBlur"/>
                           <feMerge> 
                             <feMergeNode in="bigBlur"/>
                             <feMergeNode in="smallBlur"/>
                             <feMergeNode in="SourceGraphic"/>
                           </feMerge>
                         </filter>
                       </defs>
                                             {(() => {
                         const bendData = getLineBendAndGlow();
                         const baseY = 10;
                         const bendY = baseY + (bendData.shouldBend ? bendData.bendIntensity : 0);
                         
 
                        
                                                                          if (bendData.shouldBend) {
                           // Изогнутая линия с Volt свечением в противоположную сторону
                           const bendX = bendData.bendPosition;
                           const bendY = baseY - bendData.bendIntensity; // изгиб в противоположную сторону
                           const bendWidth = 20; // ширина изгиба
                           
                           return (
                             <>
                               {/* Полная линия с изгибом */}
                               <path 
                                 d={`M 0% ${baseY} Q ${bendX}% ${bendY} 100% ${baseY}`}
                                 stroke={theme.palette.mode === 'dark' ? '#666' : '#999'}
                                 strokeWidth="2"
                                 fill="none"
                               />
                               {/* Volt свечение в области изгиба */}
                               <path 
                                 d={`M ${Math.max(0, bendX - bendWidth)}% ${baseY} Q ${bendX}% ${bendY} ${Math.min(100, bendX + bendWidth)}% ${baseY}`}
                                 stroke="#CEFF00"
                                 strokeWidth={bendData.isContact ? "10" : "6"}
                                 fill="none"
                                 filter="url(#greenGlow)"
                                 opacity={bendData.glowIntensity}
                               />
                               {/* Дополнительное яркое свечение при контакте */}
                               {bendData.isContact && (
                                 <path 
                                   d={`M ${Math.max(0, bendX - bendWidth * 1.5)}% ${baseY} Q ${bendX}% ${bendY} ${Math.min(100, bendX + bendWidth * 1.5)}% ${baseY}`}
                                   stroke="#CEFF00"
                                   strokeWidth="15"
                                   fill="none"
                                   filter="url(#voltGlow)"
                                   opacity={bendData.glowIntensity * 0.6}
                                 />
                               )}
                               {/* Дополнительное Volt свечение */}
                               <circle
                                 cx={`${bendX}%`}
                                 cy={bendY}
                                 r="15"
                                 fill="#CEFF00"
                                 opacity={bendData.glowIntensity * 0.2}
                                 filter="url(#voltGlow)"
                               />
                               <circle
                                 cx={`${bendX}%`}
                                 cy={bendY}
                                 r="6"
                                 fill="#CEFF00"
                                 opacity={bendData.glowIntensity * 0.5}
                                 filter="url(#greenGlow)"
                               />
                                                            </>
                             );
                         } else {
                          // Прямая линия
                          return (
                            <line 
                              x1="0%" 
                              y1={baseY} 
                              x2="100%" 
                              y2={baseY}
                              stroke={theme.palette.mode === 'dark' ? '#666' : '#999'}
                              strokeWidth="2"
                            />
                          );
                        }
                      })()}
                    </svg>
                  </Box>
                  
                  {/* Деления и подписи через 10 с изгибом */}
                  {Array.from({length: 101}, (_, i) => 30 + i * 10).filter(v => v <= 1000).map((value, index) => {
                    const isMainMark = value % 100 === 0 || value === 30 || value === 1000;
                    const isMediumMark = value % 50 === 0;
                    
                    // Рассчитываем изгиб для этого деления
                    const bendData = getLineBendAndGlow();
                    const valuePercent = ((value - 30) / (1000 - 30)) * 100;
                    const distanceFromBend = Math.abs(valuePercent - bendData.bendPosition);
                    const bendEffect = bendData.shouldBend && distanceFromBend < 20 ? 
                      (20 - distanceFromBend) / 20 * bendData.bendIntensity / 3 : 0;
                    
                    return (
                      <Box key={value} sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        position: 'relative',
                        zIndex: 2,
                        transform: `translateY(${-bendEffect}px)`,
                        transition: 'transform 0.2s ease'
                      }}>
                        {/* Деление */}
                        <Box sx={{
                          width: '2px',
                          height: isMainMark ? '20px' : isMediumMark ? '15px' : '10px',
                          background: bendData.shouldBend && distanceFromBend < 20 ? 
                            `linear-gradient(to bottom, #CEFF00, ${theme.palette.mode === 'dark' ? '#666' : '#999'})` :
                            theme.palette.mode === 'dark' ? '#666' : '#999',
                          mb: 0.5,
                          boxShadow: bendData.shouldBend && distanceFromBend < 20 ? 
                            bendData.isContact ? 
                              `0 0 20px rgba(206, 255, 0, ${bendData.glowIntensity})` : // яркое при контакте
                              `0 0 8px rgba(206, 255, 0, ${bendData.glowIntensity * 0.3})` : // слабое при приближении
                            'none'
                        }} />
                        
                        {/* Подпись только для основных меток */}
                        {isMainMark && (
                          <Typography sx={{
                            fontSize: '11px',
                            color: bendData.shouldBend && distanceFromBend < 20 ? 
                              '#CEFF00' : theme.palette.mode === 'dark' ? '#999' : '#666',
                            fontWeight: 600,
                            fontFamily: '"Kollektif", sans-serif',
                            textShadow: bendData.shouldBend && distanceFromBend < 20 ? 
                              bendData.isContact ? 
                                `0 0 15px rgba(206, 255, 0, ${bendData.glowIntensity})` : // яркое при контакте
                                `0 0 6px rgba(206, 255, 0, ${bendData.glowIntensity * 0.4})` : // слабое при приближении
                              'none'
                          }}>
                            {value}
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>

                {/* Пространство между шкалой и шариком */}
                <Box sx={{ height: 20 }} />

                                 {/* Область для шарика с 2D управлением */}
                 <Box sx={{ 
                   position: 'relative',
                   height: 80,
                   mx: 2,
                   overflow: 'visible'
                 }}>
                   {/* Матовая черная круглая кнопка со стрелочками */}
                   <Box 
                     onMouseDown={(e) => {
                       setIsDragging(true);
                       
                       // Получаем позицию клика относительно контейнера шкалы
                       const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                       if (rect) {
                         const relativeX = e.clientX - rect.left - rect.width / 2;
                         const relativeY = e.clientY - rect.top - rect.height / 2;
                         
                         // Устанавливаем кнопку в место клика
                         setKnobPosition({
                           x: relativeX,
                           y: relativeY
                         });
                       }
                       
                       setDragStart({
                         x: e.clientX,
                         y: e.clientY,
                         volume: volumeSliderValue
                       });
                       e.preventDefault();
                     }}
                     sx={{
                       position: 'absolute',
                       left: `calc(${((volumeSliderValue - 30) / (1000 - 30)) * 100}% - 45px + ${knobPosition.x}px)`,
                       top: `calc(50% - 45px + ${knobPosition.y}px)`,
                       width: 90,
                       height: 90,
                       borderRadius: '50%',
                       background: (() => {
                         const bendData = getLineBendAndGlow();
                         if (bendData.isContact) {
                           // Синяя подсветка при контакте как на фото
                           return 'radial-gradient(circle at 30% 30%, #1e40af 0%, #1e3a8a 30%, #111 60%, #000 100%)';
                         } else if (bendData.shouldBend) {
                           // Слабая подсветка при приближении
                           return 'radial-gradient(circle at 30% 30%, #374151 0%, #1f2937 50%, #000 100%)';
                         }
                         return 'radial-gradient(circle at 30% 30%, #222 0%, #111 50%, #000 100%)';
                       })(),
                       boxShadow: isDragging ? `
                         inset 0 4px 8px rgba(0,0,0,0.9),
                         inset 0 2px 4px rgba(0,0,0,0.8),
                         0 2px 8px rgba(0,0,0,0.6)
                       ` : `
                         0 8px 20px rgba(0,0,0,0.8),
                         0 4px 12px rgba(0,0,0,0.6),
                         inset 0 1px 3px rgba(255,255,255,0.05),
                         inset 0 -3px 6px rgba(0,0,0,0.9)
                       `,
                       cursor: isDragging ? 'grabbing' : 'grab',
                       transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                       zIndex: 10,
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       // Матовая поверхность
                       '&::before': {
                         content: '""',
                         position: 'absolute',
                         top: 0,
                         left: 0,
                         right: 0,
                         bottom: 0,
                         borderRadius: '50%',
                         background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
                         pointerEvents: 'none'
                       },
                       '&:hover': !isDragging ? {
                         transform: 'scale(1.1)',
                         boxShadow: `
                           0 6px 18px rgba(0,0,0,0.9),
                           0 3px 8px rgba(0,0,0,0.5),
                           inset 0 1px 2px rgba(255,255,255,0.08),
                           inset 0 -2px 4px rgba(0,0,0,0.9)
                         `
                       } : {}
                     }}
                   >
                     {/* Стрелочки при нажатии */}
                     {isDragging && (
                       <Box sx={{
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'space-between',
                         width: '60%',
                         fontSize: '20px',
                         color: '#333',
                         fontWeight: 'bold',
                         userSelect: 'none',
                         zIndex: 1
                       }}>
                         <span>◀</span>
                         <span>▶</span>
                       </Box>
                     )}
                     
                     {/* Цифры рядом с кнопкой при движении */}
                     {(isDragging || Math.abs(knobPosition.x) > 10 || Math.abs(knobPosition.y) > 10) && (
                       <Box sx={{
                         position: 'absolute',
                         top: '-50px',
                         left: '50%',
                         transform: 'translateX(-50%)',
                         background: 'rgba(0, 0, 0, 0.8)',
                         color: '#CEFF00',
                         px: 2,
                         py: 1,
                         borderRadius: 2,
                         fontSize: '18px',
                         fontWeight: 'bold',
                         fontFamily: '"Kollektif", sans-serif',
                         boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                         zIndex: 11,
                         '&::after': {
                           content: '""',
                           position: 'absolute',
                           bottom: '-8px',
                           left: '50%',
                           transform: 'translateX(-50%)',
                           borderLeft: '8px solid transparent',
                           borderRight: '8px solid transparent',
                           borderTop: '8px solid rgba(0, 0, 0, 0.8)'
                         }
                       }}>
                         {volumeSliderValue}г
                       </Box>
                     )}
                   </Box>

                   {/* Скрытый input для базового управления */}
                   <input
                     type="range"
                     min={30}
                     max={1000}
                     step={5}
                     value={volumeSliderValue}
                     onChange={(e) => {
                       if (!isDragging) {
                         setVolumeSliderValue(Number(e.target.value));
                       }
                     }}
                     style={{
                       position: 'absolute',
                       top: 0,
                       left: 0,
                       width: '100%',
                       height: '100%',
                       opacity: 0,
                       cursor: 'pointer',
                       zIndex: 5,
                       pointerEvents: isDragging ? 'none' : 'auto'
                     }}
                   />
                 </Box>
              </Box>

              {/* Цена */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography sx={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                  fontFamily: '"Kollektif", sans-serif'
                }}>
                  {selectedAromaForVolume.aroma.prices[volumeSliderValue] || Math.round((selectedAromaForVolume.aroma.prices[30] || 1800) * (volumeSliderValue / 30))} ₽
                </Typography>
              </Box>

              {/* Кнопки действий */}
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                justifyContent: 'center'
              }}>
                <Button
                  variant="outlined"
                  onClick={() => setSelectedAromaForVolume(null)}
                  sx={{
                    color: theme.palette.mode === 'dark' ? '#999' : '#666',
                    borderColor: theme.palette.mode === 'dark' ? '#333' : '#ccc',
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    '&:hover': {
                      color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                      borderColor: theme.palette.mode === 'dark' ? '#555' : '#999'
                    }
                  }}
                >
                  Отмена
                </Button>
                
                <Button
                  variant="contained"
                  onClick={() => {
                    handleAddToCart(
                      selectedAromaForVolume.aroma.name,
                      selectedAromaForVolume.brand,
                      volumeSliderValue
                    );
                    setSelectedAromaForVolume(null);
                  }}
                  sx={{
                    background: theme.palette.mode === 'dark' 
                      ? 'linear-gradient(135deg, #333 0%, #1a1a1a 100%)'
                      : 'linear-gradient(135deg, #000 0%, #333 100%)',
                    color: '#fff',
                    px: 4,
                    py: 1.5,
                    fontWeight: 700,
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 4px 20px rgba(0, 0, 0, 0.8)'
                      : '0 4px 20px rgba(0, 0, 0, 0.4)',
                    '&:hover': {
                      background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, #444 0%, #222 100%)'
                        : 'linear-gradient(135deg, #111 0%, #444 100%)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 6px 30px rgba(0, 0, 0, 0.9)'
                        : '0 6px 30px rgba(0, 0, 0, 0.6)'
                    }
                  }}
                >
                  Добавить в корзину
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );

  const renderProfileFullScreen = () => (
    <Paper
      elevation={0}
      sx={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: brandsMenuOpen ? 340 : 66,
        bgcolor: 'background.default',
        color: 'text.primary',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: brandsMenuOpen ? 'calc(100vw - 340px)' : 'calc(100vw - 66px)',
        borderRadius: 0,
        boxShadow: 'none',
        zIndex: 10,
        overflowX: 'hidden'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'flex-end' }}>
        <IconButton onClick={() => setIsProfileFullScreen(false)} sx={{ color: 'text.secondary' }}>
          <Close />
                </IconButton>
              </Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', height: '100%' }}>
        <Box sx={{ 
          width: 120, 
          borderRight: `1px solid ${theme.palette.divider}`, 
          display: 'flex', 
          flexDirection: 'column', 
          py: 2 
        }}>
          <List disablePadding>
            <ListItemButton 
              selected={profileTab === 'data'} 
              onClick={() => setProfileTab('data')} 
              sx={{ px: 2, py: 1 }}
            >
              Данные
                    </ListItemButton>
            <ListItemButton 
              selected={profileTab === 'orders'} 
              onClick={() => setProfileTab('orders')} 
              sx={{ px: 2, py: 1 }}
            >
              Заказы
                      </ListItemButton>
                  </List>
                </Box>
                
                {/* Контент вкладок */}
                <Box sx={{ flex: 1, p: 3 }}>
                  {profileTab === 'data' && (
                    <Box>
                      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                        Личные данные
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
                        <Box sx={{ 
                          p: 2, 
                          border: `1px solid ${theme.palette.divider}`, 
                          borderRadius: 1,
                          bgcolor: 'background.paper'
                        }}>
                          <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontSize: '12px', mb: 0.5 }}>
                            Имя
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {user.name || 'Не указано'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ 
                          p: 2, 
                          border: `1px solid ${theme.palette.divider}`, 
                          borderRadius: 1,
                          bgcolor: 'background.paper'
                        }}>
                          <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontSize: '12px', mb: 0.5 }}>
                            Телефон
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {user.phone ? `+7 ${user.phone}` : 'Не указан'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ 
                          p: 2, 
                          border: `1px solid ${theme.palette.divider}`, 
                          borderRadius: 1,
                          bgcolor: 'background.paper'
                        }}>
                          <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontSize: '12px', mb: 0.5 }}>
                            Инвайт-код
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {user.inviteCode || 'Не указан'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ 
                          p: 2, 
                          border: `1px solid ${theme.palette.divider}`, 
                          borderRadius: 1,
                          bgcolor: 'background.paper'
                        }}>
                          <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontSize: '12px', mb: 0.5 }}>
                            Адрес доставки
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {user.address || 'Не указан'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ 
                          p: 2, 
                          border: `1px solid ${theme.palette.divider}`, 
                          borderRadius: 1,
                          bgcolor: 'background.paper'
                        }}>
                          <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontSize: '12px', mb: 0.5 }}>
                            Дата регистрации
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {localStorage.getItem('lastRegistrationTime') 
                              ? new Date(parseInt(localStorage.getItem('lastRegistrationTime')!)).toLocaleDateString('ru-RU') 
                              : 'Не зарегистрирован'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ 
                          p: 2, 
                          border: `1px solid ${theme.palette.divider}`, 
                          borderRadius: 1,
                          bgcolor: 'background.paper'
                        }}>
                          <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontSize: '12px', mb: 0.5 }}>
                            Баланс
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
                            {user.balance}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                  
                                    {profileTab === 'orders' && !selectedOrderForDetail && (
                    <Box>
                      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                        История заказов
                      </Typography>
                      {user.orders.length === 0 ? (
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                          У вас пока нет заказов
                        </Typography>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {user.orders.map((order, index) => (
                            <Box 
                              key={index}
                              sx={{
                                p: 3,
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                                '&:hover': {
                                  bgcolor: 'action.hover',
                                  cursor: 'pointer'
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                  Заказ №{index + 1}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                  {order.date}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                  Товаров: {order.items.length}
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                  {order.total.toLocaleString('ru-RU')} ₽
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleViewOrderDetails(order)}
                                >
                                  Подробнее
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => handleRepeatOrder(order)}
                                >
                                  Повторить заказ
                                </Button>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  )}

                  {profileTab === 'orders' && selectedOrderForDetail && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <IconButton onClick={() => setSelectedOrderForDetail(null)} sx={{ mr: 2 }}>
                          <Close />
                        </IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                          Заказ №{user.orders.findIndex(o => o.id === selectedOrderForDetail.id) + 1}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                          Дата заказа: {selectedOrderForDetail.date}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                          Адрес: {selectedOrderForDetail.address || 'Не указан'}
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                          Сумма: {selectedOrderForDetail.total.toLocaleString('ru-RU')} ₽
                        </Typography>
                      </Box>

                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                        Товары:
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                        {selectedOrderForDetail.items.map((item, itemIndex) => (
                          <Box 
                            key={itemIndex}
                            sx={{
                              p: 2,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 1,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                {item.brand} - {item.aroma}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {item.volume}
                              </Typography>
                            </Box>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {item.price.toLocaleString('ru-RU')} ₽
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleRepeatOrder(selectedOrderForDetail)}
                        sx={{ mt: 2 }}
                      >
                        Повторить этот заказ
                      </Button>
                    </Box>
                  )}
                </Box>
                </Box>
                        </Paper>
                      );

  const renderCartFullScreen = () => (
    <Paper
      elevation={0}
      sx={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: brandsMenuOpen ? 340 : 66,
        bgcolor: 'background.default',
        color: 'text.primary',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: brandsMenuOpen ? 'calc(100vw - 340px)' : 'calc(100vw - 66px)',
        borderRadius: 0,
        boxShadow: 'none',
        zIndex: 3,
        overflowX: 'hidden'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'flex-end' }}>
        <IconButton onClick={() => {
          setIsCartFullScreen(false);
          setCheckoutStep(null);
        }} sx={{ color: 'text.secondary' }}>
          <Close />
        </IconButton>
                  </Box>
      
      {checkoutStep === null && (
                          <Box>
          <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>Корзина</Typography>
          {cart.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '200px',
              textAlign: 'center',
              mt: 4
            }}>
              <Typography variant="h6" sx={{ 
                color: 'text.secondary',
                fontWeight: 'normal',
                fontSize: '18px'
              }}>
                Ваша корзина пуста
              </Typography>
            </Box>
          ) : (
            <List>
              {cart.map((item, index) => (
                <ListItem 
                  key={index} 
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      aria-label="delete" 
                      onClick={() => handleRemoveFromCart(index)}
                    >
                      <Close />
                            </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      <LocalFlorist />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${item.brand} - ${item.aroma} (${item.volume})`}
                    secondary={`${item.price.toLocaleString('ru-RU')} ₽`}
                    sx={{ cursor: 'pointer' }}
                  />
                </ListItem>
              ))}
                  </List>
                )}
          {cart.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                Итого: {cart.reduce((sum, item) => sum + item.price, 0).toLocaleString('ru-RU')} ₽
              </Typography>
              <Button 
                variant="contained" 
                fullWidth
                onClick={() => setCheckoutStep('form')}
              >
                Перейти к оформлению
              </Button>
            </Box>
          )}
        </Box>
      )}

            {checkoutStep === 'form' && (
        <Box>
          <Typography variant="h5" sx={{ mb: 2 }}>Оформление заказа</Typography>
                <TextField
                  label="Адрес доставки"
                  fullWidth
            sx={{ mb: 2 }}
                  value={user.address}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setUser(prev => ({ ...prev, address: e.target.value }))
            }
                />
                <TextField
            label="Контактный телефон"
                  fullWidth
            sx={{ mb: 2 }}
                  value={user.phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setUser(prev => ({ ...prev, phone: e.target.value }))
            }
                />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="outlined" 
              onClick={() => setCheckoutStep(null)}
            >
              Назад в корзину
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSendOrderDetails}
            >
              Далее
            </Button>
          </Box>
        </Box>
            )}
      
            {checkoutStep === 'payment' && (
              <Box>
          <Typography variant="h5" sx={{ mb: 2 }}>Оплата</Typography>
          <Typography sx={{ mb: 2 }}>Здесь будет логика оплаты...</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="outlined" 
              onClick={() => setCheckoutStep('form')}
            >
              Назад к адресу
            </Button>
            <Button 
              variant="contained" 
              onClick={handlePaymentComplete}
            >
              Оплатить
            </Button>
          </Box>
              </Box>
            )}
      
            {checkoutStep === 'orderDetail' && currentOrder !== null && (
              <Box>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Детали заказа №{user.orders[currentOrder].id}
          </Typography>
          <Typography>Дата: {user.orders[currentOrder].date}</Typography>
          <Typography>Адрес: {user.orders[currentOrder].address || 'Не указан'}</Typography>
          <Typography>Телефон: {user.orders[currentOrder].phone || 'Не указан'}</Typography>
          
          <Typography sx={{ mt: 2, fontWeight: 'bold' }}>Товары:</Typography>
                <List>
            {user.orders[currentOrder].items.map((item, index) => (
              <ListItem key={index}>
                <ListItemText 
                  primary={`${item.brand} - ${item.aroma} (${item.volume})`}
                  secondary={`${item.price.toLocaleString('ru-RU')} ₽`}
                />
              </ListItem>
                  ))}
                </List>
                
                <Typography sx={{ mt: 2, fontWeight: 'bold', textAlign: 'center' }}>
                  Итого: {user.orders[currentOrder].total.toLocaleString('ru-RU')} ₽
                </Typography>
          
          <Typography sx={{ mt: 2, fontWeight: 'bold' }}>История сообщений:</Typography>
          <Box sx={{ 
            border: '1px solid #ccc', 
            borderRadius: 1, 
            p: 2, 
            mt: 1, 
            maxHeight: 200, 
            overflowY: 'auto' 
          }}>
                  {user.orders[currentOrder].history.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Нет сообщений.
              </Typography>
                  ) : (
              user.orders[currentOrder].history.map((msg, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    mb: 1, 
                    p: 1, 
                    borderRadius: 1, 
                    bgcolor: msg.sender === 'user' ? 'primary.light' : 'grey.200', 
                    ml: msg.sender === 'user' ? 'auto' : 0, 
                    mr: msg.sender === 'user' ? 0 : 'auto', 
                    maxWidth: '80%' 
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {msg.sender === 'user' ? 'Вы:' : 'Менеджер:'}
                  </Typography>
                  <Typography variant="body2">{msg.text}</Typography>
                          {msg.file && (
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      Файл: <Box component="a" href={msg.file.url} target="_blank" rel="noopener noreferrer">{msg.file.name}</Box>
                            </Typography>
                          )}
                        {msg.sender === 'user' && (
                    <Button 
                      size="small" 
                      onClick={() => { 
                        setEditingCommentIndex(index); 
                            setOrderComment(msg.text);
                        setCommentFile(msg.file ? new File([], msg.file.name) : null); 
                      }}
                    >
                      Редактировать
                    </Button>
                        )}
                      </Box>
                    ))
                  )}
                </Box>
          
                <TextField
                  label="Комментарий к заказу"
                  fullWidth
                  multiline
                  rows={3}
            sx={{ mt: 2, mb: 1 }}
                  value={orderComment}
                  onChange={handleOrderCommentChange}
          />
          
          <Box 
            component="input" 
                    type="file"
                    onChange={handleCommentFileUpload}
            sx={{ display: 'block', mb: 1 }} 
          />
          
          {commentFile && (
            <Typography variant="body2">
              Прикреплен файл: {commentFile.name}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button 
              variant="outlined" 
              onClick={handleCancelEditComment}
            >
              Отмена
                    </Button>
            <Button 
              variant="contained" 
              onClick={handleSendComment}
            >
              {editingCommentIndex !== null ? 'Сохранить изменения' : 'Отправить комментарий'}
                </Button>
              </Box>
          
              <Button
                variant="contained"
                fullWidth
            sx={{ mt: 2 }} 
            onClick={handleCloseCheckoutDialog}
              >
            Закрыть
              </Button>
        </Box>
            )}
    </Paper>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      width: '100vw', 
      bgcolor: 'background.paper', 
      color: 'text.primary', 
      display: 'flex', 
      flexDirection: 'column', 
      transition: 'background-color 0.3s ease-in-out',
      overflowX: 'hidden'
    }}>
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        p: 0,
        pt: 0,
        overflowX: 'hidden', 
        alignItems: 'stretch' 
      }}>
        {brandsMenuOpen ? renderBrandsMenu() : renderCollapsedMenu()}
        
        {!isProfileFullScreen && !isCartFullScreen && renderMainContent()}
        {isProfileFullScreen && renderProfileFullScreen()}
        {isCartFullScreen && renderCartFullScreen()}
      </Box>


    </Box>
  );
};

export default App;