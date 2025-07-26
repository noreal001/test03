import React, { useState, useRef, useCallback } from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface Slider3DProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  label?: string;
  suffix?: string;
}

const Slider3D: React.FC<Slider3DProps> = ({
  value,
  min,
  max,
  step,
  onChange,
  label,
  suffix = ''
}) => {
  const theme = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const percentage = ((value - min) / (max - min)) * 100;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const newValue = min + (percentage / 100) * (max - min);
    const steppedValue = Math.round(newValue / step) * step;
    
    onChange(Math.max(min, Math.min(max, steppedValue)));
  }, [isDragging, min, max, step, onChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ width: '100%', px: 1, py: 2, bgcolor: 'transparent' }}>
      <Box
        ref={sliderRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          position: 'relative',
          height: 6,
          borderRadius: 3,
          cursor: 'pointer',
          background: isDark 
            ? '#2a2a3a'
            : '#e5e7eb',
          boxShadow: isDark
            ? 'inset 0 2px 4px rgba(0,0,0,0.6)'
            : 'inset 0 2px 4px rgba(0,0,0,0.1)',
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Golden progress track */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${percentage}%`,
            borderRadius: 3,
            background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
            boxShadow: '0 0 8px rgba(251, 191, 36, 0.5)',
          }}
        />
        
        {/* Handle */}
        <Box
          sx={{
            position: 'absolute',
            left: `calc(${percentage}% - 12px)`,
            top: '50%',
            width: 24,
            height: 24,
            borderRadius: '50%',
            transform: `translateY(-50%) scale(${isDragging ? 1.1 : 1})`,
            background: isDark
              ? 'radial-gradient(circle, #374151 0%, #1f2937 70%, #111827 100%)'
              : 'radial-gradient(circle, #6b7280 0%, #4b5563 70%, #374151 100%)',
            boxShadow: `
              0 4px 12px rgba(0,0,0,0.3),
              inset 0 1px 0 rgba(255,255,255,0.1),
              inset 0 -1px 2px rgba(0,0,0,0.3)
            `,
            cursor: isDragging ? 'grabbing' : 'grab',
            transition: 'all 0.2s ease',
            zIndex: 2,
            
            '&::before': {
              content: '"▲\\A▼"',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '8px',
              color: '#9ca3af',
              fontWeight: 700,
              lineHeight: 0.8,
              whiteSpace: 'pre',
              textAlign: 'center',
            }
          }}
        />
      </Box>
      
      {/* Value display */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
        <Typography
          sx={{
            fontSize: '32px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 2px 4px rgba(251, 191, 36, 0.3))',
            fontFamily: '"Kollektif", sans-serif',
            lineHeight: 1,
          }}
        >
          {value}
        </Typography>
        
        <Typography
          sx={{
            fontSize: '12px',
            color: isDark ? 'rgba(251, 191, 36, 0.7)' : 'text.secondary',
            fontWeight: 600,
            alignSelf: 'flex-end',
            mb: 0.5,
          }}
        >
          {suffix.trim()}
        </Typography>
      </Box>
    </Box>
  );
};

export default Slider3D; 