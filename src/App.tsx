import React, { useState, useEffect } from 'react';
import { Box, List, ListItemButton, ListItemText, Typography, Paper, Fade, Divider, IconButton, TextField, InputAdornment, Chip, Stack, Avatar, useMediaQuery, useTheme, Slider, Button } from '@mui/material';
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
import Popover from '@mui/material/Popover';

// Mock info for all aromas (можно расширить под каждый аромат)
const aromaInfo = {
  price: '1 800 ₽ — 38 000 ₽',
  quality: 'TOP',
  volumes: ['30 гр', '50 гр', '500 гр', '1 кг'],
  factory: 'Eps',
};

const user = {
  name: 'Алексей',
  balance: '12 500 ₽',
  avatar: '', // Можно вставить ссылку на фото или оставить пустым для инициалов
};

type Brand = { name: string; aromas: string[] };

const App: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [brandsMenuOpen, setBrandsMenuOpen] = useState(true);
  const [search, setSearch] = useState('');
  // Сохраняем выбранный объём для каждого аромата (по имени)
  const [selectedVolumes, setSelectedVolumes] = useState<{ [aroma: string]: number }>({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // Для слайдера: индексы объёмов
  const handleVolumeSlider = (aroma: string, idx: number) => {
    setSelectedVolumes((prev) => ({ ...prev, [aroma]: idx }));
  };

  const [cart, setCart] = useState<{ aroma: string; brand: string; volume: string }[]>([]);
  const [aromaView, setAromaView] = useState<'cards' | 'list'>('cards');
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const [profileTab, setProfileTab] = useState<'logo' | 'fio' | 'address' | 'orders'>('logo');
  const [rightPanelContent, setRightPanelContent] = useState<'cart' | 'profile' | null>(null); // New state for right panel content

  useEffect(() => {
    fetch('/brands.json')
      .then(res => res.json())
      .then((data: Brand[]) => {
        const sorted = data.slice().sort((a, b) => a.name.localeCompare(b.name, 'ru'));
        setBrands(sorted);
      });
  }, []);

  const handleBrandClick = (index: number) => {
    setSelectedIndex(index);
  };

  const handleAromaClick = (aroma: string) => {
    // console.log('Выбран аромат:', aroma); // Commenting out unused function content
  };

  const handleBackToSearch = () => {
    setSelectedIndex(null);
  };

  const handleToggleBrandsMenu = () => {
    setBrandsMenuOpen((prev) => !prev);
  };

  // 1. Кастомный слайдер объёма для карточки аромата:
  const volumeMarks = [30, 50, 500, 1000];

  // 2. Фильтры в поиске:
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const filterOptions = [
    'TOP', 'Q1', 'Q2', 'МУЖСКИЕ', 'ЖЕНСКИЕ', 'УНИСЕКС',
    'АПЕЛЬСИН', 'УД', 'ТАБАК', 'МАНДАРИН',
  ];
  const handleFilterClick = (filter: string) => {
    setActiveFilters((prev) => prev.includes(filter)
      ? prev.filter(f => f !== filter)
      : [...prev, filter]);
  };

  const handleAddToCart = (aroma: string, brand: string, volumeIdx: number) => {
    setCart(prev => [...prev, { aroma, brand, volume: aromaInfo.volumes[volumeIdx] }]);
  };
  const handleRemoveFromCart = (idx: number) => {
    setCart(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: 'background.paper', color: 'text.primary', display: 'flex', flexDirection: 'column' }}>
      {/* Fixed Icons for Cart and Profile */}
      <Box sx={{ position: 'fixed', top: 0, right: 0, p: 2, zIndex: 2000, display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton color="primary" onClick={() => setRightPanelContent(rightPanelContent === 'cart' ? null : 'cart')} sx={{ position: 'relative' }}>
          {rightPanelContent === 'cart' ? <CloseIcon sx={{ fontSize: 28 }} /> : <ShoppingCartIcon sx={{ fontSize: 28 }} />}
          {cart.length > 0 && (
            <Box sx={{ position: 'absolute', top: -5, right: -5, bgcolor: 'error.main', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{cart.length}</Box>
          )}
        </IconButton>
        <IconButton color="primary" onClick={() => setRightPanelContent(rightPanelContent === 'profile' ? null : 'profile')}>
          {rightPanelContent === 'profile' ? <CloseIcon sx={{ fontSize: 28 }} /> : <PersonIcon sx={{ fontSize: 28 }} />}
        </IconButton>
      </Box>

      {/* Main content area (left menu, central content, right panels) */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', p: 0, width: '100vw', pt: '64px' /* Adjust for fixed icons height */ }}>
        {/* Меню брендов слева */}
        {brandsMenuOpen && (
          <Paper elevation={3} sx={{ width: 340, minWidth: 340, maxWidth: 340, bgcolor: '#000', p: 2, pr: 2, pb: 0, mr: 0, mb: isMobile ? 2 : 0, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', position: 'relative', height: '100%', justifyContent: 'flex-start', borderTopRightRadius: 0, borderBottomRightRadius: 0, boxShadow: 'none', boxSizing: 'border-box', bottom: 0 }}>
            {/* Кнопка сворачивания меню */}
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', mb: 1 }}>
              <IconButton onClick={handleToggleBrandsMenu} sx={{ mr: 1 }}>
                <MenuOpenIcon />
              </IconButton>
              <IconButton onClick={handleBackToSearch}>
                <SearchIcon />
              </IconButton>
            </Box>
            {/* Заголовок */}
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', textAlign: 'center', width: '100%', fontSize: 17, letterSpacing: 1, color: 'text.primary' }}>
              БРЕНДЫ
            </Typography>
            {/* Список брендов */}
            <Box sx={{ flex: 1, overflowY: 'auto', width: '100%', pr: 1, minHeight: 0 }} id="brands-list-scroll">
              <List component="nav" sx={{ width: '100%' }}>
                {brands.map((brand, idx) => (
                  <ListItemButton
                    key={brand.name}
                    selected={selectedIndex === idx}
                    onClick={() => handleBrandClick(idx)}
                    sx={{ borderRadius: 1, mb: 1, transition: 'background 0.3s', fontWeight: selectedIndex === idx ? 'bold' : 'normal' }}
                  >
                    <ListItemText primary={brand.name} />
                  </ListItemButton>
                ))}
              </List>
            </Box>
            {/* Серый разделитель */}
            <Box sx={{ width: '100%', height: 2, bgcolor: '#444', my: 1 }} />
          </Paper>
        )}
        {/* Скрытое меню */}
        {!brandsMenuOpen && (
          <Box sx={{ width: 66, minWidth: 66, maxWidth: 66, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', height: '100%', bgcolor: 'background.paper', opacity: 0.96, boxShadow: 3, borderRight: '2px solid #222', pt: 2, position: 'relative' }}>
            <IconButton onClick={handleToggleBrandsMenu} sx={{ mb: 1, ml: 1 }}>
              <MenuIcon />
            </IconButton>
            <IconButton onClick={handleBackToSearch} sx={{ ml: 1 }}>
              <SearchIcon />
            </IconButton>
          </Box>
        )}

        {/* Центральная панель (ароматы/поиск) */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', height: '100%', position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1, px: 0, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, width: `calc(100% - ${(brandsMenuOpen ? 340 : 66) + (rightPanelContent ? 340 : 0)}px)`, transition: 'width 0.3s', boxSizing: 'border-box' }}>
          {selectedIndex === null ? (
            <Paper elevation={4} sx={{ width: '100%', p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, borderRadius: 0, boxSizing: 'border-box' }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                Поиск ароматов
              </Typography>
              <TextField
                variant="outlined"
                placeholder="Введите название аромата..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 2 }}>
                {filterOptions.map(option => (
                  <Chip
                    key={option}
                    label={option}
                    clickable
                    color={activeFilters.includes(option) ? 'primary' : 'default'}
                    onClick={() => handleFilterClick(option)}
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Найдите свой любимый аромат или выберите бренд слева
              </Typography>
            </Paper>
          ) : (
            <Fade in={selectedIndex !== null} timeout={400} unmountOnExit>
              <Paper elevation={4} sx={{ width: '100%', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, position: 'relative', flex: 1, minHeight: 0, overflowY: 'auto', boxSizing: 'border-box' }}>
                {/* Header for brand aromas */}
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1, justifyContent: 'space-between' }}>
                  <IconButton onClick={handleBackToSearch} sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                  </IconButton>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1, minWidth: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {brands[selectedIndex].name}
                  </Typography>
                  {/* Moved view toggles below */}
                </Box>
                <Divider sx={{ mb: 2, width: '100%' }} />

                {/* View Toggle Buttons - NEW LOCATION, centered */}
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mb: 2 }}>
                  <IconButton onClick={() => setAromaView('cards')} color={aromaView === 'cards' ? 'primary' : 'default'}><ViewModuleIcon /></IconButton>
                  <IconButton onClick={() => setAromaView('list')} color={aromaView === 'list' ? 'primary' : 'default'}><ViewListIcon /></IconButton>
                </Box>

                {/* Список или карточки ароматов */}
                {aromaView === 'cards' ? (
                  <Box sx={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: isMobile ? 'center' : 'flex-start', overflowX: isMobile ? 'auto' : 'visible' }}>
                    {brands[selectedIndex].aromas.map((aroma) => {
                      const volumeIdx = selectedVolumes[aroma] ?? 0;
                      const dragLeft = volumeIdx / (aromaInfo.volumes.length - 1);
                      return (
                        <Paper
                          key={aroma}
                          elevation={2}
                          sx={{ flex: '1 1 200px', minWidth: 200, maxWidth: 250, height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', bgcolor: 'background.default', transition: 'background 0.2s', '&:hover': { bgcolor: 'action.hover' }, p: 1.5, position: 'relative' }}
                        >
                          {/* Верхняя часть: иконка-плейсхолдер */}
                          <Box sx={{ width: 36, height: 36, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <LocalFloristIcon sx={{ fontSize: 28, color: 'text.secondary' }} />
                          </Box>
                          {/* Название */}
                          <Typography variant="body2" align="center" sx={{ fontWeight: 600, mb: 0.5, fontSize: 15 }}>{aroma}</Typography>
                          {/* Вся информация */}
                          <Box sx={{ width: '100%', mt: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Stack direction="row" spacing={0.5} sx={{ mb: 0.5 }}>
                              <Chip label={`Качество: ${aromaInfo.quality}`} size="small" color="primary" sx={{ fontSize: 11 }} />
                              <Chip label={`Фабрика: ${aromaInfo.factory}`} size="small" sx={{ fontSize: 11 }} />
                            </Stack>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500 }}>
                              {aromaInfo.price}
                            </Typography>
                          </Box>
                          {/* Кастомный слайдер для объёмов — строго в самом низу карточки */}
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
                            <Box
                              sx={{
                                position: 'absolute',
                                left: `calc(${dragLeft * 100}% - 12px)`,
                                top: 32,
                                zIndex: 3,
                                transition: 'left 0.4s cubic-bezier(.4,2,.6,1)',
                                pointerEvents: 'none',
                              }}
                            >
                              <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'success.light', boxShadow: 2, border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }}>
                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.main' }} />
                              </Box>
                            </Box>
                          </Box>
                          {/* Кнопка В корзину */}
                          <Box sx={{ width: '100%', mt: 1, display: 'flex', justifyContent: 'center' }}>
                            <IconButton color="success" onClick={() => handleAddToCart(aroma, brands[selectedIndex].name, volumeIdx)}>
                              <ShoppingCartIcon />
                            </IconButton>
                          </Box>
                        </Paper>
                      );
                    })}
                  </Box>
                ) : (
                  <List sx={{ width: '100%' }}>
                    {brands[selectedIndex].aromas.map((aroma) => {
                      const volumeIdx = selectedVolumes[aroma] ?? 0;
                      return (
                        <ListItemButton key={aroma} sx={{ mb: 1, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography sx={{ fontWeight: 600 }}>{aroma}</Typography>
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

        {/* Единая правая панель (Корзина/Профиль) */}
        <Paper elevation={6} sx={{ width: rightPanelContent ? 340 : 0, minWidth: rightPanelContent ? 340 : 0, maxWidth: rightPanelContent ? 340 : 0, height: '100%', zIndex: 1999, p: 3, bgcolor: '#000', color: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'width 0.3s' }}>
          {rightPanelContent === 'cart' && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ flex: 1, fontWeight: 700 }}>Корзина</Typography>
                <IconButton onClick={() => setRightPanelContent(null)}><CloseIcon /></IconButton>
              </Box>
              {cart.length === 0 ? (
                <Typography color="text.secondary">Корзина пуста</Typography>
              ) : (
                <List>
                  {cart.map((item, idx) => (
                    <ListItemButton key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 1, mb: 1 }}>
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>{item.aroma}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.brand}, {item.volume}</Typography>
                      </Box>
                      <IconButton size="small" onClick={() => handleRemoveFromCart(idx)}><CloseIcon fontSize="small" /></IconButton>
                    </ListItemButton>
                  ))}
                </List>
              )}
              {cart.length > 0 && (
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  sx={{ mt: 'auto', py: 1.5, fontWeight: 700, fontSize: 16 }}
                  onClick={() => alert('Переход к оформлению заказа!')}
                >
                  Оформить
                </Button>
              )}
            </>
          )}
          {rightPanelContent === 'profile' && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ flex: 1, fontWeight: 700 }}>Профиль</Typography>
                <IconButton onClick={() => setRightPanelContent(null)}><CloseIcon /></IconButton>
              </Box>
              {/* Содержимое профиля */}
              <Box sx={{ flex: 1, minWidth: 220, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                {profileTab === 'logo' && (
                  <>
                    <Avatar src={user.avatar} alt={user.name} sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontWeight: 700, fontSize: 32 }}>
                      {user.avatar ? '' : user.name[0]}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{user.name}</Typography>
                    <Typography variant="body1" color="text.secondary">Баланс: {user.balance}</Typography>
                  </>
                )}
                {profileTab === 'fio' && (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>ФИО</Typography>
                    <TextField fullWidth size="small" value={user.name} sx={{ input: { color: '#fff' } }} />
                  </>
                )}
                {profileTab === 'address' && (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Адрес</Typography>
                    <TextField fullWidth size="small" value={'г. Москва, ул. Примерная, д. 1'} sx={{ input: { color: '#fff' } }} />
                  </>
                )}
                {profileTab === 'orders' && (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Заказы</Typography>
                    <Typography variant="body2" color="text.secondary">У вас 3 заказа</Typography>
                  </>
                )}
              </Box>
              {/* Меню профиля слева */}
              <Box sx={{ width: 120, borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', py: 2 }}>
                <List disablePadding>
                  <ListItemButton selected={profileTab==='logo'} onClick={()=>setProfileTab('logo')} sx={{ px: 2, py: 1 }}>Логотип</ListItemButton>
                  <ListItemButton selected={profileTab==='fio'} onClick={()=>setProfileTab('fio')} sx={{ px: 2, py: 1 }}>ФИО</ListItemButton>
                  <ListItemButton selected={profileTab==='address'} onClick={()=>setProfileTab('address')} sx={{ px: 2, py: 1 }}>Адрес</ListItemButton>
                  <ListItemButton selected={profileTab==='orders'} onClick={()=>setProfileTab('orders')} sx={{ px: 2, py: 1 }}>Заказы</ListItemButton>
                </List>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default App;
