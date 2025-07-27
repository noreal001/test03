import React from 'react';
import { Box, Typography, Button, IconButton, useTheme } from '@mui/material';
import { AromaForVolume } from '../types';
import { useVolumeSlider } from '../hooks';
import { VOLUME_RANGE } from '../constants';

interface VolumeSliderProps {
  selectedAromaForVolume: AromaForVolume;
  onCancel: () => void;
  onAddToCart: (aromaName: string, brandName: string, volume: number) => void;
}

export const VolumeSlider: React.FC<VolumeSliderProps> = ({
  selectedAromaForVolume,
  onCancel,
  onAddToCart
}) => {
  const theme = useTheme();
  const {
    volumeSliderValue,
    setVolumeSliderValue,
    knobPosition,
    isDragging,
    startDrag,
    getLineBendAndGlow
  } = useVolumeSlider();

  const handleAddToCart = () => {
    onAddToCart(
      selectedAromaForVolume.aroma.name,
      selectedAromaForVolume.brand,
      volumeSliderValue
    );
  };

  return (
    <Box sx={{
      mt: 4,
      p: 4,
      background: theme.palette.mode === 'dark' 
        ? 'rgba(26, 26, 26, 0.15)'
        : 'rgba(248, 249, 250, 0.15)',
      borderRadius: 3,
      border: theme.palette.mode === 'dark' ? '1px solid rgba(51, 51, 51, 0.2)' : '1px solid rgba(221, 221, 221, 0.2)',
      boxShadow: theme.palette.mode === 'dark'
        ? '0 8px 32px rgba(0, 0, 0, 0.15)'
        : '0 8px 32px rgba(0, 0, 0, 0.03)',
      mx: 2,
      backdropFilter: 'blur(8px)'
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
          onClick={onCancel}
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
      <Box sx={{ position: 'relative', mx: 4, mb: 4 }}>
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
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              {(() => {
                const bendData = getLineBendAndGlow();
                const baseY = 10;
                const bendY = baseY + (bendData.shouldBend ? bendData.bendIntensity : 0);
                
                const baseElements = (
                  <>
                    <line 
                      x1="0%" 
                      y1={baseY} 
                      x2="100%" 
                      y2={baseY}
                      stroke={theme.palette.mode === 'dark' ? '#666' : '#999'}
                      strokeWidth="2"
                    />
                    
                    {/* Эффекты изгиба и свечения поверх основной линии */}
                    {bendData.shouldBend && (
                      <>
                        {/* Изогнутый сегмент с Volt свечением */}
                        <path 
                          d={`M 20% ${baseY} Q 50% ${bendY} 80% ${baseY}`}
                          stroke="#CEFF00"
                          strokeWidth="5"
                          fill="none"
                          filter="url(#greenGlow)"
                          opacity={Math.max(0.8, bendData.glowIntensity)}
                        />
                      </>
                    )}
                  </>
                );
                
                return baseElements;
              })()}
            </svg>
          </Box>
          
          {/* Деления и подписи через 10 */}
          {Array.from({length: 101}, (_, i) => VOLUME_RANGE.MIN + i * 10).filter(v => v <= VOLUME_RANGE.MAX).map((value, index) => {
            const isMainMark = value % 100 === 0 || value === VOLUME_RANGE.MIN || value === VOLUME_RANGE.MAX;
            const isMediumMark = value % 50 === 0;
            
            return (
              <Box key={value} sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                position: 'relative',
                zIndex: 2
              }}>
                {/* Деление */}
                <Box sx={{
                  width: '2px',
                  height: isMainMark ? '20px' : isMediumMark ? '15px' : '10px',
                  background: theme.palette.mode === 'dark' ? '#666' : '#999',
                  mb: 0.5
                }} />
                
                {/* Подпись только для основных меток */}
                {isMainMark && (
                  <Typography sx={{
                    fontSize: '11px',
                    color: theme.palette.mode === 'dark' ? '#999' : '#666',
                    fontWeight: 600,
                    fontFamily: '"Kollektif", sans-serif'
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
              const rect = e.currentTarget.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              
              startDrag(centerX, centerY);
              e.preventDefault();
            }}
            sx={{
              position: 'absolute',
              left: `calc(${Math.max(0, Math.min(100, ((volumeSliderValue - VOLUME_RANGE.MIN) / (VOLUME_RANGE.MAX - VOLUME_RANGE.MIN)) * 100 + (knobPosition.x / 3)))}% - 45px)`,
              top: `calc(50% - 45px + ${knobPosition.y}px)`,
              width: 90,
              height: 90,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #222 0%, #111 50%, #000 100%)',
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
              transition: isDragging ? 'none' : 'all 0.1s ease-out',
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
            
            {/* Темные цифры объема снизу кнопки только при движении */}
            {isDragging && (
              <Box sx={{
                position: 'absolute',
                bottom: '-30px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '20px',
                color: '#333',
                fontWeight: 'bold',
                fontFamily: '"Kollektif", sans-serif',
                userSelect: 'none',
                zIndex: 2
              }}>
                {volumeSliderValue}
              </Box>
            )}
          </Box>

          {/* Скрытый input для базового управления */}
          <input
            type="range"
            min={VOLUME_RANGE.MIN}
            max={VOLUME_RANGE.MAX}
            step={VOLUME_RANGE.STEP}
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
          onClick={onCancel}
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
          onClick={handleAddToCart}
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
  );
}; 