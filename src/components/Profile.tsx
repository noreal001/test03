import React from 'react';
import { 
  Box, 
  List, 
  ListItemButton, 
  Typography, 
  Paper, 
  IconButton,
  Button,
  useTheme
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { User, Order, ProfileTab } from '../types';
import { formatPrice } from '../utils';

interface ProfileProps {
  user: User;
  profileTab: ProfileTab;
  isVisible: boolean;
  isMobile: boolean;
  onClose: () => void;
  onTabChange: (tab: ProfileTab) => void;
  onOrderDetails: (order: Order) => void;
  onRepeatOrder: (order: Order) => void;
}

export const Profile: React.FC<ProfileProps> = React.memo(({
  user,
  profileTab,
  isVisible,
  isMobile,
  onClose,
  onTabChange,
  onOrderDetails,
  onRepeatOrder
}) => {
  const theme = useTheme();

  if (!isVisible) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: isMobile ? 0 : 66,
        bgcolor: 'background.default',
        color: 'text.primary',
        p: isMobile ? 2 : 3,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: isMobile ? '100vw' : 'calc(100vw - 66px)',
        borderRadius: 0,
        boxShadow: 'none',
        zIndex: 10,
        overflowX: 'hidden'
      }}
    >
      {/* Заголовок */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 2
      }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Профиль
        </Typography>
        <IconButton 
          onClick={onClose} 
          sx={{ 
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
        >
          <Close />
        </IconButton>
      </Box>

      {/* Основной контент */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'flex-start', 
        height: '100%',
        gap: isMobile ? 2 : 0
      }}>
        {/* Боковое меню вкладок */}
        <Box sx={{ 
          width: isMobile ? '100%' : 200, 
          borderRight: isMobile ? 'none' : `1px solid ${theme.palette.divider}`,
          borderBottom: isMobile ? `1px solid ${theme.palette.divider}` : 'none',
          display: 'flex', 
          flexDirection: isMobile ? 'row' : 'column',
          py: isMobile ? 1 : 2,
          pr: isMobile ? 0 : 2
        }}>
          <List disablePadding sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'row' : 'column',
            width: '100%',
            gap: isMobile ? 1 : 0
          }}>
            <ListItemButton 
              selected={profileTab === 'data'} 
              onClick={() => onTabChange('data')} 
              sx={{ 
                px: 2, 
                py: 1.5,
                borderRadius: 1,
                flex: isMobile ? 1 : 'none',
                justifyContent: 'center',
                '&.Mui-selected': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <Typography sx={{
                fontFamily: '"Kollektif", sans-serif',
                fontWeight: profileTab === 'data' ? 600 : 400,
                fontSize: isMobile ? '14px' : '16px'
              }}>
                Данные
              </Typography>
            </ListItemButton>
            <ListItemButton 
              selected={profileTab === 'orders'} 
              onClick={() => onTabChange('orders')} 
              sx={{ 
                px: 2, 
                py: 1.5,
                borderRadius: 1,
                flex: isMobile ? 1 : 'none',
                justifyContent: 'center',
                '&.Mui-selected': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <Typography sx={{
                fontFamily: '"Kollektif", sans-serif',
                fontWeight: profileTab === 'orders' ? 600 : 400,
                fontSize: isMobile ? '14px' : '16px'
              }}>
                Заказы {user.orders.length > 0 && `(${user.orders.length})`}
              </Typography>
            </ListItemButton>
          </List>
        </Box>
        
        {/* Контент вкладок */}
        <Box sx={{ 
          flex: 1, 
          p: isMobile ? 2 : 3,
          overflowY: 'auto',
          maxHeight: isMobile ? 'calc(100vh - 200px)' : '100%'
        }}>
          {profileTab === 'data' && (
            <Box>
              <Typography variant="h6" sx={{ 
                mb: 3, 
                fontWeight: 'bold',
                textAlign: isMobile ? 'center' : 'left'
              }}>
                Личные данные
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2, 
                maxWidth: isMobile ? '100%' : 500
              }}>
                {/* Имя */}
                <Box sx={{ 
                  p: isMobile ? 2 : 3, 
                  border: `1px solid ${theme.palette.divider}`, 
                  borderRadius: 2,
                  bgcolor: 'background.paper'
                }}>
                  <Typography variant="subtitle2" sx={{ 
                    color: 'text.secondary', 
                    fontSize: '12px', 
                    mb: 0.5,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}>
                    Имя
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontWeight: 'medium',
                    fontFamily: '"Kollektif", sans-serif',
                    fontSize: isMobile ? '16px' : '18px'
                  }}>
                    {user.name || 'Не указано'}
                  </Typography>
                </Box>
                
                {/* Телефон */}
                <Box sx={{ 
                  p: isMobile ? 2 : 3, 
                  border: `1px solid ${theme.palette.divider}`, 
                  borderRadius: 2,
                  bgcolor: 'background.paper'
                }}>
                  <Typography variant="subtitle2" sx={{ 
                    color: 'text.secondary', 
                    fontSize: '12px', 
                    mb: 0.5,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}>
                    Телефон
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontWeight: 'medium',
                    fontFamily: '"Kollektif", sans-serif',
                    fontSize: isMobile ? '16px' : '18px'
                  }}>
                    {user.phone ? `+7 ${user.phone}` : 'Не указан'}
                  </Typography>
                </Box>
                
                {/* Инвайт-код */}
                <Box sx={{ 
                  p: isMobile ? 2 : 3, 
                  border: `1px solid ${theme.palette.divider}`, 
                  borderRadius: 2,
                  bgcolor: 'background.paper'
                }}>
                  <Typography variant="subtitle2" sx={{ 
                    color: 'text.secondary', 
                    fontSize: '12px', 
                    mb: 0.5,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}>
                    Инвайт-код
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontWeight: 'medium',
                    fontFamily: '"Kollektif", sans-serif',
                    fontSize: isMobile ? '16px' : '18px'
                  }}>
                    {user.inviteCode || 'Не указан'}
                  </Typography>
                </Box>
                
                {/* Адрес доставки */}
                <Box sx={{ 
                  p: isMobile ? 2 : 3, 
                  border: `1px solid ${theme.palette.divider}`, 
                  borderRadius: 2,
                  bgcolor: 'background.paper'
                }}>
                  <Typography variant="subtitle2" sx={{ 
                    color: 'text.secondary', 
                    fontSize: '12px', 
                    mb: 0.5,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}>
                    Адрес доставки
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontWeight: 'medium',
                    fontFamily: '"Kollektif", sans-serif',
                    fontSize: isMobile ? '16px' : '18px',
                    lineHeight: 1.4
                  }}>
                    {user.address || 'Не указан'}
                  </Typography>
                </Box>
                
                {/* Дата регистрации */}
                <Box sx={{ 
                  p: isMobile ? 2 : 3, 
                  border: `1px solid ${theme.palette.divider}`, 
                  borderRadius: 2,
                  bgcolor: 'background.paper'
                }}>
                  <Typography variant="subtitle2" sx={{ 
                    color: 'text.secondary', 
                    fontSize: '12px', 
                    mb: 0.5,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}>
                    Дата регистрации
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontWeight: 'medium',
                    fontFamily: '"Kollektif", sans-serif',
                    fontSize: isMobile ? '16px' : '18px'
                  }}>
                    {localStorage.getItem('lastRegistrationTime') 
                      ? new Date(parseInt(localStorage.getItem('lastRegistrationTime')!)).toLocaleDateString('ru-RU') 
                      : 'Не зарегистрирован'}
                  </Typography>
                </Box>
                
                {/* Баланс */}
                <Box sx={{ 
                  p: isMobile ? 2 : 3, 
                  border: `2px solid ${theme.palette.primary.main}`, 
                  borderRadius: 2,
                  bgcolor: 'background.paper'
                }}>
                  <Typography variant="subtitle2" sx={{ 
                    color: 'text.secondary', 
                    fontSize: '12px', 
                    mb: 0.5,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}>
                    Баланс
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontWeight: 'bold', 
                    color: 'primary.main',
                    fontFamily: '"Kollektif", sans-serif',
                    fontSize: isMobile ? '18px' : '20px'
                  }}>
                    {user.balance}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
          
          {profileTab === 'orders' && (
            <Box>
              <Typography variant="h6" sx={{ 
                mb: 3, 
                fontWeight: 'bold',
                textAlign: isMobile ? 'center' : 'left'
              }}>
                История заказов
              </Typography>
              
              {user.orders.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center',
                  py: 6
                }}>
                  <Typography variant="h6" sx={{ 
                    color: 'text.secondary',
                    fontWeight: 'normal',
                    mb: 1
                  }}>
                    У вас пока нет заказов
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: 'text.disabled'
                  }}>
                    Оформите первый заказ в каталоге ароматов
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 2
                }}>
                  {user.orders.map((order, index) => (
                    <Box 
                      key={order.id}
                      sx={{
                        p: isMobile ? 2 : 3,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        '&:hover': {
                          bgcolor: 'action.hover',
                          cursor: 'pointer'
                        }
                      }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'space-between', 
                        alignItems: isMobile ? 'flex-start' : 'center', 
                        mb: 2,
                        gap: isMobile ? 1 : 0
                      }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 'bold',
                          fontFamily: '"Kollektif", sans-serif',
                          fontSize: isMobile ? '16px' : '18px'
                        }}>
                          Заказ №{index + 1}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: 'text.secondary',
                          fontSize: isMobile ? '12px' : '14px'
                        }}>
                          {order.date}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'space-between',
                        alignItems: isMobile ? 'flex-start' : 'center',
                        mb: 2,
                        gap: isMobile ? 1 : 0
                      }}>
                        <Typography variant="body2" sx={{ 
                          color: 'text.secondary',
                          fontSize: isMobile ? '14px' : '16px'
                        }}>
                          Товаров: {order.items.length}
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          fontWeight: 'bold', 
                          color: 'primary.main',
                          fontFamily: '"Kollektif", sans-serif',
                          fontSize: isMobile ? '16px' : '18px'
                        }}>
                          {formatPrice(order.total)} ₽
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? 1 : 2
                      }}>
                        <Button
                          size="small"
                          variant="outlined"
                          fullWidth={isMobile}
                          onClick={() => onOrderDetails(order)}
                          sx={{
                            fontSize: isMobile ? '14px' : '12px',
                            py: isMobile ? 1 : 0.5
                          }}
                        >
                          Подробнее
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          fullWidth={isMobile}
                          onClick={() => onRepeatOrder(order)}
                          sx={{
                            fontSize: isMobile ? '14px' : '12px',
                            py: isMobile ? 1 : 0.5
                          }}
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
        </Box>
      </Box>
    </Paper>
  );
}); 