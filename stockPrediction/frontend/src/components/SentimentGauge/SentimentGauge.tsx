import React from 'react';
import { Box, Typography } from '@mui/material';

interface SentimentGaugeProps {
  value: number; // -1 to 1
  size?: number;
}

const SentimentGauge: React.FC<SentimentGaugeProps> = ({ value, size = 100 }) => {
  // Normalize value to 0-1 range for display
  const normalizedValue = (value + 1) / 2;
  
  // Determine color based on sentiment
  const getColor = (sentiment: number) => {
    if (sentiment > 0.6) return '#4caf50'; // Green
    if (sentiment > 0.4) return '#8bc34a'; // Light green
    if (sentiment > -0.4) return '#ffc107'; // Yellow
    if (sentiment > -0.6) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment > 0.6) return 'Very Bullish';
    if (sentiment > 0.2) return 'Bullish';
    if (sentiment > -0.2) return 'Neutral';
    if (sentiment > -0.6) return 'Bearish';
    return 'Very Bearish';
  };

  const color = getColor(value);
  const radius = size / 2 - 10;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (normalizedValue * circumference);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Box sx={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e0e0e0"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{
              transition: 'stroke-dashoffset 0.5s ease-in-out',
            }}
          />
        </svg>
        
        {/* Center text */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" component="div" sx={{ color }}>
            {(value * 100).toFixed(0)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Score
          </Typography>
        </Box>
      </Box>
      
      <Typography variant="body2" sx={{ color, fontWeight: 'bold' }}>
        {getSentimentLabel(value)}
      </Typography>
    </Box>
  );
};

export default SentimentGauge;
