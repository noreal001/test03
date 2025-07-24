import React from 'react';
import { Box } from '@mui/material';

const Smoke: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 0,
        background: 'transparent',
        '& .smoke': {
          position: 'absolute',
          background: 'rgba(105,105,105, 0.3)',
          borderRadius: '50%',
          animation: 'smokeRise 20s infinite linear',
          filter: 'blur(10px)',
        },
        '& .smoke:nth-of-type(1)': { width: '100px', height: '100px', left: '10%', top: '80%', animationDuration: '20s', animationDelay: '0s' },
        '& .smoke:nth-of-type(2)': { width: '150px', height: '150px', left: '30%', top: '90%', animationDuration: '25s', animationDelay: '5s' },
        '& .smoke:nth-of-type(3)': { width: '80px', height: '80px', left: '60%', top: '70%', animationDuration: '18s', animationDelay: '10s' },
        '& .smoke:nth-of-type(4)': { width: '120px', height: '120px', left: '80%', top: '85%', animationDuration: '22s', animationDelay: '15s' },
        '@keyframes smokeRise': {
          '0%': { transform: 'translateY(0) scale(0.5)', opacity: 0 },
          '50%': { opacity: 1 },
          '100%': { transform: 'translateY(-100vh) scale(1.5)', opacity: 0 },
        },
      }}
    >
      {[...Array(10)].map((_, i) => (
        <Box key={i} className="smoke" sx={{
          width: `${Math.random() * 100 + 50}px`,
          height: `${Math.random() * 100 + 50}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 20 + 80}%`,
          animationDuration: `${Math.random() * 10 + 15}s`,
          animationDelay: `${Math.random() * 10}s`,
        }} />
      ))}
    </Box>
  );
};

export default Smoke; 