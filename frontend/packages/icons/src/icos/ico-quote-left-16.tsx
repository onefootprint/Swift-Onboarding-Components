import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoQuoteLeft16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M5.95 3.39a.5.5 0 0 0-.1.01c-.055.01-2.08.36-3.477 2.04C1.189 6.86 1.099 8.264 1.03 9.277c-.002.029 0 .056.002.084l-.001.035c0 1.46.955 3.213 3.285 3.214 1.783 0 3.155-1.325 3.155-3.214 0-1.246-.56-3.214-3.08-3.214-.495 0-.946.087-1.348.243.063-.092.13-.184.2-.276.705-.91 1.814-1.536 2.818-1.775a.5.5 0 0 0-.111-.985Zm7.5 0a.5.5 0 0 0-.1.01c-.055.01-2.08.36-3.477 2.04C8.689 6.86 8.599 8.264 8.53 9.277c-.002.029 0 .056.002.084l-.001.035c0 1.46.955 3.213 3.285 3.214 1.783 0 3.155-1.325 3.155-3.214 0-1.246-.56-3.214-3.08-3.214-.495 0-.946.087-1.348.243.063-.092.13-.184.2-.276.705-.91 1.815-1.536 2.819-1.775a.5.5 0 0 0-.112-.985Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoQuoteLeft16;
