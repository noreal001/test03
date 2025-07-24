import React from 'react';
import { Box } from '@mui/material';

const Stars: React.FC = () => {
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
        // Generate multiple stars
        '& .star': {
          position: 'absolute',
          backgroundColor: 'white',
          borderRadius: '50%',
          animation: 'twinkle 1.5s infinite alternate, fallAndFade 10s linear infinite',
          opacity: 0,
        },
        // Loop to create multiple stars with varying sizes and positions
        // This is a simplified representation; in a real app, you'd generate these dynamically or with more complex CSS
        '& .star:nth-of-type(1)': { width: '2px', height: '2px', top: '10%', left: '20%', animationDelay: '0s, 0s' },
        '& .star:nth-of-type(2)': { width: '3px', height: '3px', top: '30%', left: '70%', animationDelay: '0.5s, 2s' },
        '& .star:nth-of-type(3)': { width: '1px', height: '1px', top: '50%', left: '40%', animationDelay: '1s, 4s' },
        '& .star:nth-of-type(4)': { width: '2px', height: '2px', top: '70%', left: '10%', animationDelay: '1.5s, 6s' },
        '& .star:nth-of-type(5)': { width: '3px', height: '3px', top: '20%', left: '90%', animationDelay: '2s, 8s' },

        '@keyframes twinkle': {
          '0%': { opacity: 0 },
          '50%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
        '@keyframes fallAndFade': {
          '0%': { transform: 'translateY(0)', opacity: 1 },
          '100%': { transform: 'translateY(100vh)', opacity: 0 },
        },
      }}
    >
      {[...Array(20)].map((_, i) => (
        <Box key={i} className="star" sx={{
          width: `${Math.random() * 3 + 1}px`,
          height: `${Math.random() * 3 + 1}px`,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s, ${Math.random() * 10}s`,
        }} />
      ))}
    </Box>
  );
};

export default Stars; 