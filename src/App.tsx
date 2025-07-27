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
  ListItemAvatar
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

import { ThemeContext } from './index';
import { 
  Brand, 
  Aroma, 
  Order,
  ProfileTab, 
  CheckoutStep, 
  AromaForVolume
} from './types';
import { useCart, useUser, useVolumeSlider } from './hooks';
import { AromaCard, VolumeSlider } from './components';
import { loadBrandsData } from './utils';


// Основной компонент приложения

const App = () => {
  // Хуки и контекст
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const themeContext = useContext(ThemeContext);
  if (!themeContext) {
    throw new Error('App must be used within a ThemeProvider');
  }
  const { themeMode, toggleTheme } = themeContext;

  // Кастомные хуки
  const { 
    cart, 
    cartFlash, 
    emojiParticles, 
    addToCart, 
    removeFromCart, 
    clearCart
  } = useCart();
  
  const { 
    user, 
    updateUserField, 
    addOrder, 
    updateOrderHistory 
  } = useUser();

  // Локальные состояния
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [brandsMenuOpen, setBrandsMenuOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [profileTab, setProfileTab] = useState<ProfileTab>('data');
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>(null);
  const [currentOrder, setCurrentOrder] = useState<number | null>(null);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [orderComment, setOrderComment] = useState<string>('');
  const [commentFile, setCommentFile] = useState<File | null>(null);
  const [editingCommentIndex, setEditingCommentIndex] = useState<number | null>(null);
  const [isProfileFullScreen, setIsProfileFullScreen] = useState(false);
  const [isCartFullScreen, setIsCartFullScreen] = useState(false);
  const [selectedAromaForVolume, setSelectedAromaForVolume] = useState<AromaForVolume | null>(null);
  const [selectedAromaFromCart, setSelectedAromaFromCart] = useState<string | null>(null);

  // Хук для слайдера объема (используется в компоненте VolumeSlider)
  const volumeSliderHook = useVolumeSlider();

  // Эффекты
  useEffect(() => {
    const fetchBrands = async () => {
      const data = await loadBrandsData();
      setBrands(data);
    };

    fetchBrands();
  }, []);

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

  const handleAddToCart = (aromaName: string, brandName: string, volume: number) => {
    addToCart(aromaName, brandName, volume, brands, selectedIndex!);
    setSelectedAromaForVolume(null);
  };

  const handleRemoveFromCart = (idx: number) => {
    removeFromCart(idx);
  };

  const handleSendOrderDetails = () => {
    setCheckoutStep('payment');
  };

  const handlePaymentComplete = () => {
    addOrder(cart, user.address, user.phone);
    clearCart();
    setCheckoutStep('orderDetail'); 
    setIsCartFullScreen(false);
    setCurrentOrder(user.orders.length);
  };

  const handleRepeatOrder = (order: Order) => {
    clearCart();
    order.items.forEach(item => {
      const brandIndex = brands.findIndex(b => b.name === item.brand);
      if (brandIndex !== -1) {
        const volume = parseInt(item.volume.replace(' гр', ''));
        addToCart(item.aroma, item.brand, volume, brands, brandIndex);
      }
    });
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

    if (editingCommentIndex !== null) {
      const updatedHistory = [...user.orders[currentOrder].history];
      updatedHistory[editingCommentIndex] = newComment;
      updateOrderHistory(currentOrder, { history: updatedHistory });
      setEditingCommentIndex(null);
    } else {
      const updatedHistory = [...user.orders[currentOrder].history, newComment];
      updateOrderHistory(currentOrder, { 
        history: updatedHistory,
        awaitingManagerReply: true 
      });
      setOrderComment('');
      setCommentFile(null);

      setTimeout(() => {
        const managerReply = { 
          text: 'Менеджер: Спасибо за ваш комментарий! Мы его рассмотрим.', 
          sender: 'manager' as const
        };
        const finalHistory = [...updatedHistory, managerReply];
        updateOrderHistory(currentOrder, { 
          history: finalHistory,
          awaitingManagerReply: false 
        });
      }, 3000);
    }
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
          pb: isMobile ? 1 : 2, 
          pt: 0, 
          px: isMobile ? 1 : 2 
        }}>
          <Box 
            onWheel={(e) => {
              if (!isMobile) {
                // Горизонтальный скролл колесиком мыши только на десктопе
                const container = e.currentTarget;
                container.scrollLeft += e.deltaY * 2;
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              flexWrap: isMobile ? 'nowrap' : 'nowrap',
              gap: isMobile ? 3 : 6, 
              width: isMobile ? '100%' : 'max-content',
              px: isMobile ? 0 : 2,
              py: isMobile ? 1 : 3,
              overflowX: isMobile ? 'visible' : 'auto',
              overflowY: isMobile ? 'visible' : 'hidden',
              // Скрываем скроллбары только на десктопе
              ...(isMobile ? {} : {
                scrollbarWidth: 'none',
                '-ms-overflow-style': 'none',
                '&::-webkit-scrollbar': {
                  display: 'none',
                  width: '0px',
                  height: '0px',
                  background: 'transparent'
                },
                '&::-webkit-scrollbar-track': {
                  display: 'none'
                },
                '&::-webkit-scrollbar-thumb': {
                  display: 'none'
                },
                '&::-webkit-scrollbar-corner': {
                  display: 'none'
                }
              })
            }}>
            {(brands[selectedIndex]?.aromas || [])
              .filter((aroma: Aroma) => 
                aroma?.name?.toLowerCase().includes(search.toLowerCase())
              )
              .map((aroma: Aroma, aromaIdx: number) => (
                <AromaCard
                  key={aroma.name}
                  aroma={aroma}
                  brandName={brands[selectedIndex]?.name || ''}
                  isMobile={isMobile}
                  selectedAromaForVolume={selectedAromaForVolume}
                  volumeSliderValue={volumeSliderHook.volumeSliderValue}
                  getFillPercentage={volumeSliderHook.getFillPercentage}
                  getDarkerFillColor={volumeSliderHook.getDarkerFillColor}
                  onCardClick={(aroma, brand) => {
                    setSelectedAromaForVolume({ aroma, brand });
                    volumeSliderHook.resetSlider();
                  }}
                />
              ))}
          </Box>

          {/* Компонент выбора объема под карточками */}
          {selectedAromaForVolume && (
            <VolumeSlider
              selectedAromaForVolume={selectedAromaForVolume}
              onCancel={() => setSelectedAromaForVolume(null)}
              onAddToCart={handleAddToCart}
            />
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
        left: isMobile ? 0 : (brandsMenuOpen ? 340 : 66),
        bgcolor: 'background.default',
        color: 'text.primary',
        p: isMobile ? 2 : 3,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: isMobile ? '100vw' : (brandsMenuOpen ? 'calc(100vw - 340px)' : 'calc(100vw - 66px)'),
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
        left: isMobile ? 0 : (brandsMenuOpen ? 340 : 66),
        bgcolor: 'background.default',
        color: 'text.primary',
        p: isMobile ? 2 : 3,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: isMobile ? '100vw' : (brandsMenuOpen ? 'calc(100vw - 340px)' : 'calc(100vw - 66px)'),
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
              updateUserField('address', e.target.value)
            }
                />
                <TextField
            label="Контактный телефон"
                  fullWidth
            sx={{ mb: 2 }}
                  value={user.phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              updateUserField('phone', e.target.value)
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
        alignItems: 'stretch',
        height: isMobile ? 'auto' : '100vh'
      }}>
        {/* Мобильное меню сверху или обычное меню слева */}
        {isMobile ? (
          <Box sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            p: 1,
            bgcolor: 'background.paper',
            borderBottom: `1px solid ${theme.palette.divider}`,
            position: 'sticky',
            top: 0,
            zIndex: 100
          }}>
            <IconButton onClick={handleToggleBrandsMenu}>
              <MenuOpen />
            </IconButton>
            <IconButton onClick={() => setSelectedIndex(null)}>
              <Search />
            </IconButton>
            <IconButton
              onClick={() => {
                setIsProfileFullScreen(true);
                setIsCartFullScreen(false);
              }}
            >
              <Person sx={{ fontSize: 28 }} />
            </IconButton>
            <IconButton
              sx={{
                position: 'relative',
                bgcolor: cartFlash ? 'rgba(0, 255, 0, 0.2)' : 'transparent',
                transition: 'background-color 0.3s ease-in-out'
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
            />
          </Box>
        ) : null}
        
        {/* Мобильное меню брендов (показывается поверх контента) */}
        {isMobile && brandsMenuOpen && (
          <Box sx={{
            position: 'fixed',
            top: 60,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'background.paper',
            zIndex: 200,
            overflowY: 'auto',
            p: 2
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: 17, letterSpacing: 1 }}>
                БРЕНДЫ
              </Typography>
              <IconButton onClick={handleToggleBrandsMenu}>
                <Close />
              </IconButton>
            </Box>
            <List sx={{ width: '100%' }}>
              {brands.filter(brand => brand?.name?.toLowerCase().includes(search.toLowerCase()))
                .map((brand, index) => (
                  <ListItemButton
                    key={brand.name}
                    selected={selectedIndex === index}
                    onClick={() => {
                      handleBrandClick(index);
                      setBrandsMenuOpen(false); // Закрываем меню после выбора
                    }}
                    sx={{ mb: 0.5, borderRadius: 1 }}
                  >
                    <ListItemText primary={brand.name} />
                  </ListItemButton>
                ))}
            </List>
          </Box>
        )}
        
        {/* Меню брендов */}
        {!isMobile && (brandsMenuOpen ? renderBrandsMenu() : renderCollapsedMenu())}
        
        {/* Основной контент */}
        {!isProfileFullScreen && !isCartFullScreen && renderMainContent()}
        {isProfileFullScreen && renderProfileFullScreen()}
        {isCartFullScreen && renderCartFullScreen()}
      </Box>


    </Box>
  );
};

export default App;