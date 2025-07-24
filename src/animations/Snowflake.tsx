import React from 'react';
import { Box } from '@mui/material';

const Snowflake: React.FC = () => {
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
        '&::after': {
          content: '"❄️"',
          position: 'absolute',
          top: '-10%',
          left: '50%',
          fontSize: '2em',
          color: 'white',
          animation: 'fall 10s linear infinite',
          textShadow: '0 0 5px rgba(255,255,255,0.7)',
        },
        '@keyframes fall': {
          '0%': { transform: 'translate(-50%, 0%) rotate(0deg)' },
          '100%': { transform: 'translate(-50%, 1100%) rotate(360deg)' },
        },
      }}
    />
  );
};

export default Snowflake; 