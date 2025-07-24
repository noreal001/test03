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
  CardContent, 
  Slider 
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
  brand?: string 
};

interface Order {
  id: string;
  date: string;
  items: { aroma: string; brand: string; volume: string }[];
  comment: string;
  receiptAttached: boolean;
  history: {text: string, sender: 'user' | 'manager'; file?: {name: string, url: string}}[];
  awaitingManagerReply: boolean;
  address?: string;
  phone?: string;
}

interface User {
  name: string;
  balance: string;
  avatar: string;
  orders: Order[];
  address: string;
  phone: string;
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
  const [cart, setCart] = useState<{ aroma: string; brand: string; volume: string }[]>([]);
  const [profileTab, setProfileTab] = useState<'data' | 'orders'>('data');
  const [checkoutStep, setCheckoutStep] = useState<null | 'form' | 'payment' | 'orderDetail'>(null);
  const [currentOrder, setCurrentOrder] = useState<number | null>(null);
  const [orderComment, setOrderComment] = useState<string>('');
  const [commentFile, setCommentFile] = useState<File | null>(null);
  const [editingCommentIndex, setEditingCommentIndex] = useState<number | null>(null);
  const [cartFlash, setCartFlash] = useState(false);
  const [emojiParticles, setEmojiParticles] = useState<
    Array<{ id: number; emoji: string; x: number; y: number; opacity: number }>
  >([]);
  const [isProfileFullScreen, setIsProfileFullScreen] = useState(false);
  const [isCartFullScreen, setIsCartFullScreen] = useState(false);
  const [selectedAromaFromCart, setSelectedAromaFromCart] = useState<string | null>(null);
  const [isAromaDetailDialogOpen, setIsAromaDetailDialogOpen] = useState(false);

  const [user, setUser] = useState<User>(() => {
    const savedName = localStorage.getItem('userName') || '';
    const savedPhone = localStorage.getItem('userPhone') || '';
    return {
      name: savedName,
      balance: '12 500 ₽',
      avatar: '',
      orders: [],
      address: '',
      phone: savedPhone,
    };
  });

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
        setUser(prev => ({ ...prev, name: userName!, phone: userPhone! }));
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
    setCart(prev => [...prev, { 
      aroma: aromaName, 
      brand: brandName, 
      volume: `${volume} гр` 
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
    const newOrder = { 
      id: newOrderId, 
      date: new Date().toLocaleDateString(), 
      items: [...cart], 
      comment: '', 
      receiptAttached: false, 
      history: [], 
      awaitingManagerReply: false 
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
          pb: 2, 
          pt: 0, 
          px: 2 
        }}>
          <Typography variant="h5" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}>
            Ароматы {brands[selectedIndex]?.name}
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            gap: 2, 
            justifyContent: 'center', 
            width: '100%' 
          }}>
            {(brands[selectedIndex]?.aromas || [])
              .filter((aroma: Aroma) => 
                aroma?.name?.toLowerCase().includes(search.toLowerCase())
              )
              .map((aroma: Aroma, aromaIdx: number) => (
                <Card key={aroma.name} sx={{
                  width: 200,
                  boxShadow: 'none',
                            border: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          color: 'text.primary',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
                }} id={`aroma-${aroma.name}`}>
                  <CardContent sx={{ 
                    p: 2, 
                    textAlign: 'center', 
                    flexGrow: 1, 
                    width: '100%' 
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {aroma.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {brands[selectedIndex]?.name}
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      gap: 1, 
                      mb: 1 
                    }}>
                      <LocalFlorist sx={{ fontSize: 16, color: 'secondary.main' }} />
                      <Typography variant="body2">{aroma.aroma_group}</Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {`${selectedVolumes[aroma.name] || 30} гр: ${aroma.prices[selectedVolumes[aroma.name] || 30]} ₽`}
                    </Typography>
                    <Box sx={{ width: '100%', px: 2, mt: 2 }}>
                      <Slider
                        aria-label="Объем"
                        defaultValue={30}
                        step={5}
                        marks
                        min={30}
                        max={1000}
                        value={selectedVolumes[aroma.name] || 30}
                        onChange={(_: any, value: number | number[]) => {
                          handleVolumeSlider(aroma.name, _, Array.isArray(value) ? value[0] : value);
                        }}
                        valueLabelFormat={(value: number) => 
                          `${value} гр`
                        }
                        valueLabelDisplay="auto"
                        sx={{
                          color: 'primary.main',
                          '& .MuiSlider-thumb': { width: 16, height: 16 },
                          '& .MuiSlider-track': { height: 4 },
                          '& .MuiSlider-rail': { height: 4 },
                        }}
                      />
                      <Typography variant="caption" sx={{ 
                        textAlign: 'center', 
                        width: '100%', 
                        display: 'block',
                        mb: 2
                      }}>
                        Объем: {selectedVolumes[aroma.name] || 30}гр
                      </Typography>
                      <Button
                        variant="contained"
                        fullWidth
                        size="small"
                        onClick={() => handleAddToCart(
                          aroma.name, 
                          brands[selectedIndex]?.name || '', 
                          selectedVolumes[aroma.name] || 30
                        )}
                        sx={{ mt: 1 }}
                      >
                        В корзину
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
                          ))}
          </Box>
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
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
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
                    sx={{ cursor: 'pointer' }}
                  />
                </ListItem>
              ))}
                  </List>
                )}
          {cart.length > 0 && (
            <Button 
              variant="contained" 
              sx={{ mt: 2 }} 
              onClick={() => setCheckoutStep('form')}
            >
              Перейти к оформлению
            </Button>
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
                <ListItemText primary={`${item.brand} - ${item.aroma} (${item.volume})`} />
              </ListItem>
                  ))}
                </List>
          
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
      transition: 'background-color 0.3s ease-in-out' 
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