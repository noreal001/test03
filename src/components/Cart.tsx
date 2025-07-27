import React from 'react';
import { 
  Box, 
  List, 
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography, 
  Paper, 
  IconButton, 
  TextField,
  Avatar, 
  Button,
  useTheme
} from '@mui/material';
import { 
  Close, 
  LocalFlorist
} from '@mui/icons-material';
import { CartItem, CheckoutStep } from '../types';
import { formatPrice } from '../utils';

interface CartProps {
  cart: CartItem[];
  checkoutStep: CheckoutStep;
  userAddress: string;
  userPhone: string;
  isVisible: boolean;
  isMobile: boolean;
  onClose: () => void;
  onRemoveItem: (index: number) => void;
  onCheckout: () => void;
  onBackToCart: () => void;
  onSendOrderDetails: () => void;
  onPaymentComplete: () => void;
  onUpdateAddress: (address: string) => void;
  onUpdatePhone: (phone: string) => void;
}

export const Cart: React.FC<CartProps> = React.memo(({
  cart,
  checkoutStep,
  userAddress,
  userPhone,
  isVisible,
  isMobile,
  onClose,
  onRemoveItem,
  onCheckout,
  onBackToCart,
  onSendOrderDetails,
  onPaymentComplete,
  onUpdateAddress,
  onUpdatePhone
}) => {
  const theme = useTheme();

  if (!isVisible) return null;

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: isMobile ? 0 : 66, // Учитываем меню слева
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
        overflowX: 'hidden',
        overflowY: 'auto'
      }}
    >
      {/* Заголовок с кнопкой закрытия */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 2,
        position: 'sticky',
        top: 0,
        bgcolor: 'background.default',
        zIndex: 1,
        pb: 1
      }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {checkoutStep === null ? 'Корзина' : 
           checkoutStep === 'form' ? 'Оформление заказа' :
           checkoutStep === 'payment' ? 'Оплата' : 'Детали заказа'}
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
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {checkoutStep === null && (
          <Box>
            {cart.length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '50vh',
                textAlign: 'center'
              }}>
                <LocalFlorist sx={{ 
                  fontSize: 80, 
                  color: 'text.disabled',
                  mb: 2
                }} />
                <Typography variant="h6" sx={{ 
                  color: 'text.secondary',
                  fontWeight: 'normal',
                  fontSize: '18px'
                }}>
                  Ваша корзина пуста
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'text.disabled',
                  mt: 1,
                  maxWidth: 300
                }}>
                  Добавьте ароматы, которые вам понравились
                </Typography>
              </Box>
            ) : (
              <>
                <List sx={{ 
                  width: '100%',
                  '& .MuiListItem-root': {
                    borderRadius: 2,
                    mb: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: 'background.paper'
                  }
                }}>
                  {cart.map((item, index) => (
                    <ListItem 
                      key={`${item.brand}-${item.aroma}-${index}`}
                      sx={{
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'flex-start' : 'center',
                        p: 2
                      }}
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          aria-label="delete" 
                          onClick={() => onRemoveItem(index)}
                          sx={{
                            color: 'error.main',
                            '&:hover': {
                              bgcolor: 'error.light',
                              color: 'error.contrastText'
                            }
                          }}
                        >
                          <Close />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: 'primary.main',
                          width: isMobile ? 40 : 48,
                          height: isMobile ? 40 : 48
                        }}>
                          <LocalFlorist />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography sx={{
                            fontWeight: 600,
                            fontSize: isMobile ? '14px' : '16px',
                            fontFamily: '"Kollektif", sans-serif'
                          }}>
                            {item.brand} - {item.aroma}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: isMobile ? 'column' : 'row',
                            gap: isMobile ? 0.5 : 2,
                            mt: 0.5
                          }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {item.volume}
                            </Typography>
                            <Typography variant="body1" sx={{ 
                              fontWeight: 'bold',
                              color: 'primary.main',
                              fontSize: isMobile ? '16px' : '18px'
                            }}>
                              {formatPrice(item.price)} ₽
                            </Typography>
                          </Box>
                        }
                        sx={{ 
                          cursor: 'pointer',
                          mr: isMobile ? 0 : 6 // Место для кнопки удаления
                        }}
                      />
                    </ListItem>
                  ))}
                </List>

                {/* Итого */}
                <Box sx={{ 
                  mt: 3, 
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  border: `2px solid ${theme.palette.primary.main}`
                }}>
                  <Typography variant="h6" sx={{ 
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: 'primary.main',
                    fontSize: isMobile ? '20px' : '24px'
                  }}>
                    Итого: {formatPrice(total)} ₽
                  </Typography>
                </Box>

                {/* Кнопка оформления */}
                <Button 
                  variant="contained" 
                  fullWidth
                  size={isMobile ? 'large' : 'large'}
                  onClick={onCheckout}
                  sx={{
                    mt: 3,
                    py: isMobile ? 2 : 1.5,
                    fontSize: isMobile ? '16px' : '18px',
                    fontWeight: 700,
                    background: theme.palette.mode === 'dark' 
                      ? 'linear-gradient(135deg, #333 0%, #1a1a1a 100%)'
                      : 'linear-gradient(135deg, #000 0%, #333 100%)',
                    '&:hover': {
                      background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, #444 0%, #222 100%)'
                        : 'linear-gradient(135deg, #111 0%, #444 100%)'
                    }
                  }}
                >
                  Перейти к оформлению
                </Button>
              </>
            )}
          </Box>
        )}

        {checkoutStep === 'form' && (
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
              Данные для доставки
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Адрес доставки"
                fullWidth
                multiline
                rows={2}
                value={userAddress}
                onChange={(e) => onUpdateAddress(e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
              
              <TextField
                label="Контактный телефон"
                fullWidth
                value={userPhone}
                onChange={(e) => onUpdatePhone(e.target.value)}
                variant="outlined"
                placeholder="+7 (999) 123-45-67"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />

              {/* Сводка заказа */}
              <Box sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: `1px solid ${theme.palette.divider}`
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Ваш заказ:
                </Typography>
                {cart.map((item, index) => (
                  <Box key={index} sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    py: 0.5
                  }}>
                    <Typography variant="body2">
                      {item.brand} - {item.aroma} ({item.volume})
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatPrice(item.price)} ₽
                    </Typography>
                  </Box>
                ))}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  pt: 1,
                  mt: 1,
                  borderTop: `1px solid ${theme.palette.divider}`
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Итого:
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {formatPrice(total)} ₽
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              gap: 2,
              mt: 4
            }}>
              <Button 
                variant="outlined" 
                fullWidth={isMobile}
                onClick={onBackToCart}
                sx={{
                  py: 1.5,
                  fontSize: '16px'
                }}
              >
                Назад в корзину
              </Button>
              <Button 
                variant="contained" 
                fullWidth={isMobile}
                onClick={onSendOrderDetails}
                disabled={!userAddress.trim() || !userPhone.trim()}
                sx={{
                  py: 1.5,
                  fontSize: '16px',
                  fontWeight: 600
                }}
              >
                Продолжить
              </Button>
            </Box>
          </Box>
        )}

        {checkoutStep === 'payment' && (
          <Box sx={{ maxWidth: 500, mx: 'auto', textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 4 }}>
              Способ оплаты
            </Typography>
            
            <Box sx={{ 
              p: 4, 
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: `1px solid ${theme.palette.divider}`,
              mb: 4
            }}>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Сумма к оплате: <strong>{formatPrice(total)} ₽</strong>
              </Typography>
              
              <Typography variant="body2" sx={{ 
                color: 'text.secondary',
                mb: 3,
                lineHeight: 1.6
              }}>
                В данной демо-версии оплата происходит мгновенно. 
                В реальном приложении здесь будет интеграция с платежными системами.
              </Typography>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              gap: 2
            }}>
              <Button 
                variant="outlined" 
                fullWidth={isMobile}
                onClick={() => onBackToCart()}
                sx={{
                  py: 1.5,
                  fontSize: '16px'
                }}
              >
                Назад
              </Button>
              <Button 
                variant="contained" 
                fullWidth={isMobile}
                onClick={onPaymentComplete}
                sx={{
                  py: 1.5,
                  fontSize: '16px',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #66bb6a 0%, #388e3c 100%)'
                  }
                }}
              >
                Оплатить {formatPrice(total)} ₽
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
}); 