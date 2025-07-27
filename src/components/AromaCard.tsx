import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Aroma, AromaForVolume } from '../types';

interface AromaCardProps {
  aroma: Aroma;
  brandName: string;
  isMobile: boolean;
  selectedAromaForVolume: AromaForVolume | null;
  volumeSliderValue: number;
  getFillPercentage: (volume: number) => number;
  getDarkerFillColor: () => string;
  onCardClick: (aroma: Aroma, brand: string) => void;
}

export const AromaCard: React.FC<AromaCardProps> = ({
  aroma,
  brandName,
  isMobile,
  selectedAromaForVolume,
  volumeSliderValue,
  getFillPercentage,
  getDarkerFillColor,
  onCardClick
}) => {
  const theme = useTheme();

  // Примерные данные для ароматов в стиле FIFA
  const aromaData = {
    rating: aroma.rating || (85 + Math.floor(Math.random() * 10)),
    brand: aroma.brand || brandName || 'AJMAL',
    country: aroma.country || 'ОАЭ',
    flag: aroma.flag || '🇦🇪',
    gender: aroma.gender || 'Унисекс',
    topNotes: aroma.topNotes || 'корица, кардамон, цветок апельсина и бергамот',
    middleNotes: aroma.middleNotes || 'бурбонская ваниль и элеми',
    baseNotes: aroma.baseNotes || 'пралине, мускус, ambroxan, гваяк'
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <Box
        id={`aroma-${aroma.name}`}
        onClick={() => onCardClick(aroma, brandName)}
        sx={{
          width: isMobile ? '100%' : 240,
          maxWidth: isMobile ? 320 : 240,
          height: isMobile ? 360 : 440,
          borderRadius: 4,
          background: 'transparent',
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.3s ease, z-index 0.1s ease',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 4px 20px rgba(0, 0, 0, 0.5)'
            : '0 4px 20px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
          border: theme.palette.mode === 'dark' 
            ? '1px solid #333'
            : '1px solid #ddd',
          mx: isMobile ? 'auto' : 0,
          perspective: '1000px',
          zIndex: 1,
          '&:hover': {
            zIndex: 10,
            transform: isMobile ? 'none' : 'scale(1.02)',
          },
          '&:hover .flip-card-inner': {
            transform: 'rotateY(180deg)'
          },
          // Эффект заполнения снизу вверх для выбранной карточки
          '&::after': selectedAromaForVolume?.aroma.name === aroma.name ? {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: `${getFillPercentage(volumeSliderValue)}%`,
            background: `linear-gradient(to top, ${getDarkerFillColor()} 0%, ${getDarkerFillColor()}CC 30%, ${getDarkerFillColor()}88 60%, ${getDarkerFillColor()}44 85%, transparent 100%)`,
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
            background: `radial-gradient(circle at 0% 20%, transparent 8px, transparent 8px),
                         radial-gradient(circle at 0% 40%, transparent 8px, transparent 8px),
                         radial-gradient(circle at 0% 60%, transparent 8px, transparent 8px),
                         radial-gradient(circle at 0% 80%, transparent 8px, transparent 8px),
                         radial-gradient(circle at 100% 20%, transparent 8px, transparent 8px),
                         radial-gradient(circle at 100% 40%, transparent 8px, transparent 8px),
                         radial-gradient(circle at 100% 60%, transparent 8px, transparent 8px),
                         radial-gradient(circle at 100% 80%, transparent 8px, transparent 8px)`,
            transition: 'background 0.3s ease',
            zIndex: -2,
          }
        }}
      >
        {/* Flip Card Container */}
        <Box 
          className="flip-card-inner"
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transition: 'transform 0.8s ease-in-out',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Передняя сторона */}
          <Box sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
          }}>
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

          {/* Задняя сторона - описание */}
          <Box sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            background: 'transparent',
            borderRadius: 4,
            border: theme.palette.mode === 'dark' ? '2px solid #444' : '2px solid #ccc',
            transform: 'rotateY(180deg)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            padding: 2,
            overflowY: 'auto',
            overflowX: 'hidden',
            boxSizing: 'border-box',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 30px rgba(0, 0, 0, 0.7)'
              : '0 8px 30px rgba(0, 0, 0, 0.2)',
            // Скрываем scrollbar
            '&::-webkit-scrollbar': {
              width: '4px'
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              borderRadius: '2px'
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
            }
          }}>
            {/* Название аромата */}
            <Typography sx={{
              fontSize: '16px',
              fontWeight: 900,
              color: theme.palette.mode === 'dark' ? '#fff' : '#000',
              fontFamily: '"Kollektif", sans-serif',
              mb: 1.5,
              textAlign: 'center',
              lineHeight: 1.2,
              width: '100%',
              maxWidth: '100%'
            }}>
              {aroma.name}
            </Typography>

            {/* Детальная информация */}
            <Typography sx={{
              fontSize: '12px',
              color: theme.palette.mode === 'dark' ? '#ccc' : '#666',
              fontFamily: '"Kollektif", sans-serif',
              mb: 0.8,
              opacity: 0.9,
              textAlign: 'left',
              lineHeight: 1.2,
              width: '100%',
              maxWidth: '100%'
            }}>
              <strong>🏷️ Бренд:</strong> {aromaData.brand}
            </Typography>

            <Typography sx={{
              fontSize: '12px',
              color: theme.palette.mode === 'dark' ? '#ccc' : '#666',
              fontFamily: '"Kollektif", sans-serif',
              mb: 0.8,
              opacity: 0.9,
              textAlign: 'left',
              lineHeight: 1.2,
              width: '100%',
              maxWidth: '100%'
            }}>
              <strong>🌍 Страна:</strong> {aromaData.country} {aromaData.flag}
            </Typography>

            <Typography sx={{
              fontSize: '12px',
              color: theme.palette.mode === 'dark' ? '#ccc' : '#666',
              fontFamily: '"Kollektif", sans-serif',
              mb: 0.8,
              opacity: 0.9,
              textAlign: 'left',
              lineHeight: 1.2,
              width: '100%',
              maxWidth: '100%'
            }}>
              <strong>👤 Пол:</strong> {aromaData.gender}
            </Typography>

            <Typography sx={{
              fontSize: '12px',
              color: theme.palette.mode === 'dark' ? '#ccc' : '#666',
              fontFamily: '"Kollektif", sans-serif',
              mb: 0.8,
              opacity: 0.9,
              textAlign: 'left',
              lineHeight: 1.2,
              width: '100%',
              maxWidth: '100%'
            }}>
              <strong>⭐ Рейтинг:</strong> {aromaData.rating}/5
            </Typography>

            <Typography sx={{
              fontSize: '10px',
              color: theme.palette.mode === 'dark' ? '#ccc' : '#666',
              fontFamily: '"Kollektif", sans-serif',
              mt: 0.8,
              opacity: 0.8,
              lineHeight: 1.2,
              textAlign: 'left',
              width: '100%',
              maxWidth: '100%'
            }}>
              <strong>🌸 Верхние:</strong> {aromaData.topNotes}
            </Typography>

            <Typography sx={{
              fontSize: '10px',
              color: theme.palette.mode === 'dark' ? '#ccc' : '#666',
              fontFamily: '"Kollektif", sans-serif',
              mt: 0.5,
              opacity: 0.8,
              lineHeight: 1.2,
              textAlign: 'left',
              width: '100%',
              maxWidth: '100%'
            }}>
              <strong>💖 Средние:</strong> {aromaData.middleNotes}
            </Typography>

            <Typography sx={{
              fontSize: '10px',
              color: theme.palette.mode === 'dark' ? '#ccc' : '#666',
              fontFamily: '"Kollektif", sans-serif',
              mt: 0.5,
              mb: 0.8,
              opacity: 0.8,
              lineHeight: 1.2,
              textAlign: 'left',
              width: '100%',
              maxWidth: '100%'
            }}>
              <strong>🌿 Базовые:</strong> {aromaData.baseNotes}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Полное название под карточкой */}
      <Typography sx={{
        mt: isMobile ? 1.5 : 2,
        fontSize: isMobile ? '12px' : '14px',
        fontWeight: 600,
        color: theme.palette.mode === 'dark' ? '#fff' : '#000',
        fontFamily: '"Kollektif", sans-serif',
        textAlign: 'center',
        lineHeight: 1.3,
        maxWidth: isMobile ? 320 : 240,
        wordBreak: 'break-word',
        px: isMobile ? 1 : 0
      }}>
        {aroma.name}
      </Typography>
    </Box>
  );
}; 