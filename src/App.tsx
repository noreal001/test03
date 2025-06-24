import React, { useState } from 'react';
import { Box, List, ListItemButton, ListItemText, Typography, Paper, Fade, Divider, IconButton, TextField, InputAdornment, Chip, Stack, Avatar, useMediaQuery, useTheme, Slider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';

const brands = [
  {
    name: 'Chanel',
    aromas: ['No. 5', 'Coco Mademoiselle', 'Chance'],
  },
  {
    name: 'Dior',
    aromas: ['Sauvage', "J'adore", 'Miss Dior'],
  },
  {
    name: 'Tom Ford',
    aromas: ['Black Orchid', 'Oud Wood', 'Tobacco Vanille'],
  },
];

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

const App: React.FC = () => {
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

  const handleBrandClick = (index: number) => {
    setSelectedIndex(index);
  };

  const handleAromaClick = (aroma: string) => {
    console.log('Выбран аромат:', aroma);
  };

  const handleBackToSearch = () => {
    setSelectedIndex(null);
  };

  const handleToggleBrandsMenu = () => {
    setBrandsMenuOpen((prev) => !prev);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', display: 'flex', flexDirection: isMobile ? 'column' : 'row', p: isMobile ? 0 : 2 }}>
      {/* Меню брендов слева */}
      {brandsMenuOpen && (
        <Paper elevation={3} sx={{ width: { xs: '100%', sm: 220, md: 280 }, minWidth: isMobile ? '100%' : 220, bgcolor: 'background.paper', p: 2, mr: isMobile ? 0 : 2, mb: isMobile ? 2 : 0, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', position: 'relative', height: isMobile ? 'auto' : '100vh', justifyContent: 'space-between' }}>
          <Box sx={{ width: '100%' }}>
            <IconButton onClick={handleToggleBrandsMenu} sx={{ position: 'absolute', top: 8, left: 8 }}>
              <MenuOpenIcon />
            </IconButton>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
              Бренды
            </Typography>
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
          {/* User info bottom left */}
          <Box sx={{ width: '100%', mt: 3, p: 2, borderRadius: 2, bgcolor: 'background.default', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar src={user.avatar} alt={user.name} sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontWeight: 700, mb: 1 }}>
                {user.avatar ? '' : user.name[0]}
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'center' }}>{user.name}</Typography>
              <Typography variant="body2" color="success.light" sx={{ fontWeight: 500, textAlign: 'center' }}>{user.balance}</Typography>
            </Box>
          </Box>
        </Paper>
      )}
      {!brandsMenuOpen && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: isMobile ? 0 : 2, pt: 1 }}>
          <IconButton onClick={handleToggleBrandsMenu}>
            <MenuIcon />
          </IconButton>
        </Box>
      )}
      {/* Центральная панель: поиск или ароматы */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minWidth: 0 }}>
        {selectedIndex === null ? (
          <Paper elevation={4} sx={{ width: '100%', maxWidth: 500, mt: isMobile ? 2 : 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
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
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Найдите свой любимый аромат или выберите бренд слева
            </Typography>
          </Paper>
        ) : (
          <Fade in={selectedIndex !== null} timeout={400} unmountOnExit>
            <Paper elevation={4} sx={{ width: '100%', maxWidth: 900, mt: isMobile ? 2 : 8, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, position: 'relative' }}>
              {/* Название бренда и кнопка назад на одной высоте */}
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                <IconButton onClick={handleBackToSearch} sx={{ mr: 1 }}>
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1, minWidth: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {brands[selectedIndex].name}
                </Typography>
              </Box>
              <Divider sx={{ mb: 2, width: '100%' }} />
              <Box sx={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: isMobile ? 'center' : 'flex-start', overflowX: isMobile ? 'auto' : 'visible' }}>
                {brands[selectedIndex].aromas.map((aroma) => {
                  const volumeIdx = selectedVolumes[aroma] ?? 0;
                  const dragLeft = volumeIdx / (aromaInfo.volumes.length - 1);
                  return (
                    <Paper
                      key={aroma}
                      elevation={2}
                      sx={{ flex: '1 1 180px', minWidth: 180, maxWidth: 220, height: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', bgcolor: 'background.default', transition: 'background 0.2s', '&:hover': { bgcolor: 'action.hover' }, p: 1.5, position: 'relative' }}
                    >
                      {/* Верхняя часть: иконка-плейсхолдер */}
                      <Box sx={{ width: 36, height: 36, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LocalFloristIcon sx={{ fontSize: 28, color: 'text.secondary' }} />
                      </Box>
                      {/* Название */}
                      <Typography variant="body2" align="center" sx={{ fontWeight: 600, mb: 0.5, fontSize: 15 }}>{aroma}</Typography>
                      {/* Вся информация внизу карточки */}
                      <Box sx={{ width: '100%', mt: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Stack direction="row" spacing={0.5} sx={{ mb: 0.5 }}>
                          <Chip label={`Качество: ${aromaInfo.quality}`} size="small" color="primary" sx={{ fontSize: 11 }} />
                          <Chip label={`Фабрика: ${aromaInfo.factory}`} size="small" sx={{ fontSize: 11 }} />
                        </Stack>
                        {/* Кастомный слайдер для объёмов */}
                        <Box sx={{ width: '100%', mb: 0.5, px: 0.5 }}>
                          <Box sx={{ position: 'relative', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
                            {/* Насечки (деления) — компактные кликабельные точки с подписями */}
                            <Box sx={{ position: 'absolute', left: 0, right: 0, top: 0, height: 32, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', zIndex: 2 }}>
                              {aromaInfo.volumes.map((v, idx) => (
                                <Box key={v} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', minWidth: 28 }} onClick={() => handleVolumeSlider(aroma, idx)}>
                                  <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: idx === volumeIdx ? 'success.main' : 'grey.700', border: idx === volumeIdx ? '2px solid #fff' : '2px solid #b9fbc0', mb: 0.3, transition: 'background 0.3s, border 0.3s' }} />
                                  <Typography variant="caption" sx={{ color: idx === volumeIdx ? 'success.main' : 'text.secondary', fontWeight: idx === volumeIdx ? 700 : 400, transition: 'color 0.3s', mt: 0.2, fontSize: 11 }}>{v}</Typography>
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
                        </Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {aromaInfo.price}
                        </Typography>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            </Paper>
          </Fade>
        )}
      </Box>
    </Box>
  );
};

export default App;
