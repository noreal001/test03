import React from 'react';
import { 
  Box, 
  List, 
  ListItemButton, 
  ListItemText, 
  Typography, 
  Paper, 
  IconButton,
  useTheme,

} from '@mui/material';
import { 
  MenuOpen, 
  Menu, 
  Search, 
  Person, 
  ShoppingCart 
} from '@mui/icons-material';
import { Brand } from '../types';

interface BrandsMenuProps {
  brands: Brand[];
  selectedIndex: number | null;
  brandsMenuOpen: boolean;
  search: string;
  cartItemsCount: number;
  cartFlash: boolean;
  themeMode: 'light' | 'dark';
  isMobile: boolean;
  onBrandClick: (index: number) => void;
  onToggleBrandsMenu: () => void;
  onSearchClick: () => void;
  onProfileClick: () => void;
  onCartClick: () => void;
  onThemeToggle: () => void;
}

export const BrandsMenu: React.FC<BrandsMenuProps> = React.memo(({
  brands,
  selectedIndex,
  brandsMenuOpen,
  search,
  cartItemsCount,
  cartFlash,
  themeMode,
  isMobile,
  onBrandClick,
  onToggleBrandsMenu,
  onSearchClick,
  onProfileClick,
  onCartClick,
  onThemeToggle
}) => {
  const theme = useTheme();

  // Мобильное меню сверху
  if (isMobile) {
    return (
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
        <IconButton onClick={onToggleBrandsMenu}>
          <MenuOpen />
        </IconButton>
        <IconButton onClick={onSearchClick}>
          <Search />
        </IconButton>
        <IconButton onClick={onProfileClick}>
          <Person sx={{ fontSize: 28 }} />
        </IconButton>
        <IconButton
          sx={{
            position: 'relative',
            bgcolor: cartFlash ? 'rgba(0, 255, 0, 0.2)' : 'transparent',
            transition: 'background-color 0.3s ease-in-out'
          }}
          onClick={onCartClick}
        >
          <ShoppingCart sx={{ fontSize: 28 }} />
          {cartItemsCount > 0 && (
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
              {cartItemsCount}
            </Box>
          )}
        </IconButton>
      </Box>
    );
  }

  // Свернутое меню (только иконки)
  if (!brandsMenuOpen) {
    return (
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
        <IconButton onClick={onToggleBrandsMenu} sx={{ mb: 1 }}>
          <Menu />
        </IconButton>
        <IconButton onClick={onSearchClick} sx={{ mb: 1 }}>
          <Search />
        </IconButton>
        <IconButton onClick={onProfileClick} sx={{ mb: 1 }}>
          <Person sx={{ fontSize: 28 }} />
        </IconButton>
        <IconButton
          sx={{
            position: 'relative',
            bgcolor: cartFlash ? 'rgba(0, 255, 0, 0.2)' : 'transparent',
            transition: 'background-color 0.3s ease-in-out',
            mb: 1
          }}
          onClick={onCartClick}
        >
          <ShoppingCart sx={{ fontSize: 28 }} />
          {cartItemsCount > 0 && (
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
              {cartItemsCount}
            </Box>
          )}
        </IconButton>
      </Box>
    );
  }

  // Полное меню с брендами
  return (
    <Paper elevation={0} sx={{
      width: 340,
      minWidth: 340,
      maxWidth: 340,
      bgcolor: 'background.paper',
      p: 2,
      pr: 2,
      pb: 0,
      mr: 0,
      mb: 0,
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
        <IconButton onClick={onToggleBrandsMenu} sx={{ mr: 1 }}>
          <MenuOpen />
        </IconButton>
        <IconButton onClick={onSearchClick} sx={{ mb: 1, ml: 1 }}>
          <Search />
        </IconButton>
        <IconButton onClick={onProfileClick} sx={{ mb: 1, ml: 1 }}>
          <Person sx={{ fontSize: 28 }} />
        </IconButton>
        <IconButton
          sx={{
            position: 'relative',
            bgcolor: cartFlash ? 'rgba(0, 255, 0, 0.2)' : 'transparent',
            transition: 'background-color 0.3s ease-in-out',
            ml: 2
          }}
          onClick={onCartClick}
        >
          <ShoppingCart sx={{ fontSize: 28 }} />
          {cartItemsCount > 0 && (
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
              {cartItemsCount}
            </Box>
          )}
        </IconButton>
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
        {brands
          .filter(brand => brand?.name?.toLowerCase().includes(search.toLowerCase()))
          .map((brand, index) => {
            const originalIndex = brands.findIndex(b => b.name === brand.name);
            return (
              <ListItemButton
                key={brand.name}
                selected={selectedIndex === originalIndex}
                onClick={() => onBrandClick(originalIndex)}
                sx={{ 
                  mb: 0.5, 
                  borderRadius: 1,
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                <ListItemText 
                  primary={brand.name}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '14px',
                      fontFamily: '"Kollektif", sans-serif',
                      fontWeight: selectedIndex === originalIndex ? 600 : 400
                    }
                  }}
                />
              </ListItemButton>
            );
          })}
      </List>
    </Paper>
  );
}); 