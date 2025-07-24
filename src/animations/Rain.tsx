import React from 'react';
import { Box } from '@mui/material';

const Rain = () => {
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
        // Simple rain animation using pseudo-elements
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(transparent, rgba(173, 216, 230, 0.5), transparent)',
          animation: 'rain 1s linear infinite',
          opacity: 0.7,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(transparent, rgba(173, 216, 230, 0.5), transparent)',
          animation: 'rain 1.2s linear infinite 0.5s',
          opacity: 0.7,
        },
        '@keyframes rain': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      }}
    />
  );
};

export default Rain; 