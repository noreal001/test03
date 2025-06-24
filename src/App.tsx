import React, { useState } from 'react';
import { Box, List, ListItemButton, ListItemText, Typography, Paper, Fade, Divider, IconButton, TextField, InputAdornment, Chip, Stack, Avatar, useMediaQuery, useTheme, Slider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';

// Загрузка брендов и ароматов из файлов (сгенерировано автоматически)
type Brand = { name: string; aromas: string[] };
const brands: Brand[] = [
  { name: 'ABDUL SAMAD AL-QURASHI', aromas: ['SAFARI EXTREME'] },
  { name: 'AFNAN', aromas: ['9PM', 'TRIBUTE BLUE'] },
  { name: 'AJMAL', aromas: ['AMBER WOOD', 'ARISTOCRAT', 'AURUM', 'MYSTERY'] },
  { name: 'AL-REHAB', aromas: ['DALAL'] },
  { name: 'ALEXANDRE J.', aromas: ['IRIS VIOLET', 'MANDARINE SULTANE', 'MORNING MUSCS', 'THE COLLECTOR BLACK MUSCS'] },
  { name: 'ALFRED DUNHILL', aromas: ['AGAR WOOD', 'DESIRE BLUE', 'DESIRE GOLD EAU DE TOILETTE'] },
  { name: 'AMOUAGE', aromas: ['ENCLAVE', 'GUIDANCE', 'INTERLUDE BLACK IRIS', 'LOVE TUBEROUSE', 'MEANDER', 'REFLECTION MAN', 'REFLECTION WOMAN'] },
  { name: 'ANNA SUI', aromas: ['FANTASIA (BLACK FLEUR)', 'LUCKY WISH (SOBLAZN)'] },
  { name: 'ANTONIO BANDERAS', aromas: ['BLUE SEDUCTION'] },
  { name: 'ARABIAN OUD', aromas: ['ARABIAN KNIGHT', 'MADAWI GOLD'] },
  { name: 'ARIANA GRANDE', aromas: ['MOD BLUSH'] },
  { name: 'ARMAND BASI', aromas: ['IN BLUE', 'IN RED'] },
  { name: 'ATKINSONS', aromas: ['OUD SAVE THE KING'] },
  { name: 'ATTAR COLLECTION', aromas: ['AL-RAYHAN', 'AZORA', 'CRYSTAL LOVE FOR HER', 'CRYSTAL LOVE FOR HIM', 'HAYATI', 'KHALTAT NIGHT', 'MUSC CASHMIR'] },
  { name: 'AVON', aromas: ['TODAY'] },
  { name: 'AZZARO', aromas: ['CHROME'] },
  { name: 'BATH & BODY WORKS', aromas: ['BAHAMAS PASSIONFRUIT & BANANA FLOWER', 'WHISKEY RESERVE COLOGNE'] },
  { name: 'BDK PARFUMS', aromas: ['TABAC ROSE'] },
  { name: 'BENETTON', aromas: ['WE ARE TRIBE'] },
  { name: 'BEYONCÉ', aromas: ['CÉ NOIR'] },
  { name: 'BOADICEA THE VICTORIOUS', aromas: ['ANGELIC', 'AURICA', 'HANUMAN', 'HEROINE'] },
  { name: 'BOND NO 9', aromas: ['LAFAYETTE STREET', 'NOMAD EAU DE PARFUM'] },
  { name: 'BOUCHERON', aromas: ["ROSE D'ISPARTA"] },
  { name: 'BURBERRY', aromas: ['HERO', 'LONDON MAN', 'LONDON WOMAN', 'MY BURBERRY', 'TUDOR ROSE', 'WEEKEND'] },
  { name: 'BVLGARI', aromas: ['AQVA POUR HOMME', 'JASMINE NOIR', 'LE GEMME ASTREA', 'LE GEMME AZARAN', 'LE GEMME TYGAR', 'OMNIA', 'OMNIA CRYSTALLINE', 'THE NOIR'] },
  { name: 'BY KILIAN', aromas: ['ANGELS SHARE', 'BAD BOYS ARE NOT GOOD BUT GOOD', 'BLACK PHANTOM MEMENTO MORI', 'GOOD GIRL GONE BAD', 'GOOD GIRL GONE BAD EXTREME', 'INTOXICATED', 'KILLING ME SLOWLY', "L'HEURE VERTE", 'LOVE BY KILIAN', 'OLD FASHIONED', 'PLAYING WITH DEVIL', 'ROLLING IN LOVE', 'ROSES ON ICE', 'STRAIGHT TO HEAVEN: WHITE CRISTAL', 'TO BE A PRINCESS', 'VODKA ON THE ROCKS'] },
  { name: 'BYREDO', aromas: ["BAL D'AFRIQUE", 'BIBLIOTEQUE', 'BLANCHE', 'DE LOS SANTOS', 'GYPSY WATER', 'LA TULIPE', 'MARIJUANA', 'MOJAVE GOST', 'SUPER CEDR', 'YONG ROSE'] },
  { name: 'CACHAREL', aromas: ['AMOR AMOR'] },
  { name: 'CALVIN KLEIN', aromas: ['EUPHORIA MAN', 'EUPHORIA WOMAN'] },
  { name: 'CANALI', aromas: ['DAL 1934'] },
  { name: 'CAROLINA HERRERA', aromas: ['212 MAN', '212 VIP MAN', '212 VIP ROSE', '212 VIP WOMAN', 'BAD BOY', 'CH', 'CHIC MAN', 'CHIC WOMAN', 'GOOD GIRL', 'GOOD GIRL BLUSH', 'GOOD GIRL SUPREME', 'MAD WORLD'] },
  { name: 'CARTIER', aromas: ['LA PANTHERE'] },
  { name: 'CERRUTI', aromas: ['1881 CERRUTI'] },
  { name: 'CHANEL', aromas: ['ALLURE HOMME SPORT', 'ALLURE SENSUELLE', 'BLEU DE CHANEL', 'CHANCE', 'CHANCE EAU FRAICHE', 'CHANCE EAU TENDRE', 'CHANCE EAU TENDRE EAU DE PARFUM', 'COCO MADEMOISELLE', 'EGOIST', 'EGOIST PLATINIUM', 'GABRIELLE', 'LE LION DE', 'N5', "NO 1 DE CHANEL L'EAU ROUGE", 'NO.19'] },
  { name: 'CHLOE', aromas: ['CHLOE EAU DE PARFUM', 'LOVE STORY', 'NOMADE'] },
  { name: 'CHOPARD', aromas: ['CEDAR MALAKI'] },
  { name: 'CHOPARD VETIVER', aromas: ["D'HAITI AU THE VERT"] },
  { name: 'CHRISTIAN LOUBOTIN', aromas: ['LOUBIMAR LEGERE'] },
  { name: 'CLINIQUE', aromas: ['HAPPY'] },
  { name: 'CLIVE CHRISTIAN', aromas: ['1872', 'MATSUKITA', 'N1 EXCLUSIVE'] },
  { name: 'CREED', aromas: ['AVENTUS', 'AVENTUS COLOGNE', 'QUEEN OF SILK', 'SILVER MOUNTAIN', 'VIKING', 'VIKING COLONGE'] },
  { name: 'DAVIDOFF', aromas: ['COOL WATER'] },
  { name: 'DIOR', aromas: ['ADDICT', 'AMBRE NUIT', 'DUNE', 'FAHRENHEIT', 'FOREVER AND EVER', 'GRIS DIOR', 'HOMME COLOGNE', 'HOMME SPORT'] },
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', p: isMobile ? 0 : 2 }}>
        {/* Меню брендов слева */}
        {brandsMenuOpen && (
          <Paper elevation={3} sx={{ width: { xs: '100%', sm: 220, md: 280 }, minWidth: isMobile ? '100%' : 220, bgcolor: 'background.paper', p: 2, mr: isMobile ? 0 : 2, mb: isMobile ? 2 : 0, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', position: 'relative', height: isMobile ? 'auto' : '100vh', justifyContent: 'space-between' }}>
            <Box sx={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <IconButton onClick={handleToggleBrandsMenu} sx={{ position: 'absolute', top: 8, left: 8 }}>
                <MenuOpenIcon />
              </IconButton>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
                Бренды
              </Typography>
              <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: isMobile ? '50vh' : '70vh', width: '100%', pr: 1 }} id="brands-list-scroll">
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
              {/* Кнопка прокрутки вниз */}
              <Box sx={{ width: '100%', position: 'sticky', bottom: 0, zIndex: 10, bgcolor: 'background.paper', pt: 1, pb: 1, display: 'flex', justifyContent: 'center' }}>
                <IconButton onClick={() => {
                  const el = document.getElementById('brands-list-scroll');
                  if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
                }}>
                  <MenuOpenIcon />
                </IconButton>
              </Box>
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
      {/* Footer */}
      <Box component="footer" sx={{ width: '100%', bgcolor: 'grey.900', color: 'grey.200', py: 2, px: 2, mt: 'auto', textAlign: 'center', fontSize: 15, letterSpacing: 1, borderTop: '1px solid #222', boxShadow: '0 -2px 8px 0 rgba(0,0,0,0.12)' }}>
        © {new Date().getFullYear()} Brands & Aromas. Все права защищены.
      </Box>
    </Box>
  );
};

export default App;
